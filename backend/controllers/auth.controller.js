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
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        jurisdiction: user.jurisdiction,
        walletAddress: user.walletAddress
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    return success(res, 'Profile loaded', { user: req.user });
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
