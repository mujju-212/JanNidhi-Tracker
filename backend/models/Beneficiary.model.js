const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema(
  {
    aadhaarHash: { type: String, required: true },
    aadhaarMasked: { type: String, required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['M', 'F', 'T'] },
    bankAccountHash: { type: String, required: true },
    bankName: { type: String, required: true },
    ifscCode: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    panchayat: { type: String },
    village: { type: String },
    pincode: { type: String },
    enrolledSchemes: [
      {
        schemeId: { type: String, required: true },
        schemeName: { type: String, required: true },
        enrolledOn: { type: Date, default: Date.now },
        enrolledByDistrict: { type: String },
        status: { type: String, enum: ['active', 'suspended', 'completed'], default: 'active' },
        blockchainEnrollTxHash: { type: String },
        enrollBlockNumber: { type: Number }
      }
    ],
    proofDocuments: [
      {
        docType: { type: String },
        ipfsHash: { type: String },
        uploadedOn: { type: Date, default: Date.now }
      }
    ],
    enrolledByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrollmentTxHash: { type: String },
    enrollmentBlockNumber: { type: Number },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

beneficiarySchema.index({ aadhaarHash: 1 });
beneficiarySchema.index({ district: 1, state: 1 });

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
