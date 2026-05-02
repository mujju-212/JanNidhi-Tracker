const Transaction = require('../models/Transaction.model');
const Flag = require('../models/Flag.model');
const Payment = require('../models/Payment.model');
const { emitToAuditors } = require('../config/socket');
const { success, error } = require('../utils/apiResponse');

const applyTxScope = (user, filter = {}) => {
  const scoped = { ...filter };
  if (user.role === 'state_auditor') {
    scoped.stateCode = user.jurisdiction?.stateCode || '__NO_STATE__';
  }
  if (Array.isArray(user.assignedSchemes) && user.assignedSchemes.length > 0) {
    scoped.schemeId = { $in: user.assignedSchemes };
  }
  return scoped;
};

const applyPaymentScope = (user, filter = {}) => {
  const scoped = { ...filter };
  if (user.role === 'state_auditor') {
    scoped.state = user.jurisdiction?.state || '__NO_STATE__';
  }
  if (Array.isArray(user.assignedSchemes) && user.assignedSchemes.length > 0) {
    scoped.schemeId = { $in: user.assignedSchemes };
  }
  return scoped;
};

const buildFlagFilter = async (user, base = {}) => {
  const filter = { ...base };
  if (user.role === 'state_auditor') {
    filter.stateCode = user.jurisdiction?.stateCode || '__NO_STATE__';
  }
  if (Array.isArray(user.assignedSchemes) && user.assignedSchemes.length > 0) {
    const scopedTxIds = await Transaction.find(
      applyTxScope(user, {})
    )
      .select('transactionId')
      .limit(5000)
      .lean();
    const ids = scopedTxIds.map((item) => item.transactionId);
    filter.transactionId = ids.length ? { $in: ids } : '__NO_MATCH__';
  }
  return filter;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const txFilter = applyTxScope(req.user, {});
    const flagFilter = await buildFlagFilter(req.user, {});
    const activeFlagFilter = await buildFlagFilter(req.user, {
      status: { $in: ['active', 'awaiting_response', 'under_review'] }
    });
    const totalFlags = await Flag.countDocuments(flagFilter);
    const activeFlags = await Flag.countDocuments(activeFlagFilter);
    const totalTransactions = await Transaction.countDocuments(txFilter);

    return success(res, 'Dashboard loaded', { totalFlags, activeFlags, totalTransactions });
  } catch (err) {
    next(err);
  }
};

exports.getLiveFeed = async (req, res, next) => {
  try {
    const feed = await Transaction.find(applyTxScope(req.user, {})).sort({ createdAt: -1 }).limit(100);
    return success(res, 'Live feed loaded', feed);
  } catch (err) {
    next(err);
  }
};

exports.getFlags = async (req, res, next) => {
  try {
    const filter = await buildFlagFilter(req.user, {});
    if (req.query.status) filter.status = req.query.status;
    const flags = await Flag.find(filter).sort({ createdAt: -1 });
    return success(res, 'Flags loaded', flags);
  } catch (err) {
    next(err);
  }
};

exports.getFlagById = async (req, res, next) => {
  try {
    const scopeFilter = await buildFlagFilter(req.user, {});
    const flag = await Flag.findOne({ ...scopeFilter, flagId: req.params.id });
    if (!flag) return error(res, 'Flag not found', 404);
    return success(res, 'Flag loaded', flag);
  } catch (err) {
    next(err);
  }
};

