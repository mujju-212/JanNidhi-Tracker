const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { generateOTP, saveOTP, verifyOTP, sendOTP } = require('../services/otp.service');
const { success, error } = require('../utils/apiResponse');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const toUserPayload = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  designation: user.designation,
  employeeId: user.employeeId,
  role: user.role,
  jurisdiction: user.jurisdiction,
  walletAddress: user.walletAddress,
  profilePicture: user.profilePicture || null,
  isFirstLogin: !!user.isFirstLogin
});

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return error(res, 'Invalid credentials', 401);

    const match = await user.comparePassword(password);
    if (!match) return error(res, 'Invalid credentials', 401);

    const otp = generateOTP();
    saveOTP(user._id.toString(), otp);
    sendOTP(user.phone, otp);

    return success(res, 'OTP sent to registered phone', {
      userId: user._id,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
};

exports.sendOTP = async (req, res, next) => {
  try {
    const { userId, email } = req.body;
    let user = null;

    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) return error(res, 'User not found', 404);

    const otp = generateOTP();
    saveOTP(user._id.toString(), otp);
    sendOTP(user.phone, otp);

    return success(res, 'OTP sent', { userId: user._id });
  } catch (err) {
    next(err);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return error(res, 'userId and otp required', 400);

    const result = verifyOTP(userId, otp);
    if (!result.valid) return error(res, result.message, 400);

    const user = await User.findById(userId);
    if (!user) return error(res, 'User not found', 404);

    user.lastLogin = new Date();
    user.isFirstLogin = false;
    await user.save();

    const token = signToken(user);
    return success(res, 'OTP verified', {
      token,
      role: user.role,
      user: toUserPayload(user)
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    return success(res, 'Profile loaded', { user: toUserPayload(req.user) });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, designation, profilePicture } = req.body || {};
    const updates = {};

    if (typeof fullName === 'string') updates.fullName = fullName.trim();
    if (typeof designation === 'string') updates.designation = designation.trim();
    if (profilePicture === null) {
      updates.profilePicture = null;
    } else if (typeof profilePicture === 'string') {
      // Keep profile payload bounded to avoid oversized documents.
      if (profilePicture.length > 2_000_000) {
        return error(res, 'Profile image too large. Please use a smaller image.', 400);
      }
      updates.profilePicture = profilePicture;
    }

    if (!Object.keys(updates).length) {
      return error(res, 'No profile changes provided', 400);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    return success(res, 'Profile updated', { user: toUserPayload(user) });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    return success(res, 'Logged out', null);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return error(res, 'Old and new password required', 400);
    }

    const user = await User.findById(req.user._id);
    const match = await user.comparePassword(oldPassword);
    if (!match) return error(res, 'Old password incorrect', 400);

    user.password = newPassword;
    await user.save();

    return success(res, 'Password updated', null);
  } catch (err) {
    next(err);
  }
};
