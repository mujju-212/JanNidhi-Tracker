const Transaction = require('../models/Transaction.model');
const Flag = require('../models/Flag.model');
const Payment = require('../models/Payment.model');
const { emitToAuditors } = require('../config/socket');
const { success, error } = require('../utils/apiResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const totalFlags = await Flag.countDocuments();
    const activeFlags = await Flag.countDocuments({ status: { $in: ['active', 'awaiting_response', 'under_review'] } });
    const totalTransactions = await Transaction.countDocuments();

    return success(res, 'Dashboard loaded', { totalFlags, activeFlags, totalTransactions });
  } catch (err) {
    next(err);
  }
};

exports.getLiveFeed = async (req, res, next) => {
  try {
    const feed = await Transaction.find().sort({ createdAt: -1 }).limit(100);
    return success(res, 'Live feed loaded', feed);
  } catch (err) {
    next(err);
  }
};

exports.getFlags = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const flags = await Flag.find(filter).sort({ createdAt: -1 });
    return success(res, 'Flags loaded', flags);
  } catch (err) {
    next(err);
  }
};

exports.getFlagById = async (req, res, next) => {
  try {
    const flag = await Flag.findOne({ flagId: req.params.id });
    if (!flag) return error(res, 'Flag not found', 404);
    return success(res, 'Flag loaded', flag);
  } catch (err) {
    next(err);
  }
};

exports.raiseFlag = async (req, res, next) => {
  try {
    const { transactionId, flagType, flagCode, flagReason, responseDeadlineDays } = req.body;

    const tx = await Transaction.findOne({ transactionId });
    if (!tx) return error(res, 'Transaction not found', 404);

    const flagId = `FLAG-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const deadline = new Date(Date.now() + (responseDeadlineDays || 7) * 24 * 3600000);

    const flag = await Flag.create({
      flagId,
      transactionId,
      blockchainTxHash: tx.blockchainTxHash,
      flagType,
      flagCode,
      flagReason,
      raisedByType: req.user.role === 'central_cag' ? 'cag_auditor' : 'state_auditor',
      raisedBy: req.user._id,
      ministryCode: tx.ministryCode,
      stateCode: tx.stateCode,
      districtCode: tx.districtCode,
      responseDeadline: deadline,
      status: 'awaiting_response'
    });

    await Transaction.findOneAndUpdate({ transactionId }, { isFlagged: true, flagId: flag._id });

    const io = req.app.get('io');
    emitToAuditors(io, 'new_flag', {
      flagId,
      flagType,
      flagCode,
      flagReason,
      transactionId,
      timestamp: new Date()
    });

    return success(res, 'Flag raised', { flagId, deadline }, 201);
  } catch (err) {
    next(err);
  }
};

exports.decideFlag = async (req, res, next) => {
  try {
    const { decision, decisionNote, escalationTarget } = req.body;

    const flag = await Flag.findOne({ flagId: req.params.id });
    if (!flag) return error(res, 'Flag not found', 404);

    flag.cagDecision = {
      decision,
      decisionNote,
      decidedAt: new Date(),
      decidedBy: req.user._id
    };
    flag.status =
      decision === 'resolved'
        ? 'resolved'
        : decision === 'escalated'
          ? 'escalated'
          : 'under_review';
    if (escalationTarget) flag.escalationTarget = escalationTarget;

    await flag.save();

    return success(res, `Flag ${decision}`, flag);
  } catch (err) {
    next(err);
  }
};

exports.searchTransactions = async (req, res, next) => {
  try {
    const filter = {};
    const { transactionId, schemeId, stateCode, ministryCode, status } = req.query;

    if (transactionId) filter.transactionId = transactionId;
    if (schemeId) filter.schemeId = schemeId;
    if (stateCode) filter.stateCode = stateCode;
    if (ministryCode) filter.ministryCode = ministryCode;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).limit(500);
    return success(res, 'Transactions loaded', transactions);
  } catch (err) {
    next(err);
  }
};

exports.getLeakageReport = async (req, res, next) => {
  try {
    const district = req.query.district;
    const state = req.query.state;

    const txMatch = { status: 'confirmed' };
    if (state) txMatch.stateCode = state;
    if (district) txMatch.districtCode = district;

    const toDistricts = await Transaction.aggregate([
      { $match: { ...txMatch, fromRole: 'state_admin' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);

    const paymentMatch = { status: 'success' };
    if (state) paymentMatch.state = state;
    if (district) paymentMatch.district = district;

    const toBeneficiary = await Payment.aggregate([
      { $match: paymentMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const toDistrictsTotal = toDistricts[0]?.total || 0;
    const toBeneficiaryTotal = (toBeneficiary[0]?.total || 0) / 10000000;
    const unaccounted = toDistrictsTotal - toBeneficiaryTotal;

    return success(res, 'Leakage report loaded', {
      toDistricts: toDistrictsTotal,
      toBeneficiary: toBeneficiaryTotal,
      unaccounted,
      leakagePercent: toDistrictsTotal > 0 ? (unaccounted / toDistrictsTotal) * 100 : 0
    });
  } catch (err) {
    next(err);
  }
};
