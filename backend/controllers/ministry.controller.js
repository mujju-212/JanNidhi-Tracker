const User = require('../models/User.model');
const Scheme = require('../models/Scheme.model');
const Transaction = require('../models/Transaction.model');
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
    const ministryCode = req.user.jurisdiction.ministryCode;
    const received = await sumAmount({ toCode: ministryCode, status: 'confirmed' });
    const released = await sumAmount({ fromCode: ministryCode, status: 'confirmed' });
    const schemes = await Scheme.countDocuments({ ownerMinistryCode: ministryCode });
    const flags = await Flag.countDocuments({ ministryCode, status: { $ne: 'resolved' } });

    return success(res, 'Dashboard loaded', { received, released, schemes, flags });
  } catch (err) {
    next(err);
  }
};

exports.getReceivedBudget = async (req, res, next) => {
  try {
    const ministryCode = req.user.jurisdiction.ministryCode;
    const transactions = await Transaction.find({ toCode: ministryCode, schemeId: 'BUDGET_ALLOCATION' }).sort({ createdAt: -1 });
    return success(res, 'Budget received', transactions);
  } catch (err) {
    next(err);
  }
};

exports.createScheme = async (req, res, next) => {
  try {
    const ministryCode = req.user.jurisdiction.ministryCode;
    const ministryName = req.user.jurisdiction.ministry;

    const {
      schemeId,
      schemeName,
      description,
      schemeType,
      totalBudgetCrore,
      perBeneficiaryAmount,
      beneficiaryAmountType,
      targetBeneficiaries,
      eligibilityRules,
      applicableStates,
      startDate,
      endDate,
      guidelineDocHash,
      fundingRatioCentre,
      fundingRatioState
    } = req.body;

    if (!schemeId || !schemeName || !description || !schemeType || !totalBudgetCrore) {
      return error(res, 'Missing required fields', 400);
    }

    const bcResult = await blockchainService.createScheme(
      schemeId,
      schemeName,
      ministryCode,
      totalBudgetCrore,
      startDate,
      endDate
    );

    const scheme = await Scheme.create({
      schemeId,
      schemeName,
      description,
      ownerMinistryCode: ministryCode,
      ownerMinistryName: ministryName,
      createdByUser: req.user._id,
      schemeType,
      fundingRatioCentre: fundingRatioCentre ?? 100,
      fundingRatioState: fundingRatioState ?? 0,
      totalBudgetCrore,
      perBeneficiaryAmount: perBeneficiaryAmount ?? 0,
      beneficiaryAmountType: beneficiaryAmountType || 'annual',
      targetBeneficiaries: targetBeneficiaries ?? 0,
      eligibilityRules: eligibilityRules || [],
      applicableStates: applicableStates || ['ALL'],
      startDate,
      endDate,
      guidelineDocHash: guidelineDocHash || null,
      blockchainTxHash: bcResult.txHash,
      blockNumber: bcResult.blockNumber,
      status: 'active'
    });

    return success(res, 'Scheme created', scheme, 201);
  } catch (err) {
    next(err);
  }
};

exports.getAllSchemes = async (req, res, next) => {
  try {
    const ministryCode = req.user.jurisdiction.ministryCode;
    const schemes = await Scheme.find({ ownerMinistryCode: ministryCode }).sort({ createdAt: -1 });
    return success(res, 'Schemes loaded', schemes);
  } catch (err) {
    next(err);
  }
};

exports.getSchemeById = async (req, res, next) => {
  try {
    const ministryCode = req.user.jurisdiction.ministryCode;
    const scheme = await Scheme.findOne({ schemeId: req.params.id, ownerMinistryCode: ministryCode });
    if (!scheme) return error(res, 'Scheme not found', 404);
    return success(res, 'Scheme loaded', scheme);
  } catch (err) {
    next(err);
  }
};

