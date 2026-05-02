const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');
const Flag = require('../models/Flag.model');
const Scheme = require('../models/Scheme.model');
const PlatformSettings = require('../models/PlatformSettings.model');
const { generateWallet } = require('../utils/generateWallet');
const blockchainService = require('../services/blockchain.service');
const { emitToAuditors } = require('../config/socket');
const { success, error } = require('../utils/apiResponse');

const DEFAULT_SUPERADMIN_SETTINGS = {
  sessionTimeoutMinutes: 30,
  multiSigApprovalsEnabled: true,
  autoLockOnAnomalyEnabled: true,
  releaseDelayThresholdDays: 30,
  utilizationAlertPercent: 65,
  duplicateBeneficiaryLimit: 3,
  escalateCriticalTo: 'CAG Central',
  digestTime: '09:00 AM',
  emergencyEmail: 'monitoring@finmin.gov.in'
};

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);

const getTotal = async (match) => {
  const result = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amountCrore' } } }
  ]);
  return result[0]?.total || 0;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const allocated = await getTotal({ fromRole: 'super_admin', status: 'confirmed' });
    const released = await getTotal({
      fromRole: { $in: ['ministry_admin', 'state_admin', 'district_admin'] },
      status: 'confirmed'
    });
    const activeFlags = await Flag.countDocuments({
      status: { $in: ['active', 'awaiting_response', 'under_review'] }
    });
    const ministries = await User.countDocuments({ role: 'ministry_admin', isActive: true });

    return success(res, 'Dashboard loaded', {
      allocated,
      released,
      activeFlags,
      ministries
    });
  } catch (err) {
    next(err);
  }
};

exports.createMinistry = async (req, res, next) => {
  try {
    const {
      ministryName,
      ministryCode,
      hodName,
      designation,
      email,
      phone,
      employeeId,
      budgetCapCrore
    } = req.body;

    if (!ministryName || !ministryCode || !email || !employeeId) {
      return error(res, 'Missing required fields', 400);
    }

    const existing = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) return error(res, 'User already exists', 409);

    const wallet = generateWallet();
    const tempPassword = `Ministry@${Math.floor(1000 + Math.random() * 9000)}`;

    let bcResult = { txHash: null, blockNumber: null, skipped: true };
    let blockchainStatus = 'skipped';
    let blockchainNote = 'Blockchain registration skipped.';

    try {
      bcResult = await withTimeout(
        blockchainService.registerMinistry(
          wallet.address,
          ministryName,
          ministryCode,
          Number(budgetCapCrore || 0)
        ),
        45000
      );
      blockchainStatus = bcResult?.skipped ? 'already_registered' : 'confirmed';
      blockchainNote = bcResult?.skipped
        ? 'Ministry already registered on blockchain.'
        : 'Ministry registered on blockchain.';
    } catch (chainErr) {
      blockchainStatus = 'pending';
      blockchainNote = `Blockchain registration pending: ${chainErr.message}`;
      // Keep ministry creation resilient even if chain is slow/unavailable.
      console.warn('[createMinistry] blockchain register failed:', chainErr.message);
    }

    const user = await User.create({
      fullName: hodName || ministryName,
      email: email.toLowerCase(),
      password: tempPassword,
      employeeId,
      phone,
      designation: designation || 'Secretary',
      role: 'ministry_admin',
      jurisdiction: {
        ministry: ministryName,
        ministryCode
      },
      walletAddress: wallet.address,
      budgetCapCrore: Number(budgetCapCrore || 0),
      createdBy: req.user._id,
      isFirstLogin: true
    });

    return success(res, 'Ministry created', {
      id: user._id,
      walletAddress: wallet.address,
      walletPrivateKey: wallet.privateKey,
      walletMnemonic: wallet.mnemonic,
      blockchainTx: bcResult,
      blockchainStatus,
      blockchainNote,
      tempPassword
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllMinistries = async (req, res, next) => {
  try {
    const ministries = await User.find({ role: 'ministry_admin' }).select('-password');
    return success(res, 'Ministries loaded', ministries);
  } catch (err) {
    next(err);
  }
};

exports.getMinistryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let ministry = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      ministry = await User.findById(id).select('-password');
    }

    if (!ministry) {
      ministry = await User.findOne({ 'jurisdiction.ministryCode': id }).select('-password');
    }

    if (!ministry) return error(res, 'Ministry not found', 404);
    return success(res, 'Ministry loaded', ministry);
  } catch (err) {
    next(err);
  }
};

