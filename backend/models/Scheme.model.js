const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    schemeId: { type: String, required: true, unique: true },
    schemeName: { type: String, required: true },
    description: { type: String, required: true },
    ownerMinistryCode: { type: String, required: true },
    ownerMinistryName: { type: String, required: true },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    schemeType: {
      type: String,
      enum: ['central_sector', 'centrally_sponsored', 'state_scheme'],
      required: true
    },
    fundingRatioCentre: { type: Number, default: 100 },
    fundingRatioState: { type: Number, default: 0 },
    totalBudgetCrore: { type: Number, required: true },
    perBeneficiaryAmount: { type: Number, default: 0 },
    beneficiaryAmountType: {
      type: String,
      enum: ['annual', 'monthly', 'one_time', 'service'],
      default: 'annual'
    },
    targetBeneficiaries: { type: Number, default: 0 },
    eligibilityRules: [
      {
        ruleText: { type: String },
        ruleCode: { type: String }
      }
    ],
    applicableStates: { type: [String], default: ['ALL'] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guidelineDocHash: { type: String, default: null },
    blockchainTxHash: { type: String, default: null },
    blockNumber: { type: Number, default: null },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'draft'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scheme', schemeSchema);
