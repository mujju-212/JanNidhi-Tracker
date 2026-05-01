const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    employeeId: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    designation: { type: String, required: true },
    profilePicture: { type: String, default: null },
    role: {
      type: String,
      enum: [
        'super_admin',
        'ministry_admin',
        'state_admin',
        'district_admin',
        'central_cag',
        'state_auditor'
      ],
      required: true
    },
    jurisdiction: {
      ministry: { type: String, default: null },
      ministryCode: { type: String, default: null },
      state: { type: String, default: null },
      stateCode: { type: String, default: null },
      district: { type: String, default: null },
      districtCode: { type: String, default: null }
    },
    walletAddress: { type: String, unique: true, sparse: true },
    budgetCapCrore: { type: Number, default: 0 },
    assignedSchemes: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFirstLogin: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    otp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null }
    },
    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
