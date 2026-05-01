const mongoose = require('mongoose');

const talukSchema = new mongoose.Schema(
  {
    talukId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    district: { type: String, required: true },
    districtCode: { type: String, required: true },
    officerName: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    walletAddress: { type: String, default: null },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

talukSchema.index({ districtCode: 1, name: 1 });

module.exports = mongoose.model('Taluk', talukSchema);
