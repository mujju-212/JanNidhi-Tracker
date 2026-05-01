const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');
const Scheme = require('../models/Scheme.model');
const Flag = require('../models/Flag.model');
const { generateWallet } = require('../utils/generateWallet');
const blockchainService = require('../services/blockchain.service');
const flagEngine = require('../services/flag.engine');
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
    const stateCode = req.user.jurisdiction.stateCode;
    const received = await sumAmount({ toCode: stateCode, status: 'confirmed' });
    const released = await sumAmount({ fromCode: stateCode, status: 'confirmed' });
    const flags = await Flag.countDocuments({ stateCode, status: { $ne: 'resolved' } });

    return success(res, 'Dashboard loaded', { received, released, flags });
  } catch (err) {
    next(err);
  }
};

exports.getReceivedFunds = async (req, res, next) => {
  try {
    const stateCode = req.user.jurisdiction.stateCode;
    const transactions = await Transaction.find({ toCode: stateCode, status: 'confirmed' }).sort({ createdAt: -1 });
    return success(res, 'Funds received', transactions);
  } catch (err) {
    next(err);
  }
};

exports.createDistrictAdmin = async (req, res, next) => {
  try {
    const { district, districtCode, fullName, email, phone, employeeId, designation } = req.body;
    if (!district || !districtCode || !fullName || !email || !employeeId) {
      return error(res, 'Missing required fields', 400);
    }

    const existing = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) return error(res, 'User already exists', 409);

    const wallet = generateWallet();
    const tempPassword = `District@${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: tempPassword,
      employeeId,
      phone,
      designation: designation || 'District Collector',
      role: 'district_admin',
      jurisdiction: {
        state: req.user.jurisdiction.state,
        stateCode: req.user.jurisdiction.stateCode,
        district,
        districtCode
      },
      walletAddress: wallet.address,
      createdBy: req.user._id,
      isFirstLogin: true
    });

    return success(res, 'District admin created', {
      id: user._id,
      walletAddress: wallet.address,
      walletPrivateKey: wallet.privateKey,
      walletMnemonic: wallet.mnemonic,
      tempPassword
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllDistricts = async (req, res, next) => {
  try {
    const stateCode = req.user.jurisdiction.stateCode;
    const districts = await User.find({ role: 'district_admin', 'jurisdiction.stateCode': stateCode }).select('-password');
    return success(res, 'Districts loaded', districts);
  } catch (err) {
    next(err);
  }
};

exports.releaseFundsToDistrict = async (req, res, next) => {
  try {
    const { districtCode, districtWalletAddress, amountCrore, schemeId, schemeName, ucDocHash } = req.body;
    const state = req.user;

    const received = await Transaction.aggregate([
      { $match: { toCode: state.jurisdiction.stateCode, status: { $in: ['confirmed', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const released = await Transaction.aggregate([
      { $match: { fromCode: state.jurisdiction.stateCode, status: { $in: ['confirmed', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);

    const available = (received[0]?.total || 0) - (released[0]?.total || 0);
    if (amountCrore > available) {
      return error(res, `Insufficient balance. Available: ${available} Cr`, 400);
    }

    const transactionId = `TXN-${Date.now()}-${state.jurisdiction.stateCode}-${districtCode}`;

    const tx = await Transaction.create({
      transactionId,
      blockchainTxHash: 'PENDING',
      blockNumber: null,
      fromRole: 'state_admin',
      fromCode: state.jurisdiction.stateCode,
      fromName: state.jurisdiction.state,
      toRole: 'district_admin',
      toCode: districtCode,
      toWalletAddress: districtWalletAddress,
      amountCrore,
      schemeId,
      schemeName,
      financialYear: req.body.financialYear || '2024-25',
      stateCode: state.jurisdiction.stateCode,
      districtCode,
      ucDocHash,
      status: 'confirmed'
    });

    const io = req.app.get('io');
    emitToAuditors(io, 'new_transaction', { transaction: tx, type: 'DISTRICT_RELEASE', severity: 'normal' });
    flagEngine.runFlagChecks(tx, io).catch(e => console.error('Flag check error:', e.message));

    res.json({ success: true, message: 'Funds released to district', data: { transactionId } });

    // Blockchain in background
    const { blockchainReady } = require('../config/blockchain').getContracts();
    if (blockchainReady) {
      blockchainService.releaseFunds(districtWalletAddress, amountCrore, transactionId, schemeId)
        .then(async (bcResult) => {
          await Transaction.findByIdAndUpdate(tx._id, {
            blockchainTxHash: bcResult.txHash, blockNumber: bcResult.blockNumber
          });
          console.log(`✅ Blockchain confirmed: ${transactionId}`);
        }).catch(err => console.error(`❌ Blockchain failed: ${transactionId}:`, err.message));
    }
  } catch (err) {
    next(err);
  }
};


exports.getTransactions = async (req, res, next) => {
  try {
    const stateCode = req.user.jurisdiction.stateCode;
    const transactions = await Transaction.find({
      $or: [{ fromCode: stateCode }, { toCode: stateCode }]
    }).sort({ createdAt: -1 });
    return success(res, 'Transactions loaded', transactions);
  } catch (err) {
    next(err);
  }
};

exports.getFlags = async (req, res, next) => {
  try {
    const stateCode = req.user.jurisdiction.stateCode;
    const flags = await Flag.find({ stateCode }).sort({ createdAt: -1 });
    return success(res, 'Flags loaded', flags);
  } catch (err) {
    next(err);
  }
};

exports.createStateScheme = async (req, res, next) => {
  try {
    const { schemeId, schemeName, description, totalBudgetCrore, perBeneficiaryAmount, startDate, endDate } = req.body;
    const state = req.user;

    const scheme = await Scheme.create({
      schemeId,
      schemeName,
      description: description || schemeName,
      ownerMinistryCode: state.jurisdiction.stateCode,
      ownerMinistryName: `State of ${state.jurisdiction.state}`,
      createdByUser: state._id,
      schemeType: 'state_scheme',
      totalBudgetCrore: Number(totalBudgetCrore || 0),
      perBeneficiaryAmount: Number(perBeneficiaryAmount || 0),
      beneficiaryAmountType: req.body.beneficiaryAmountType || 'annual',
      targetBeneficiaries: req.body.targetBeneficiaries || 0,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 365 * 86400000),
      status: 'active'
    });

    return success(res, 'State scheme created', scheme, 201);
  } catch (err) {
    next(err);
  }
};

exports.submitUC = async (req, res, next) => {
  try {
    const { schemeId, quarter, financialYear, amountUtilizedCrore, docHash } = req.body;
    const state = req.user;

    const tx = await Transaction.create({
      transactionId: `UC-${Date.now()}-${state.jurisdiction.stateCode}`,
      blockchainTxHash: `UC-HASH-${Date.now()}`,
      fromRole: 'state_admin',
      fromCode: state.jurisdiction.stateCode,
      fromName: state.jurisdiction.state,
      toRole: 'ministry_admin',
      toCode: 'UC_SUBMISSION',
      toName: 'Utilization Certificate',
      amountCrore: Number(amountUtilizedCrore || 0),
      schemeId,
      schemeName: `UC - ${schemeId}`,
      financialYear: financialYear || '2024-25',
      quarter,
      stateCode: state.jurisdiction.stateCode,
      status: 'confirmed',
      ucDocHash: docHash
    });

    return success(res, 'UC submitted', { transactionId: tx.transactionId }, 201);
  } catch (err) {
    next(err);
  }
};

exports.releaseMatchingFund = async (req, res, next) => {
  try {
    const { schemeId, matchingAmountCrore, ucRef, financialYear } = req.body;
    const state = req.user;

    const tx = await Transaction.create({
      transactionId: `MATCH-${Date.now()}-${state.jurisdiction.stateCode}`,
      blockchainTxHash: `MATCH-HASH-${Date.now()}`,
      fromRole: 'state_admin',
      fromCode: state.jurisdiction.stateCode,
      fromName: `${state.jurisdiction.state} (State Share)`,
      toRole: 'state_admin',
      toCode: state.jurisdiction.stateCode,
      toName: `${state.jurisdiction.state} Matching Pool`,
      amountCrore: Number(matchingAmountCrore || 0),
      schemeId,
      schemeName: `State Matching - ${schemeId}`,
      financialYear: financialYear || '2024-25',
      stateCode: state.jurisdiction.stateCode,
      status: 'confirmed',
      ucDocHash: ucRef
    });

    return success(res, 'Matching fund released', { transactionId: tx.transactionId }, 201);
  } catch (err) {
    next(err);
  }
};
