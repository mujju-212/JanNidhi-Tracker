const User = require('../models/User.model');
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
      { $match: { toCode: state.jurisdiction.stateCode, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const released = await Transaction.aggregate([
      { $match: { fromCode: state.jurisdiction.stateCode, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);

    const available = (received[0]?.total || 0) - (released[0]?.total || 0);
    if (amountCrore > available) {
      return error(res, `Insufficient balance. Available: ${available} Cr`, 400);
    }

    const transactionId = `TXN-${Date.now()}-${state.jurisdiction.stateCode}-${districtCode}`;

    const bcResult = await blockchainService.releaseFunds(
      districtWalletAddress,
      amountCrore,
      transactionId,
      schemeId
    );

    const tx = await Transaction.create({
      transactionId,
      blockchainTxHash: bcResult.txHash,
      blockNumber: bcResult.blockNumber,
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
