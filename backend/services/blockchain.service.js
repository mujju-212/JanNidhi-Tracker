const { getContracts } = require('../config/blockchain');

// ═══════════════════════════════════════════════
//  WRITE FUNCTIONS (already existed)
// ═══════════════════════════════════════════════

// Check if a ministry wallet is registered on-chain
exports.isMinistryRegistered = async (walletAddress) => {
  const { fundManagerContract } = getContracts();
  return fundManagerContract.registeredMinistries(walletAddress);
};

// Register ministry on-chain (only if not already registered)
exports.registerMinistry = async (walletAddress, name, code, budgetCap) => {
  const { fundManagerContract } = getContracts();
  const alreadyRegistered = await fundManagerContract.registeredMinistries(walletAddress);
  if (alreadyRegistered) {
    console.log(`Ministry ${walletAddress} already registered on-chain, skipping`);
    return { txHash: null, blockNumber: null, skipped: true };
  }
  const tx = await fundManagerContract.registerMinistry(walletAddress, name, code, BigInt(budgetCap));
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

// Allocate budget — auto-registers ministry first if not registered
exports.allocateBudget = async (ministryWallet, amountCrore, transactionId, docHash, ministryName, ministryCode, budgetCap) => {
  const { fundManagerContract } = getContracts();

  // Auto-register if needed (prevents "Ministry not registered" revert)
  const alreadyRegistered = await fundManagerContract.registeredMinistries(ministryWallet);
  if (!alreadyRegistered) {
    console.log(`Auto-registering ministry ${ministryWallet} on Sepolia...`);
    const regTx = await fundManagerContract.registerMinistry(
      ministryWallet,
      ministryName || 'Unknown Ministry',
      ministryCode || 'UNKNOWN',
      BigInt(budgetCap || 99999)
    );
    await regTx.wait();
    console.log(`Ministry registered: ${ministryWallet}`);
  }

  const tx = await fundManagerContract.allocateBudget(
    ministryWallet,
    BigInt(amountCrore),
    transactionId,
    docHash || ''
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

exports.releaseFunds = async (toWallet, amountCrore, transactionId, schemeId, docHash) => {
  const { fundManagerContract } = getContracts();
  const tx = await fundManagerContract.releaseFunds(
    toWallet,
    BigInt(amountCrore),
    transactionId,
    schemeId,
    docHash || ''
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

exports.createScheme = async (schemeId, schemeName, ministryCode, budgetCrore, startDate, endDate) => {
  const { schemeRegistryContract } = getContracts();
  const tx = await schemeRegistryContract.createScheme(
    schemeId,
    schemeName,
    ministryCode,
    BigInt(budgetCrore),
    Math.floor(new Date(startDate).getTime() / 1000),
    Math.floor(new Date(endDate).getTime() / 1000)
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

exports.enrollBeneficiary = async (aadhaarHash, schemeId) => {
  const { auditLoggerContract } = getContracts();
  const tx = await auditLoggerContract.enrollBeneficiary(aadhaarHash, schemeId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

exports.recordPayment = async (paymentId, aadhaarHash, schemeId, amount) => {
  const { auditLoggerContract } = getContracts();
  const tx = await auditLoggerContract.recordPayment(paymentId, aadhaarHash, schemeId, BigInt(amount));
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

exports.raiseFlag = async (flagId, transactionId, flagCode, flagReason) => {
  const { auditLoggerContract } = getContracts();
  const tx = await auditLoggerContract.raiseFlag(flagId, transactionId, flagCode, flagReason);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

// ═══════════════════════════════════════════════
//  READ FUNCTIONS — FROM BLOCKCHAIN (NEW!)
// ═══════════════════════════════════════════════

// Read a ministry directly from blockchain
exports.getMinistryFromChain = async (walletAddress) => {
  const { fundManagerContract, blockchainReady } = getContracts();
  if (!blockchainReady) return null;
  try {
    const data = await fundManagerContract.getMinistry(walletAddress);
    return {
      name: data.name || data[0],
      code: data.code || data[1],
      budgetCapCrore: Number(data.budgetCapCrore ?? data[2]),
      allocatedCrore: Number(data.allocatedCrore ?? data[3]),
      releasedCrore: Number(data.releasedCrore ?? data[4]),
      isActive: data.isActive ?? data[5],
      createdAt: Number(data.createdAt ?? data[6]),
      source: 'blockchain'
    };
  } catch (err) {
    console.warn(`[getMinistryFromChain] ${walletAddress}:`, err.message);
    return null;
  }
};

// Read blockchain balance for a wallet
exports.getBalanceFromChain = async (walletAddress) => {
  const { fundManagerContract, blockchainReady } = getContracts();
  if (!blockchainReady) return null;
  try {
    const balance = await fundManagerContract.getBalance(walletAddress);
    return { balance: Number(balance), source: 'blockchain' };
  } catch (err) {
    console.warn(`[getBalanceFromChain] ${walletAddress}:`, err.message);
    return null;
  }
};

// Read a transaction directly from blockchain by transactionId
exports.getTransactionFromChain = async (transactionId) => {
  const { fundManagerContract, blockchainReady } = getContracts();
  if (!blockchainReady) return null;
  try {
    const data = await fundManagerContract.getTransaction(transactionId);
    const txId = data.transactionId || data[0];
    if (!txId || txId === '') return null; // transaction not found on chain
    return {
      transactionId: txId,
      from: data.from || data[1],
      to: data.to || data[2],
      amountCrore: Number(data.amountCrore ?? data[3]),
      schemeId: data.schemeId || data[4],
      docHash: data.docHash || data[5],
      timestamp: Number(data.timestamp ?? data[6]),
      isFlagged: data.isFlagged ?? data[7],
      source: 'blockchain'
    };
  } catch (err) {
    console.warn(`[getTransactionFromChain] ${transactionId}:`, err.message);
    return null;
  }
};

// Read a scheme directly from blockchain
exports.getSchemeFromChain = async (schemeId) => {
  const { schemeRegistryContract, blockchainReady } = getContracts();
  if (!blockchainReady) return null;
  try {
    const data = await schemeRegistryContract.getScheme(schemeId);
    const sid = data.schemeId || data[0];
    if (!sid || sid === '') return null;
    return {
      schemeId: sid,
      schemeName: data.schemeName || data[1],
      ministryCode: data.ministryCode || data[2],
      totalBudgetCrore: Number(data.totalBudgetCrore ?? data[3]),
      startDate: Number(data.startDate ?? data[4]),
      endDate: Number(data.endDate ?? data[5]),
      isActive: data.isActive ?? data[6],
      createdAt: Number(data.createdAt ?? data[7]),
      source: 'blockchain'
    };
  } catch (err) {
    console.warn(`[getSchemeFromChain] ${schemeId}:`, err.message);
    return null;
  }
};

// Check if scheme is active on blockchain
exports.isSchemeActiveOnChain = async (schemeId) => {
  const { schemeRegistryContract, blockchainReady } = getContracts();
  if (!blockchainReady) return null;
  try {
    return await schemeRegistryContract.isSchemeActive(schemeId);
  } catch { return null; }
};

// Read enrollment from blockchain
exports.getEnrollmentFromChain = async (aadhaarHash) => {
  const { auditLoggerContract, blockchainReady } = getContracts();
  if (!blockchainReady) return null;
  try {
    const data = await auditLoggerContract.enrollments(aadhaarHash);
    const hash = data.aadhaarHash || data[0];
    if (!hash || hash === '') return null;
    return {
      aadhaarHash: hash,
      schemeId: data.schemeId || data[1],
      enrolledAt: Number(data.enrolledAt ?? data[2]),
      enrolledBy: data.enrolledBy || data[3],
      source: 'blockchain'
    };
  } catch (err) { return null; }
};

// Check enrollment on chain
exports.isEnrolledOnChain = async (aadhaarHash, schemeId) => {
  const { auditLoggerContract, blockchainReady } = getContracts();
  if (!blockchainReady) return null;
  try {
    return await auditLoggerContract.isEnrolled(aadhaarHash, schemeId);
  } catch { return null; }
};

// Read payment from blockchain
exports.getPaymentFromChain = async (paymentId) => {
  const { auditLoggerContract, blockchainReady } = getContracts();
  if (!blockchainReady) return null;
  try {
    const data = await auditLoggerContract.payments(paymentId);
    const pid = data.paymentId || data[0];
    if (!pid || pid === '') return null;
    return {
      paymentId: pid,
      aadhaarHash: data.aadhaarHash || data[1],
      schemeId: data.schemeId || data[2],
      amount: Number(data.amount ?? data[3]),
      paidAt: Number(data.paidAt ?? data[4]),
      paidBy: data.paidBy || data[5],
      source: 'blockchain'
    };
  } catch (err) { return null; }
};

// Read flag from blockchain
exports.getFlagFromChain = async (flagId) => {
  const { auditLoggerContract, blockchainReady } = getContracts();
  if (!blockchainReady) return null;
  try {
    const data = await auditLoggerContract.getFlag(flagId);
    const fid = data.flagId || data[0];
    if (!fid || fid === '') return null;
    return {
      flagId: fid,
      transactionId: data.transactionId || data[1],
      flagCode: data.flagCode || data[2],
      flagReason: data.flagReason || data[3],
      raisedBy: data.raisedBy || data[4],
      timestamp: Number(data.timestamp ?? data[5]),
      isResolved: data.isResolved ?? data[6],
      source: 'blockchain'
    };
  } catch (err) { return null; }
};

// ═══════════════════════════════════════════════
//  CROSS-VERIFY: Compare MongoDB vs Blockchain
// ═══════════════════════════════════════════════

exports.verifyTransaction = async (transactionId, mongoData) => {
  const chainData = await exports.getTransactionFromChain(transactionId);
  if (!chainData) return { verified: false, reason: 'Not found on blockchain', chainData: null, mongoData };

  const mismatches = [];
  if (mongoData.amountCrore !== undefined && Number(mongoData.amountCrore) !== chainData.amountCrore) {
    mismatches.push(`Amount: DB=${mongoData.amountCrore} vs Chain=${chainData.amountCrore}`);
  }
  if (mongoData.schemeId && mongoData.schemeId !== 'BUDGET_ALLOCATION' && chainData.schemeId && mongoData.schemeId !== chainData.schemeId) {
    mismatches.push(`Scheme: DB=${mongoData.schemeId} vs Chain=${chainData.schemeId}`);
  }
  if (chainData.isFlagged && !mongoData.isFlagged) {
    mismatches.push('Flagged on chain but not in DB');
  }

  return {
    verified: mismatches.length === 0,
    mismatches,
    chainData,
    mongoData: { transactionId: mongoData.transactionId, amountCrore: mongoData.amountCrore, schemeId: mongoData.schemeId },
    source: 'cross_verified'
  };
};
