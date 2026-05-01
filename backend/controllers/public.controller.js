const Transaction = require('../models/Transaction.model');
const Scheme = require('../models/Scheme.model');
const Payment = require('../models/Payment.model');
const Flag = require('../models/Flag.model');
const { success } = require('../utils/apiResponse');

exports.getNationalStats = async (req, res, next) => {
  try {
    const allocated = await Transaction.aggregate([
      { $match: { fromRole: 'super_admin', status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const released = await Transaction.aggregate([
      { $match: { status: 'confirmed', fromRole: { $ne: 'super_admin' } } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const paid = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const flags = await Flag.countDocuments({ status: { $ne: 'resolved' } });

    return success(res, 'National stats loaded', {
      allocated: allocated[0]?.total || 0,
      released: released[0]?.total || 0,
      paidToBeneficiaries: (paid[0]?.total || 0) / 10000000,
      activeFlags: flags
    });
  } catch (err) {
    next(err);
  }
};

exports.getFundFlow = async (req, res, next) => {
  try {
    const { state, district, scheme } = req.query;
    const filter = { status: 'confirmed' };
    if (state) filter.stateCode = state;
    if (district) filter.districtCode = district;
    if (scheme) filter.schemeId = scheme;

    const centreToMinistry = await Transaction.aggregate([
      { $match: { ...filter, fromRole: 'super_admin' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const ministryToState = await Transaction.aggregate([
      { $match: { ...filter, fromRole: 'ministry_admin' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const stateToDistrict = await Transaction.aggregate([
      { $match: { ...filter, fromRole: 'state_admin' } },
      { $group: { _id: null, total: { $sum: '$amountCrore' } } }
    ]);
    const districtToBeneficiary = await Payment.aggregate([
      {
        $match: {
          ...(state && { state }),
          ...(district && { district }),
          status: 'success'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const allocated = centreToMinistry[0]?.total || 0;
    const toStates = ministryToState[0]?.total || 0;
    const toDistricts = stateToDistrict[0]?.total || 0;
    const toBeneficiary = (districtToBeneficiary[0]?.total || 0) / 10000000;
    const unaccounted = toDistricts - toBeneficiary;

    return success(res, 'Fund flow loaded', {
      allocated,
      toStates,
      toDistricts,
      toBeneficiary,
      unaccounted,
      leakagePercent: toDistricts > 0 ? ((unaccounted / toDistricts) * 100).toFixed(2) : 0
    });
  } catch (err) {
    next(err);
  }
};

exports.getPublicSchemes = async (req, res, next) => {
  try {
    const schemes = await Scheme.find({ status: 'active' }).select(
      'schemeId schemeName ownerMinistryName totalBudgetCrore startDate endDate'
    );
    return success(res, 'Schemes loaded', schemes);
  } catch (err) {
    next(err);
  }
};

exports.getPublicSchemeDetail = async (req, res, next) => {
  try {
    const scheme = await Scheme.findOne({ schemeId: req.params.id });
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    return success(res, 'Scheme loaded', scheme);
  } catch (err) {
    next(err);
  }
};

exports.verifyTransaction = async (req, res, next) => {
  try {
    const txHash = req.params.txHash;
    const tx = await Transaction.findOne({ blockchainTxHash: txHash });
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    return success(res, 'Transaction verified', tx);
  } catch (err) {
    next(err);
  }
};

exports.getPublicFlagStats = async (req, res, next) => {
  try {
    const counts = await Flag.aggregate([
      { $group: { _id: '$flagType', total: { $sum: 1 } } }
    ]);
    return success(res, 'Flag stats loaded', counts);
  } catch (err) {
    next(err);
  }
};
