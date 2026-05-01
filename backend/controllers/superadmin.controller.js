const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');
const Flag = require('../models/Flag.model');
const { generateWallet } = require('../utils/generateWallet');
const blockchainService = require('../services/blockchain.service');
const { emitToAuditors } = require('../config/socket');
const { success, error } = require('../utils/apiResponse');

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

    const bcResult = await blockchainService.registerMinistry(
      wallet.address,
      ministryName,
      ministryCode,
      Number(budgetCapCrore || 0)
    );

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
      sanctionDocHash
    } = req.body;

    const ministry = await User.findOne({ 'jurisdiction.ministryCode': ministryCode });
    if (!ministry) return error(res, 'Ministry not found', 404);

    const transactionId = `TXN-${financialYear}-${ministryCode}-${Date.now()}`;

    const bcResult = await blockchainService.allocateBudget(
      ministryWalletAddress,
      totalAmountCrore,
      transactionId,
      sanctionDocHash || ''
    );

    const tx = await Transaction.create({
      transactionId,
      blockchainTxHash: bcResult.txHash,
      blockNumber: bcResult.blockNumber,
      fromRole: 'super_admin',
      fromName: 'Finance Ministry of India',
      fromCode: 'FIN_MIN',
      toRole: 'ministry_admin',
      toName: ministry.jurisdiction.ministry,
      toCode: ministryCode,
      toWalletAddress: ministryWalletAddress,
      amountCrore: totalAmountCrore,
      schemeId: 'BUDGET_ALLOCATION',
      schemeName: `Budget Allocation ${financialYear}`,
      financialYear,
      quarter,
      ministryCode,
      sanctionDocHash,
      status: 'confirmed',
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
      blockNumber: bcResult.blockNumber
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
      designation
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
      walletAddress: wallet.address,
      createdBy: req.user._id,
      isFirstLogin: true
    });

    return success(res, 'CAG account created', {
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
