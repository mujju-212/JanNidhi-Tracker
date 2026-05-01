const { getContracts } = require('../config/blockchain');

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

exports.getBalance = async (walletAddress) => {
  const { fundManagerContract } = getContracts();
  return fundManagerContract.getBalance(walletAddress);
};
