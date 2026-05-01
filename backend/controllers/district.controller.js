const Beneficiary = require('../models/Beneficiary.model');
const Transaction = require('../models/Transaction.model');
const Payment = require('../models/Payment.model');
const Complaint = require('../models/Complaint.model');
const Flag = require('../models/Flag.model');
const blockchainService = require('../services/blockchain.service');
const flagEngine = require('../services/flag.engine');
const mockAadhaar = require('../services/mock.aadhaar');
const mockNPCI = require('../services/mock.npci');
const { hashAadhaar } = require('../utils/hashAadhaar');
const { emitToAuditors } = require('../config/socket');
const { success, error } = require('../utils/apiResponse');

const sumAmount = async (match) => {
  const result = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amountCrore' } } }
  ]);
  return result[0]?.total || 0;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const districtCode = req.user.jurisdiction.districtCode;
    const districtName = req.user.jurisdiction.district;
    const received = await sumAmount({ toCode: districtCode, status: 'confirmed' });
    const payments = await Payment.countDocuments({ district: districtName, status: 'success' });
    const beneficiaries = await Beneficiary.countDocuments({ district: districtName });
    return success(res, 'Dashboard loaded', { received, payments, beneficiaries });
  } catch (err) {
    next(err);
  }
};

exports.getReceivedFunds = async (req, res, next) => {
  try {
    const districtCode = req.user.jurisdiction.districtCode;
    const transactions = await Transaction.find({ toCode: districtCode }).sort({ createdAt: -1 });
    return success(res, 'Funds received', transactions);
  } catch (err) {
    next(err);
  }
};

exports.verifyAadhaar = async (req, res, next) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber) return error(res, 'Aadhaar number required', 400);
    const result = mockAadhaar.verifyAadhaar(aadhaarNumber);
    if (!result.verified) return error(res, result.message, 404);
    return success(res, 'Aadhaar verified', result.data);
  } catch (err) {
    next(err);
  }
};

exports.addBeneficiary = async (req, res, next) => {
  try {
    const { aadhaarNumber, schemeId, schemeName, proofDocHash } = req.body;
    if (!aadhaarNumber || !schemeId || !schemeName) {
      return error(res, 'Missing required fields', 400);
    }

    const aadhaarHash = hashAadhaar(aadhaarNumber);
    const aadhaarMasked = `XXXX XXXX ${aadhaarNumber.slice(-4)}`;

    const aadhaarResult = mockAadhaar.verifyAadhaar(aadhaarNumber);
    if (!aadhaarResult.verified) return error(res, 'Aadhaar not found', 400);

    const bankResult = mockNPCI.fetchBankDetails(aadhaarNumber);
    if (!bankResult.found) return error(res, 'No bank linked to this Aadhaar', 400);

    const exists = await Beneficiary.findOne({ aadhaarHash, 'enrolledSchemes.schemeId': schemeId });
    if (exists) return error(res, 'Beneficiary already enrolled in this scheme', 409);

    const bcResult = await blockchainService.enrollBeneficiary(aadhaarHash, schemeId);

    const beneficiary = await Beneficiary.findOneAndUpdate(
      { aadhaarHash },
      {
        $setOnInsert: {
          aadhaarHash,
          aadhaarMasked,
          fullName: aadhaarResult.data.name,
          dateOfBirth: aadhaarResult.data.dob,
          gender: aadhaarResult.data.gender,
          bankAccountHash: hashAadhaar(bankResult.data.accountMasked),
          bankName: bankResult.data.bankName,
          ifscCode: bankResult.data.ifscCode,
          state: aadhaarResult.data.state,
          district: aadhaarResult.data.district,
          enrolledByUser: req.user._id
        },
        $push: {
          enrolledSchemes: {
            schemeId,
            schemeName,
            enrolledByDistrict: req.user.jurisdiction.district,
            blockchainEnrollTxHash: bcResult.txHash,
            enrollBlockNumber: bcResult.blockNumber
          }
        },
        $set: {
          enrollmentTxHash: bcResult.txHash,
          enrollmentBlockNumber: bcResult.blockNumber
        }
      },
      { upsert: true, new: true }
    );

    return success(res, 'Beneficiary enrolled', {
      beneficiaryId: beneficiary._id,
      blockchainTxHash: bcResult.txHash,
      blockNumber: bcResult.blockNumber
    }, 201);
  } catch (err) {
    next(err);
  }
};

exports.getBeneficiaries = async (req, res, next) => {
  try {
    const district = req.user.jurisdiction.district;
    const list = await Beneficiary.find({ district }).sort({ createdAt: -1 });
    return success(res, 'Beneficiaries loaded', list);
  } catch (err) {
    next(err);
  }
};