exports.allocateBudget = async (req, res, next) => {
  try {
    const {
      ministryCode,
      ministryWalletAddress,
      totalAmountCrore,
      financialYear,
      quarter,
      sanctionDocHash,
      transactionId: frontendTransactionId
    } = req.body;

    if (!ministryCode || !totalAmountCrore) {
      return error(res, 'Ministry code and amount required', 400);
    }

    const ministry = await User.findOne({ 'jurisdiction.ministryCode': ministryCode });
    if (!ministry) return error(res, 'Ministry not found', 404);

    const walletAddr = ministryWalletAddress || ministry.walletAddress;
    const transactionId = frontendTransactionId || `TXN-${financialYear}-${ministryCode}-${Date.now()}`;

    // ─── BLOCKCHAIN FIRST (server-side — backend has the deployer/superAdmin key) ───
    let bcResult = { txHash: 'PENDING', blockNumber: null };
    let status = 'pending';

    try {
      // Register ministry wallet on-chain if not already registered
      await blockchainService.registerMinistry(
        walletAddr,
        ministry.jurisdiction.ministry,
        ministryCode,
        Number(ministry.budgetCapCrore || 99999)
      ).catch(() => {}); // Ignore "already registered" errors

      // Allocate budget on-chain (only superAdmin can do this)
      bcResult = await blockchainService.allocateBudget(
        walletAddr,
        Number(totalAmountCrore),
        transactionId,
        sanctionDocHash || ''
      );
      status = 'confirmed';
      console.log(`✅ Budget allocated on-chain: ${totalAmountCrore} Cr → ${walletAddr}`);
    } catch (chainErr) {
      console.error('❌ Blockchain allocation failed:', chainErr.message);
      return error(res, `Blockchain allocation failed: ${chainErr.message}`, 500);
    }

    // ─── DB SAVE (only after blockchain confirms) ───
    const tx = await Transaction.create({
      transactionId,
      blockchainTxHash: bcResult.txHash,
      blockNumber: bcResult.blockNumber,
      fromRole: 'super_admin',
      fromWalletAddress: req.user?.walletAddress || null,
      fromName: 'Finance Ministry of India',
      fromCode: 'FIN_MIN',
      toRole: 'ministry_admin',
      toName: ministry.jurisdiction.ministry,
      toCode: ministryCode,
      toWalletAddress: walletAddr,
      amountCrore: totalAmountCrore,
      schemeId: 'BUDGET_ALLOCATION',
      schemeName: `Budget Allocation ${financialYear}`,
      financialYear,
      quarter,
      ministryCode,
      sanctionDocHash,
      status,
      validations: {
        amountCheck: true,
        walletCheck: true,
        ucCheck: true,
        schemeActiveCheck: true
      }
    });

    const io = req.app.get('io');
    emitToAuditors(io, 'new_transaction', {
      transaction: tx,
      type: 'BUDGET_ALLOCATION',
      severity: 'normal'
    });

    return success(res, 'Budget allocated', {
      transactionId,
      blockchainTxHash: bcResult.txHash,
      blockNumber: bcResult.blockNumber,
      allocatedTo: walletAddr,
      status
    });
  } catch (err) {
    next(err);
  }

};



exports.getBudgetHistory = async (req, res, next) => {
  try {
    const history = await Transaction.find({ schemeId: 'BUDGET_ALLOCATION' }).sort({ createdAt: -1 });
    return success(res, 'Budget history loaded', history);
  } catch (err) {
    next(err);
  }
};

