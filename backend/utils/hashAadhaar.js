const crypto = require('crypto');

exports.hashAadhaar = (aadhaarNumber) => {
  const salt = process.env.JWT_SECRET || 'jannidhi';
  return crypto.createHash('sha256').update(aadhaarNumber + salt).digest('hex');
};
