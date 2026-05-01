const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    aadhaarHash: { type: String, required: true },
    aadhaarMasked: { type: String, required: true },
    citizenPhone: { type: String },
    complaintType: {
      type: String,
      enum: [
        'payment_not_received',
        'payment_delayed',
        'wrong_amount',
        'not_enrolled',
        'duplicate_payment',
        'bribery',
        'ghost_beneficiary'
      ],
      required: true
    },
    schemeId: { type: String },
    schemeName: { type: String },
    installmentNumber: { type: Number },
    description: { type: String, required: true },
    expectedAmount: { type: Number, default: null },
    receivedAmount: { type: Number, default: null },
    state: { type: String },
    district: { type: String },
    isAnonymous: { type: Boolean, default: false },
    directToAuditor: { type: Boolean, default: false },
    adminResponse: {
      responseText: { type: String, default: null },
      respondedAt: { type: Date, default: null }
    },
    status: {
      type: String,
      enum: ['received', 'under_review', 'responded', 'resolved', 'escalated_to_cag'],
      default: 'received'
    },
    escalatedToFlagId: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
