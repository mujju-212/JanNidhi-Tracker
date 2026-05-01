const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    aadhaarHash: { type: String, required: true },
    beneficiaryDbId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },
    schemeId: { type: String, required: true },
    schemeName: { type: String, required: true },
    installmentNumber: { type: Number, required: true },
    financialYear: { type: String, required: true },
    amount: { type: Number, required: true },
    state: { type: String },
    district: { type: String },
    bankName: { type: String },
    ifscCode: { type: String },
    bankAccountHash: { type: String },
    pfmsRef: { type: String, default: null },
    npciRef: { type: String, default: null },
    blockchainTxHash: { type: String, default: null },
    blockNumber: { type: Number, default: null },
    status: {
      type: String,
      enum: ['initiated', 'processing', 'success', 'failed', 'returned'],
      default: 'initiated'
    },
    failureReason: { type: String, default: null },
    batchId: { type: String, default: null },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isHeld: { type: Boolean, default: false },
    holdReason: { type: String, default: null },
    paidAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
