const otpStore = {};

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.saveOTP = (key, otp) => {
  otpStore[key] = {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  };
};

exports.verifyOTP = (key, otp) => {
  const stored = otpStore[key];
  if (!stored) return { valid: false, message: 'OTP not found' };
  if (Date.now() > stored.expiresAt) return { valid: false, message: 'OTP expired' };
  if (stored.code !== otp) return { valid: false, message: 'Invalid OTP' };
  delete otpStore[key];
  return { valid: true };
};

exports.sendOTP = (phone, otp) => {
  console.log(`Mock OTP sent to ${phone}: ${otp}`);
  return true;
};
