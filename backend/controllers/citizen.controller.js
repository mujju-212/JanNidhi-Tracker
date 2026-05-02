const jwt = require('jsonwebtoken');
const Beneficiary = require('../models/Beneficiary.model');
const Payment = require('../models/Payment.model');
const Transaction = require('../models/Transaction.model');
const Complaint = require('../models/Complaint.model');
const mockAadhaar = require('../services/mock.aadhaar');
const { generateOTP, saveOTP, verifyOTP, sendOTP } = require('../services/otp.service');
const { hashAadhaar } = require('../utils/hashAadhaar');
const { success, error } = require('../utils/apiResponse');

const signCitizenToken = (aadhaarHash) => {
  return jwt.sign(
    { type: 'citizen', aadhaarHash },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

exports.verifyAadhaar = async (req, res, next) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber) return error(res, 'Aadhaar number required', 400);

    const result = mockAadhaar.verifyAadhaar(aadhaarNumber);
    if (!result.verified) return error(res, result.message, 404);

    const otp = generateOTP();
    const aadhaarHash = hashAadhaar(aadhaarNumber);
    saveOTP(aadhaarHash, otp);
    sendOTP(result.data.phone, otp);

    return success(res, 'OTP sent', {
      aadhaarMasked: result.data.aadhaarMasked,
      aadhaarRef: aadhaarHash
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyCitizenOTP = async (req, res, next) => {
  try {
    const { aadhaarNumber, aadhaarRef, otp } = req.body;
    const aadhaarHash = aadhaarRef || (aadhaarNumber ? hashAadhaar(aadhaarNumber) : null);

    if (!aadhaarHash || !otp) return error(res, 'Aadhaar reference and OTP required', 400);

    const result = verifyOTP(aadhaarHash, otp);
    if (!result.valid) return error(res, result.message, 400);

    const token = signCitizenToken(aadhaarHash);
    return success(res, 'Citizen verified', { token });
  } catch (err) {
    next(err);
  }
};

exports.getMyBenefits = async (req, res, next) => {
  try {
    const beneficiary = await Beneficiary.findOne({ aadhaarHash: req.citizen.aadhaarHash });
    if (!beneficiary) return error(res, 'Not enrolled', 404);

    const payments = await Payment.find({ aadhaarHash: req.citizen.aadhaarHash })
      .sort({ createdAt: -1 })
      .select('schemeId amount status paidAt installmentNumber blockchainTxHash');

    const paymentByScheme = new Map();
    payments.forEach((payment) => {
      const current = paymentByScheme.get(payment.schemeId) || {
        totalPaid: 0,
        paymentsCount: 0,
        latestStatus: null,
        latestPaidAt: null,
        latestInstallment: null,
        latestBlockchainTxHash: null
      };
      current.totalPaid += Number(payment.amount || 0);
      current.paymentsCount += 1;
      if (!current.latestPaidAt || new Date(payment.paidAt || payment.createdAt) > new Date(current.latestPaidAt)) {
        current.latestStatus = payment.status;
        current.latestPaidAt = payment.paidAt || payment.createdAt;
        current.latestInstallment = payment.installmentNumber ?? null;
        current.latestBlockchainTxHash = payment.blockchainTxHash || null;
      }
      paymentByScheme.set(payment.schemeId, current);
    });

    const schemes = (beneficiary.enrolledSchemes || []).map((scheme) => {
      const paymentSummary = paymentByScheme.get(scheme.schemeId) || {
        totalPaid: 0,
        paymentsCount: 0,
        latestStatus: 'not_started',
        latestPaidAt: null,
        latestInstallment: null,
        latestBlockchainTxHash: null
      };
      return {
        schemeId: scheme.schemeId,
        schemeName: scheme.schemeName,
        enrollmentStatus: scheme.status || 'active',
        enrolledOn: scheme.enrolledOn,
        enrolledByDistrict: scheme.enrolledByDistrict,
        enrollmentTxHash: scheme.blockchainEnrollTxHash || null,
        totalPaid: Number((paymentSummary.totalPaid / 1).toFixed(2)),
        paymentsCount: paymentSummary.paymentsCount,
        latestPaymentStatus: paymentSummary.latestStatus,
        latestPaidAt: paymentSummary.latestPaidAt,
        latestInstallment: paymentSummary.latestInstallment,
        latestPaymentTxHash: paymentSummary.latestBlockchainTxHash
      };
    });

    return success(res, 'Benefits loaded', {
      citizen: {
        name: beneficiary.fullName,
        aadhaarMasked: beneficiary.aadhaarMasked,
        bankName: beneficiary.bankName,
        ifscCode: beneficiary.ifscCode,
        state: beneficiary.state,
        district: beneficiary.district
      },
      schemes
    });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentJourney = async (req, res, next) => {
  try {
    const { schemeId } = req.params;
    const aadhaarHash = req.citizen.aadhaarHash;

    const beneficiary = await Beneficiary.findOne({ aadhaarHash });
    if (!beneficiary) return error(res, 'Not enrolled', 404);

    const enrollment = beneficiary.enrolledSchemes.find((item) => item.schemeId === schemeId);
    if (!enrollment) return error(res, 'Not enrolled in this scheme', 404);

    const chainTx = await Transaction.find({ schemeId, status: 'confirmed' })
      .sort({ createdAt: 1 })
      .select('transactionId fromRole fromName toName amountCrore blockchainTxHash blockNumber createdAt');

    const payments = await Payment.find({ aadhaarHash, schemeId })
      .sort({ createdAt: 1 })
      .select('paymentId amount status blockchainTxHash blockNumber paidAt installmentNumber');

    return success(res, 'Payment journey loaded', {
      beneficiary: {
        name: beneficiary.fullName,
        aadhaar: beneficiary.aadhaarMasked,
        bank: `${beneficiary.bankName} ...${beneficiary.ifscCode.slice(-4)}`
      },
      enrollment: {
        enrolledOn: enrollment.enrolledOn,
        district: enrollment.enrolledByDistrict,
        blockTxHash: enrollment.blockchainEnrollTxHash
      },
      fundChain: chainTx,
      myPayments: payments
    });
  } catch (err) {
    next(err);
  }
};

exports.raiseComplaint = async (req, res, next) => {
  try {
    const {
      complaintType,
      schemeId,
      schemeName,
      installmentNumber,
      description,
      expectedAmount,
      receivedAmount,
      state,
      district,
      isAnonymous,
      directToAuditor,
      citizenPhone
    } = req.body;

    if (!complaintType || !description) return error(res, 'Complaint type and description required', 400);

    const aadhaarHash = req.citizen.aadhaarHash;
    const beneficiary = await Beneficiary.findOne({ aadhaarHash });

    const complaint = await Complaint.create({
      complaintId: `CMP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      aadhaarHash,
      aadhaarMasked: beneficiary?.aadhaarMasked || 'XXXX XXXX 0000',
      citizenPhone,
      complaintType,
      schemeId,
      schemeName,
      installmentNumber,
      description,
      expectedAmount,
      receivedAmount,
      state,
      district,
      isAnonymous: !!isAnonymous,
      directToAuditor: !!directToAuditor,
      status: 'received'
    });

    return success(res, 'Complaint raised', complaint, 201);
  } catch (err) {
    next(err);
  }
};

exports.getComplaintStatus = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
      aadhaarHash: req.citizen.aadhaarHash
    });
    if (!complaint) return error(res, 'Complaint not found', 404);
    return success(res, 'Complaint loaded', complaint);
  } catch (err) {
    next(err);
  }
};
