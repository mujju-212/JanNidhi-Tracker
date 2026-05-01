const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema(
  {
    flagId: { type: String, required: true, unique: true },
    transactionId: { type: String, required: true },
    blockchainTxHash: { type: String, required: true },
    flagType: {
      type: String,
      enum: ['critical', 'high', 'medium', 'info'],
      required: true
    },
    flagCode: {
      type: String,
      enum: [
        'AMOUNT_MISMATCH',
        'UNKNOWN_WALLET',
        'SPEED_ANOMALY',
        'DUPLICATE_PAYMENT',
        'ROUND_FIGURE',
        'INACTIVE_SCHEME',
        'DEADLINE_BREACH',
        'MANUAL_AUDIT',
        'CITIZEN_COMPLAINT',
        'OTHER'
      ],
      required: true
    },
    flagReason: { type: String, required: true },
    raisedByType: {
      type: String,
      enum: ['auto_system', 'cag_auditor', 'state_auditor', 'citizen'],
      required: true
    },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ministryCode: { type: String },
    stateCode: { type: String },
    districtCode: { type: String },
    responsibleAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responseDeadline: { type: Date, required: true },
    adminResponse: {
      responseText: { type: String, default: null },
      responseDocHash: { type: String, default: null },
      respondedAt: { type: Date, default: null },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    },
    cagDecision: {
      decision: {
        type: String,
        enum: ['resolved', 'rejected_needs_more_info', 'escalated', 'pending'],
        default: 'pending'
      },
      decisionNote: { type: String, default: null },
      decidedAt: { type: Date, default: null },
      decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    },
    escalationTarget: {
      type: String,
      enum: ['finance_ministry', 'ministry_of_law', 'cbi_ed'],
      default: null
    },
    flagBlockchainTxHash: { type: String, default: null },
    status: {
      type: String,
      enum: ['active', 'awaiting_response', 'under_review', 'resolved', 'escalated'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flag', flagSchema);