exports.checkDuplicate = async (req, res, next) => {
  try {
    const { aadhaarNumber, schemeId } = req.query;
    if (!aadhaarNumber || !schemeId) return error(res, 'aadhaarNumber and schemeId required', 400);
    const aadhaarHash = hashAadhaar(aadhaarNumber);
    const exists = await Beneficiary.findOne({ aadhaarHash, 'enrolledSchemes.schemeId': schemeId });
    return success(res, 'Duplicate check complete', { duplicate: !!exists });
  } catch (err) {
    next(err);
  }
};

exports.triggerPayment = async (req, res, next) => {
  try {
    const { schemeId, schemeName, installmentNumber, financialYear, amountPerBeneficiary } = req.body;
    const district = req.user;

    const beneficiaries = await Beneficiary.find({
      district: district.jurisdiction.district,
      'enrolledSchemes.schemeId': schemeId,
      'enrolledSchemes.status': 'active'
    });

    const totalAmount = beneficiaries.length * amountPerBeneficiary;

    const districtReceived = await Transaction.aggregate([
      { $match: { toCode: district.jurisdiction.districtCode, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const districtPaid = await Payment.aggregate([
      { $match: { district: district.jurisdiction.district, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const availableCrore = districtReceived[0]?.total || 0;
    const paidCrore = (districtPaid[0]?.total || 0) / 10000000;
    const totalAmountCrore = totalAmount / 10000000;

    if (totalAmountCrore > availableCrore - paidCrore) {
      const io = req.app.get('io');
      const flagData = {
        flagId: `FLAG-${Date.now()}-BLOCK`,
        transactionId: `BLOCKED-${Date.now()}`,
        blockchainTxHash: 'BLOCKED_BY_CONTRACT',
        flagType: 'critical',
        flagCode: 'AMOUNT_MISMATCH',
        flagReason: `District tried to pay ${totalAmountCrore.toFixed(2)} Cr but only ${(availableCrore - paidCrore).toFixed(2)} Cr available`,
        raisedByType: 'auto_system',
        districtCode: district.jurisdiction.districtCode,
        responseDeadline: new Date(Date.now() + 7 * 24 * 3600000),
        status: 'active'
      };
      await Flag.create(flagData);
      emitToAuditors(io, 'new_flag', { ...flagData, timestamp: new Date() });

      return error(res, 'Blocked: Payment exceeds available balance. Flag raised.', 400, {
        flagId: flagData.flagId
      });
    }

    const batchId = `BATCH-${Date.now()}`;
    const results = { success: 0, failed: 0, held: 0 };

    for (const ben of beneficiaries) {
      const isDuplicate = await Payment.findOne({
        aadhaarHash: ben.aadhaarHash,
        schemeId,
        installmentNumber,
        status: 'success'
      });

      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      if (isDuplicate) {
        results.held++;
        await Payment.create({
          paymentId,
          aadhaarHash: ben.aadhaarHash,
          beneficiaryDbId: ben._id,
          schemeId,
          schemeName,
          installmentNumber,
          financialYear,
          amount: amountPerBeneficiary,
          district: district.jurisdiction.district,
          bankName: ben.bankName,
          ifscCode: ben.ifscCode,
          status: 'failed',
          isHeld: true,
          holdReason: 'DUPLICATE_PAYMENT',
          triggeredBy: req.user._id,
          batchId
        });
        continue;
      }

      const bcResult = await blockchainService.recordPayment(
        paymentId,
        ben.aadhaarHash,
        schemeId,
        amountPerBeneficiary
      );

      await Payment.create({
        paymentId,
        aadhaarHash: ben.aadhaarHash,
        beneficiaryDbId: ben._id,
        schemeId,
        schemeName,
        installmentNumber,
        financialYear,
        amount: amountPerBeneficiary,
        district: district.jurisdiction.district,
        bankName: ben.bankName,
        ifscCode: ben.ifscCode,
        pfmsRef: `PFMS-${Date.now()}`,
        npciRef: `NPCI-${Date.now()}`,
        blockchainTxHash: bcResult.txHash,
        blockNumber: bcResult.blockNumber,
        status: 'success',
        paidAt: new Date(),
        triggeredBy: req.user._id,
        batchId
      });
      results.success++;
    }

    return success(res, 'Batch payment complete', {
      batchId,
      ...results,
      totalBeneficiaries: beneficiaries.length
    });
  } catch (err) {
    next(err);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const district = req.user.jurisdiction.district;
    const payments = await Payment.find({ district }).sort({ createdAt: -1 });
    return success(res, 'Payments loaded', payments);
  } catch (err) {
    next(err);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const district = req.user.jurisdiction.district;
    const complaints = await Complaint.find({ district }).sort({ createdAt: -1 });
    return success(res, 'Complaints loaded', complaints);
  } catch (err) {
    next(err);
  }
};

exports.getFlags = async (req, res, next) => {
  try {
    const districtCode = req.user.jurisdiction.districtCode;
    const flags = await Flag.find({ districtCode }).sort({ createdAt: -1 });
    return success(res, 'Flags loaded', flags);
  } catch (err) {
    next(err);
  }
};