exports.createCAGAccount = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      employeeId,
      role,
      jurisdiction,
      designation,
      assignedSchemes
    } = req.body;

    if (!fullName || !email || !employeeId) return error(res, 'Missing required fields', 400);
    if (!['central_cag', 'state_auditor'].includes(role)) {
      return error(res, 'Invalid role', 400);
    }

    const existing = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) return error(res, 'User already exists', 409);

    const wallet = generateWallet();
    const tempPassword = `CAG@${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: tempPassword,
      employeeId,
      phone,
      designation: designation || 'Auditor',
      role,
      jurisdiction: jurisdiction || {},
      assignedSchemes: Array.isArray(assignedSchemes) ? assignedSchemes : [],
      walletAddress: wallet.address,
      createdBy: req.user._id,
      isFirstLogin: true
    });

    return success(res, 'CAG account created', {
      id: user._id,
      walletAddress: wallet.address,
      walletPrivateKey: wallet.privateKey,
      walletMnemonic: wallet.mnemonic,
      tempPassword,
      assignedSchemes: user.assignedSchemes || []
    });
  } catch (err) {
    next(err);
  }
};

exports.assignCAGSchemes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedSchemes } = req.body;

    if (!Array.isArray(assignedSchemes)) {
      return error(res, 'assignedSchemes must be an array', 400);
    }

    const user = await User.findById(id);
    if (!user) return error(res, 'Auditor not found', 404);
    if (!['central_cag', 'state_auditor'].includes(user.role)) {
      return error(res, 'Target user is not an auditor', 400);
    }

    user.assignedSchemes = assignedSchemes;
    await user.save();

    return success(res, 'Auditor scheme assignments updated', {
      id: user._id,
      role: user.role,
      assignedSchemes: user.assignedSchemes
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(500);
    return success(res, 'Transactions loaded', transactions);
  } catch (err) {
    next(err);
  }
};

exports.getAllFlags = async (req, res, next) => {
  try {
    const flags = await Flag.find().sort({ createdAt: -1 }).limit(500);
    return success(res, 'Flags loaded', flags);
  } catch (err) {
    next(err);
  }
};

exports.getManagedUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      role: { $in: ['ministry_admin', 'central_cag', 'state_auditor'] }
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(500);

    return success(res, 'Users loaded', users);
  } catch (err) {
    next(err);
  }
};

exports.getAllSchemes = async (req, res, next) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 }).limit(500);
    const transactions = await Transaction.find({
      schemeId: { $nin: ['BUDGET_ALLOCATION'] }
    })
      .select('schemeId amountCrore fromRole status')
      .limit(5000);

    const releasedMap = new Map();
    transactions.forEach((tx) => {
      if (tx.status !== 'confirmed') return;
      if (!['ministry_admin', 'state_admin', 'district_admin'].includes(tx.fromRole)) return;
      releasedMap.set(tx.schemeId, (releasedMap.get(tx.schemeId) || 0) + Number(tx.amountCrore || 0));
    });

    const payload = schemes.map((scheme) => ({
      schemeId: scheme.schemeId,
      schemeName: scheme.schemeName,
      ownerMinistryCode: scheme.ownerMinistryCode,
      ownerMinistryName: scheme.ownerMinistryName,
      schemeType: scheme.schemeType,
      totalBudgetCrore: scheme.totalBudgetCrore,
      releasedCrore: Number((releasedMap.get(scheme.schemeId) || 0).toFixed(2)),
      utilizationPercent:
        scheme.totalBudgetCrore > 0
          ? Math.min(
              100,
              Number((((releasedMap.get(scheme.schemeId) || 0) / scheme.totalBudgetCrore) * 100).toFixed(2))
            )
          : 0,
      status: scheme.status,
      createdAt: scheme.createdAt
    }));

    return success(res, 'Schemes loaded', payload);
  } catch (err) {
    next(err);
  }
};

exports.getSystemSettings = async (req, res, next) => {
  try {
    const doc = await PlatformSettings.findOne({ key: 'superadmin' });
    const payload = { ...DEFAULT_SUPERADMIN_SETTINGS, ...(doc?.payload || {}) };
    return success(res, 'Settings loaded', payload);
  } catch (err) {
    next(err);
  }
};

exports.updateSystemSettings = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const nextPayload = {
      ...DEFAULT_SUPERADMIN_SETTINGS,
      ...payload
    };

    const doc = await PlatformSettings.findOneAndUpdate(
      { key: 'superadmin' },
      { payload: nextPayload, updatedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return success(res, 'Settings updated', doc.payload);
  } catch (err) {
    next(err);
  }
};