exports.createStateAdmin = async (req, res, next) => {
  try {
    const { state, stateCode, fullName, email, phone, employeeId, designation } = req.body;
    if (!state || !stateCode || !fullName || !email || !employeeId) {
      return error(res, 'Missing required fields', 400);
    }

    const existing = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) return error(res, 'User already exists', 409);

    const wallet = generateWallet();
    const tempPassword = `State@${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: tempPassword,
      employeeId,
      phone,
      designation: designation || 'Finance Officer',
      role: 'state_admin',
      jurisdiction: {
        ministry: req.user.jurisdiction.ministry,
        ministryCode: req.user.jurisdiction.ministryCode,
        state,
        stateCode
      },
      walletAddress: wallet.address,
      createdBy: req.user._id,
      isFirstLogin: true
    });

    return success(res, 'State admin created', {
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

exports.getAllStates = async (req, res, next) => {
  try {
    const ministryCode = req.user.jurisdiction.ministryCode;
    const states = await User.find({ role: 'state_admin', 'jurisdiction.ministryCode': ministryCode }).select('-password');
    return success(res, 'States loaded', states);
  } catch (err) {
    next(err);
  }
};

exports.releaseFundsToState = async (req, res, next) => {
  try {
    const { stateCode, stateWalletAddress, amountCrore, schemeId, schemeName, ucDocHash } = req.body;
    const ministry = req.user;

    const received = await Transaction.aggregate([
      { $match: { toCode: ministry.jurisdiction.ministryCode, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const released = await Transaction.aggregate([
      { $match: { fromCode: ministry.jurisdiction.ministryCode, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);

    const available = (received[0]?.total || 0) - (released[0]?.total || 0);
    if (amountCrore > available) {
      return error(res, `Insufficient balance. Available: ${available} Cr`, 400);
    }

    const scheme = await Scheme.findOne({ schemeId });
    if (!scheme || scheme.status !== 'active') {
      return error(res, 'Scheme inactive or not found', 400);
    }

    const transactionId = `TXN-${Date.now()}-${ministry.jurisdiction.ministryCode}-${stateCode}`;

    const bcResult = await blockchainService.releaseFunds(
      stateWalletAddress,
      amountCrore,
      transactionId,
      schemeId
    );

    const tx = await Transaction.create({
      transactionId,
      blockchainTxHash: bcResult.txHash,
      blockNumber: bcResult.blockNumber,
      fromRole: 'ministry_admin',
      fromCode: ministry.jurisdiction.ministryCode,
      fromName: ministry.jurisdiction.ministry,
      toRole: 'state_admin',
      toCode: stateCode,
      toWalletAddress: stateWalletAddress,
      amountCrore,
      schemeId,
      schemeName: schemeName || scheme.schemeName,
      financialYear: req.body.financialYear || '2024-25',
      ministryCode: ministry.jurisdiction.ministryCode,
      stateCode,
      ucDocHash,
      status: 'confirmed'
    });

    const io = req.app.get('io');
    emitToAuditors(io, 'new_transaction', {
      transaction: tx,
      type: 'STATE_RELEASE',
      severity: 'normal'
    });

    await flagEngine.runFlagChecks(tx, io);

    return success(res, 'Funds released', {
      transactionId,
      blockchainTxHash: bcResult.txHash,
      blockNumber: bcResult.blockNumber
    });
  } catch (err) {
    next(err);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const ministryCode = req.user.jurisdiction.ministryCode;
    const transactions = await Transaction.find({
      $or: [{ fromCode: ministryCode }, { toCode: ministryCode }]
    }).sort({ createdAt: -1 });
    return success(res, 'Transactions loaded', transactions);
  } catch (err) {
    next(err);
  }
};

exports.getFlags = async (req, res, next) => {
  try {
    const ministryCode = req.user.jurisdiction.ministryCode;
    const flags = await Flag.find({ ministryCode }).sort({ createdAt: -1 });
    return success(res, 'Flags loaded', flags);
  } catch (err) {
    next(err);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    return success(res, 'Reports endpoint placeholder', []);
  } catch (err) {
    next(err);
  }
};
