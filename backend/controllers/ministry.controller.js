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
      totalBudgetCrore,
      perBeneficiaryAmount,
      beneficiaryAmountType,
      targetBeneficiaries,
      applicableStates,
      startDate,
      endDate,
      guidelineDocHash,
      fundingRatioCentre,
      fundingRatioState,
      blockchainTxHash: frontendTxHash,
      blockNumber: frontendBlockNumber
    } = req.body;

    if (!schemeId || !schemeName || !description || !totalBudgetCrore) {
      return error(res, 'Missing required fields', 400);
    }

    // Normalize schemeType — accept shorthand values from frontend
    const schemeTypeMap = {
      central: 'central_sector',
      central_sector: 'central_sector',
      css: 'centrally_sponsored',
      centrally_sponsored: 'centrally_sponsored',
      matching: 'state_scheme',
      state_scheme: 'state_scheme'
    };
    const schemeType = schemeTypeMap[req.body.schemeType] || 'central_sector';

    // Normalize eligibilityRules — accept both strings and objects
    let eligibilityRules = req.body.eligibilityRules || [];
    eligibilityRules = eligibilityRules.map((rule, i) => {
      if (typeof rule === 'string') {
        return { ruleText: rule, ruleCode: `RULE_${i + 1}` };
      }
      return rule;
    });

    // Scheme creation is DB-only (no money moving)
    // If frontend already signed via MetaMask, store the hash
    const bcTxHash = frontendTxHash || null;
    const bcBlockNumber = frontendBlockNumber || null;


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
      eligibilityRules,
      applicableStates: applicableStates || ['ALL'],
      startDate,
      endDate,
      guidelineDocHash: guidelineDocHash || null,
      blockchainTxHash: bcTxHash,
      blockNumber: bcBlockNumber,
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
    const {
      stateCode,
      stateWalletAddress,
      amountCrore,
      schemeId,
      schemeName,
      ucDocHash,
      transactionId: frontendTxId,
      blockchainTxHash: frontendTxHash,
      blockNumber: frontendBlockNumber
    } = req.body;
    const ministry = req.user;
    const amount = Number(amountCrore || 0);

    if (!stateCode || !stateWalletAddress || !schemeId) {
      return error(res, 'Missing required fields for blockchain transfer.', 400);
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return error(res, 'Amount must be greater than 0.', 400);
    }

    const received = await Transaction.aggregate([
      { $match: { toCode: ministry.jurisdiction.ministryCode, status: { $in: ['confirmed', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const released = await Transaction.aggregate([
      { $match: { fromCode: ministry.jurisdiction.ministryCode, status: { $in: ['confirmed', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);

    const available = (received[0]?.total || 0) - (released[0]?.total || 0);
    if (amount > available) {
      return error(res, `Insufficient balance. Available: ${available} Cr`, 400);
    }

    const scheme = await Scheme.findOne({ schemeId });
    if (!scheme || scheme.status !== 'active') {
      return error(res, 'Scheme inactive or not found', 400);
    }

    const transactionId = frontendTxId || `TXN-${Date.now()}-${ministry.jurisdiction.ministryCode}-${stateCode}`;
    const { blockchainReady } = require('../config/blockchain').getContracts();

    let bcResult = null;
    if (frontendTxHash) {
      bcResult = {
        txHash: frontendTxHash,
        blockNumber: frontendBlockNumber ?? null
      };
    } else {
      if (!blockchainReady) {
        return error(res, 'Blockchain not ready. Configure contracts and retry.', 503);
      }
      try {
        bcResult = await blockchainService.releaseFunds(stateWalletAddress, amount, transactionId, schemeId, ucDocHash);
      } catch (chainErr) {
        await Transaction.create({
          transactionId,
          blockchainTxHash: null,
          blockNumber: null,
          fromRole: 'ministry_admin',
          fromCode: ministry.jurisdiction.ministryCode,
          fromName: ministry.jurisdiction.ministry,
          toRole: 'state_admin',
          toCode: stateCode,
          toWalletAddress: stateWalletAddress,
          amountCrore: amount,
          schemeId,
          schemeName: schemeName || scheme.schemeName,
          financialYear: req.body.financialYear || '2024-25',
          ministryCode: ministry.jurisdiction.ministryCode,
          stateCode,
          ucDocHash,
          status: 'failed'
        });
        return error(res, `Blockchain transfer failed: ${chainErr.message}`, 502);
      }
    }

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
      amountCrore: amount,
      schemeId,
      schemeName: schemeName || scheme.schemeName,
      financialYear: req.body.financialYear || '2024-25',
      ministryCode: ministry.jurisdiction.ministryCode,
      stateCode,
      ucDocHash,
      status: 'confirmed'
    });

    const io = req.app.get('io');
    emitToAuditors(io, 'new_transaction', { transaction: tx, type: 'STATE_RELEASE', severity: 'normal' });
    flagEngine.runFlagChecks(tx, io).catch(e => console.error('Flag check error:', e.message));

    return success(res, 'Funds released to state', {
      transactionId,
      blockchainTxHash: bcResult.txHash,
      blockNumber: bcResult.blockNumber,
      status: 'confirmed'
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
    const ministryCode = req.user.jurisdiction.ministryCode;
    const { financialYear, schemeId, stateCode, fromDate, toDate } = req.query;

    const baseMatch = { ministryCode, status: 'confirmed' };
    if (financialYear) baseMatch.financialYear = financialYear;
    if (schemeId) baseMatch.schemeId = schemeId;
    if (stateCode) baseMatch.stateCode = stateCode;
    if (fromDate || toDate) {
      baseMatch.createdAt = {};
      if (fromDate) baseMatch.createdAt.$gte = new Date(fromDate);
      if (toDate) baseMatch.createdAt.$lte = new Date(toDate);
    }

    const received = await Transaction.aggregate([
      { $match: { ...baseMatch, toCode: ministryCode } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const released = await Transaction.aggregate([
      { $match: { ...baseMatch, fromCode: ministryCode } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);

    const schemesTotal = await Scheme.countDocuments({ ownerMinistryCode: ministryCode });
    const schemesActive = await Scheme.countDocuments({
      ownerMinistryCode: ministryCode,
      status: 'active'
    });
    const schemesPaused = await Scheme.countDocuments({
      ownerMinistryCode: ministryCode,
      status: 'paused'
    });

    const flagsOpen = await Flag.countDocuments({
      ministryCode,
      status: { $ne: 'resolved' }
    });
    const flagsByType = await Flag.aggregate([
      { $match: { ministryCode } },
      { $group: { _id: '$flagType', total: { $sum: 1 } } }
    ]);

    const releasesByState = await Transaction.aggregate([
      { $match: { ...baseMatch, fromCode: ministryCode, stateCode: { $ne: null } } },
      { $group: { _id: '$stateCode', total: { $sum: '$amountCrore' } } },
      { $sort: { total: -1 } }
    ]);

    const releasesByScheme = await Transaction.aggregate([
      { $match: { ...baseMatch, fromCode: ministryCode } },
      {
        $group: {
          _id: { schemeId: '$schemeId', schemeName: '$schemeName' },
          total: { $sum: '$amountCrore' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const latestTransactions = await Transaction.find({
      $or: [{ fromCode: ministryCode }, { toCode: ministryCode }]
    })
      .sort({ createdAt: -1 })
      .limit(25);

    const receivedTotal = received[0]?.total || 0;
    const releasedTotal = released[0]?.total || 0;

    return success(res, 'Reports loaded', {
      totals: {
        receivedCrore: receivedTotal,
        releasedCrore: releasedTotal,
        balanceCrore: receivedTotal - releasedTotal
      },
      schemes: {
        total: schemesTotal,
        active: schemesActive,
        paused: schemesPaused
      },
      flags: {
        open: flagsOpen,
        byType: flagsByType
      },
      releasesByState,
      releasesByScheme,
      latestTransactions
    });
  } catch (err) {
    next(err);
  }
};