exports.raiseFlag = async (req, res, next) => {
  try {
    const { transactionId, flagType, flagCode, flagReason, responseDeadlineDays } = req.body;

    const tx = await Transaction.findOne(applyTxScope(req.user, { transactionId }));
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

    const scopeFilter = await buildFlagFilter(req.user, {});
    const flag = await Flag.findOne({ ...scopeFilter, flagId: req.params.id });
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
    const filter = applyTxScope(req.user, {});
    const { transactionId, schemeId, stateCode, ministryCode, status } = req.query;

    if (transactionId) filter.transactionId = transactionId;
    if (schemeId) filter.schemeId = schemeId;
    if (stateCode && req.user.role !== 'state_auditor') filter.stateCode = stateCode;
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
    const state = req.user.role === 'state_auditor'
      ? req.user.jurisdiction?.stateCode
      : req.query.state;

    const txMatch = applyTxScope(req.user, { status: 'confirmed' });
    if (state) txMatch.stateCode = state;
    if (district) txMatch.districtCode = district;

    const toDistricts = await Transaction.aggregate([
      { $match: { ...txMatch, fromRole: 'state_admin' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);

    const paymentMatch = applyPaymentScope(req.user, { status: 'success' });
    if (state && req.user.role !== 'state_auditor') paymentMatch.state = state;
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

exports.getAccessContext = async (req, res, next) => {
  try {
    return success(res, 'Auditor access context loaded', {
      role: req.user.role,
      jurisdiction: req.user.jurisdiction || {},
      assignedSchemes: req.user.assignedSchemes || []
    });
  } catch (err) {
    next(err);
  }
};

exports.getFundTrailTimeline = async (req, res, next) => {
  try {
    const { schemeId, stateCode, districtCode, limit } = req.query;
    const txFilter = applyTxScope(req.user, { status: 'confirmed' });
    const paymentFilter = applyPaymentScope(req.user, { status: 'success' });

    if (schemeId) {
      txFilter.schemeId = schemeId;
      paymentFilter.schemeId = schemeId;
    }
    if (stateCode && req.user.role !== 'state_auditor') txFilter.stateCode = stateCode;
    if (districtCode) {
      txFilter.districtCode = districtCode;
      paymentFilter.district = districtCode;
    }

    const maxItems = Math.min(Number(limit || 200), 1000);
    const transactions = await Transaction.find(txFilter).sort({ createdAt: 1 }).limit(maxItems);
    const payments = await Payment.find(paymentFilter).sort({ paidAt: 1 }).limit(maxItems);

    const stageTotals = {
      centreToMinistry: 0,
      ministryToState: 0,
      stateToDistrict: 0,
      districtToBeneficiary: 0
    };

    const txStages = transactions.map((tx) => {
      if (tx.fromRole === 'super_admin' && tx.toRole === 'ministry_admin') {
        stageTotals.centreToMinistry += Number(tx.amountCrore || 0);
      } else if (tx.fromRole === 'ministry_admin' && tx.toRole === 'state_admin') {
        stageTotals.ministryToState += Number(tx.amountCrore || 0);
      } else if (tx.fromRole === 'state_admin' && tx.toRole === 'district_admin') {
        stageTotals.stateToDistrict += Number(tx.amountCrore || 0);
      }
      return {
        type: 'transfer',
        level: `${tx.fromRole || '-'} -> ${tx.toRole || '-'}`,
        transactionId: tx.transactionId,
        schemeId: tx.schemeId,
        schemeName: tx.schemeName,
        amountCrore: tx.amountCrore,
        blockchainTxHash: tx.blockchainTxHash,
        blockNumber: tx.blockNumber,
        createdAt: tx.createdAt
      };
    });

    const paymentStages = payments.map((payment) => {
      stageTotals.districtToBeneficiary += Number(payment.amount || 0) / 10000000;
      return {
        type: 'payment',
        level: 'district_admin -> beneficiary',
        paymentId: payment.paymentId,
        schemeId: payment.schemeId,
        schemeName: payment.schemeName,
        amountCrore: Number(payment.amount || 0) / 10000000,
        blockchainTxHash: payment.blockchainTxHash,
        blockNumber: payment.blockNumber,
        createdAt: payment.paidAt || payment.createdAt
      };
    });

    const timeline = [...txStages, ...paymentStages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const leakageGap = Number((stageTotals.stateToDistrict - stageTotals.districtToBeneficiary).toFixed(4));

    return success(res, 'Fund trail timeline loaded', {
      filters: {
        schemeId: schemeId || null,
        stateCode: req.user.role === 'state_auditor' ? req.user.jurisdiction?.stateCode : stateCode || null,
        districtCode: districtCode || null
      },
      stageTotals,
      leakageGapCrore: leakageGap,
      timeline
    });
  } catch (err) {
    next(err);
  }
};
