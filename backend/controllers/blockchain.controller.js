const bcService = require('../services/blockchain.service');
const Transaction = require('../models/Transaction.model');
const Payment = require('../models/Payment.model');
const { success, error } = require('../utils/apiResponse');

// Verify ministry on blockchain — read directly from FundManager contract
exports.verifyMinistry = async (req, res, next) => {
  try {
    const { wallet } = req.params;
    const chainData = await bcService.getMinistryFromChain(wallet);
    if (!chainData) return error(res, 'Ministry not found on blockchain or blockchain unavailable', 404);
    return success(res, 'Ministry verified from blockchain', chainData);
  } catch (err) { next(err); }
};

// Verify transaction on blockchain — cross-check with MongoDB
exports.verifyTransaction = async (req, res, next) => {
  try {
    const { txId } = req.params;

    // Read from blockchain
    const chainData = await bcService.getTransactionFromChain(txId);

    // Read from MongoDB for cross-check
    const mongoData = await Transaction.findOne({ transactionId: txId }).lean();

    if (!chainData && !mongoData) {
      return error(res, 'Transaction not found in blockchain or database', 404);
    }

    // If both exist, cross-verify
    if (chainData && mongoData) {
      const result = await bcService.verifyTransaction(txId, mongoData);
      return success(res, result.verified ? 'Transaction VERIFIED — DB matches Blockchain' : 'MISMATCH DETECTED', {
        ...result,
        etherscanUrl: mongoData.blockchainTxHash && mongoData.blockchainTxHash !== 'PENDING'
          ? `https://sepolia.etherscan.io/tx/${mongoData.blockchainTxHash}`
          : null
      });
    }

    // Only on chain
    if (chainData && !mongoData) {
      return success(res, 'Found on blockchain but NOT in database — possible DB tamper', {
        verified: false, reason: 'EXISTS_ON_CHAIN_ONLY', chainData, mongoData: null
      });
    }

    // Only in DB
    return success(res, 'Found in database but NOT on blockchain', {
      verified: false, reason: 'EXISTS_IN_DB_ONLY', chainData: null,
      mongoData: { transactionId: mongoData.transactionId, amountCrore: mongoData.amountCrore, status: mongoData.status }
    });
  } catch (err) { next(err); }
};

// Verify scheme on blockchain
exports.verifyScheme = async (req, res, next) => {
  try {
    const { schemeId } = req.params;
    const chainData = await bcService.getSchemeFromChain(schemeId);
    if (!chainData) return error(res, 'Scheme not found on blockchain', 404);

    // Convert timestamps to readable dates
    chainData.startDateReadable = new Date(chainData.startDate * 1000).toLocaleDateString();
    chainData.endDateReadable = new Date(chainData.endDate * 1000).toLocaleDateString();
    chainData.createdAtReadable = new Date(chainData.createdAt * 1000).toLocaleString();

    return success(res, 'Scheme verified from blockchain', chainData);
  } catch (err) { next(err); }
};

// Verify payment on blockchain
exports.verifyPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const chainData = await bcService.getPaymentFromChain(paymentId);
    if (!chainData) return error(res, 'Payment not found on blockchain', 404);

    chainData.paidAtReadable = new Date(chainData.paidAt * 1000).toLocaleString();

    // Cross-check with MongoDB
    const mongoPayment = await Payment.findOne({ paymentId }).lean();
    const amountMatch = mongoPayment ? Number(mongoPayment.amount) === chainData.amount : null;

    return success(res, 'Payment verified from blockchain', {
      chainData,
      crossCheck: {
        foundInDb: !!mongoPayment,
        amountMatch,
        dbAmount: mongoPayment?.amount,
        chainAmount: chainData.amount
      }
    });
  } catch (err) { next(err); }
};

// Verify enrollment on blockchain
exports.verifyEnrollment = async (req, res, next) => {
  try {
    const { aadhaarHash } = req.params;
    const chainData = await bcService.getEnrollmentFromChain(aadhaarHash);
    if (!chainData) return error(res, 'Enrollment not found on blockchain', 404);

    chainData.enrolledAtReadable = new Date(chainData.enrolledAt * 1000).toLocaleString();
    return success(res, 'Enrollment verified from blockchain', chainData);
  } catch (err) { next(err); }
};

// Verify flag on blockchain
exports.verifyFlag = async (req, res, next) => {
  try {
    const { flagId } = req.params;
    const chainData = await bcService.getFlagFromChain(flagId);
    if (!chainData) return error(res, 'Flag not found on blockchain', 404);

    chainData.timestampReadable = new Date(chainData.timestamp * 1000).toLocaleString();
    return success(res, 'Flag verified from blockchain', chainData);
  } catch (err) { next(err); }
};

// Get on-chain balance
exports.getBalance = async (req, res, next) => {
  try {
    const { wallet } = req.params;
    const data = await bcService.getBalanceFromChain(wallet);
    if (!data) return error(res, 'Unable to read balance from blockchain', 500);
    return success(res, 'Balance read from blockchain', data);
  } catch (err) { next(err); }
};
