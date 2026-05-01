const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    blockchainTxHash: { type: String, default: null },
    blockNumber: { type: Number, default: null },
    fromRole: { type: String },
    fromWalletAddress: { type: String },
    fromName: { type: String },
    fromCode: { type: String },
    toRole: { type: String },
    toWalletAddress: { type: String },
    toName: { type: String },
    toCode: { type: String },
    amountCrore: { type: Number, required: true },
    schemeId: { type: String, required: true },
    schemeName: { type: String, required: true },
    financialYear: { type: String, required: true },
    quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], default: 'Q1' },
    ministryCode: { type: String },
    stateCode: { type: String },
    districtCode: { type: String },
    sanctionDocHash: { type: String, default: null },
    ucDocHash: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'blocked'],
      default: 'pending'
    },
    isFlagged: { type: Boolean, default: false },
    flagId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flag', default: null },
    validations: {
      amountCheck: { type: Boolean, default: false },
      walletCheck: { type: Boolean, default: false },
      ucCheck: { type: Boolean, default: false },
      schemeActiveCheck: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

transactionSchema.index({ ministryCode: 1, stateCode: 1, status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
