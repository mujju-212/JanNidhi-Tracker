const Flag = require('../models/Flag.model');
const Transaction = require('../models/Transaction.model');
const Payment = require('../models/Payment.model');
const { emitToAuditors } = require('../config/socket');

exports.runFlagChecks = async (transaction, io) => {
  const flags = [];

  if (transaction.status === 'blocked') {
    flags.push({
      code: 'AMOUNT_MISMATCH',
      type: 'critical',
      reason: `Transfer of ${transaction.amountCrore} Cr exceeds available balance`
    });
  }

  const previousTx = await Transaction.findOne({
    toCode: transaction.fromCode,
    schemeId: transaction.schemeId,
    status: 'confirmed'
  }).sort({ createdAt: -1 });

  if (previousTx) {
    const hoursDiff =
      (new Date(transaction.createdAt) - new Date(previousTx.createdAt)) / 3600000;
    if (hoursDiff < 1 && !transaction.ucDocHash) {
      flags.push({
        code: 'SPEED_ANOMALY',
        type: 'high',
        reason: `Funds released within ${Math.round(hoursDiff * 60)} minutes of receiving with no UC uploaded`
      });
    }
  }

  const isRoundFigure = (transaction.amountCrore * 100) % 100 === 0;
  if (isRoundFigure && transaction.amountCrore >= 100) {
    const recentRoundTxCount = await Transaction.countDocuments({
      fromCode: transaction.fromCode,
      status: 'confirmed',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 3600000) }
    });
    if (recentRoundTxCount > 5) {
      flags.push({
        code: 'ROUND_FIGURE',
        type: 'medium',
        reason: `Repeated round-figure transactions from same entity (${recentRoundTxCount} in 30 days)`
      });
    }
  }

  for (const item of flags) {
    const flag = await Flag.create({
      flagId: `FLAG-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      transactionId: transaction.transactionId,
      blockchainTxHash: transaction.blockchainTxHash || 'PENDING',
      flagType: item.type,
      flagCode: item.code,
      flagReason: item.reason,
      raisedByType: 'auto_system',
      ministryCode: transaction.ministryCode,
      stateCode: transaction.stateCode,
      districtCode: transaction.districtCode,
      responseDeadline: new Date(Date.now() + 7 * 24 * 3600000),
      status: 'active'
    });

    await Transaction.findByIdAndUpdate(transaction._id, {
      isFlagged: true,
      flagId: flag._id
    });

    emitToAuditors(io, 'new_flag', {
      flagId: flag.flagId,
      flagType: item.type,
      flagCode: item.code,
      reason: item.reason,
      transaction: transaction.transactionId,
      amount: transaction.amountCrore,
      ministry: transaction.ministryCode,
      state: transaction.stateCode,
      timestamp: new Date()
    });
  }

  return flags;
};

exports.checkDuplicatePayment = async (aadhaarHash, schemeId, installmentNumber) => {
  const existing = await Payment.findOne({
    aadhaarHash,
    schemeId,
    installmentNumber,
    status: 'success'
  });
  return !!existing;
};
