const { getContracts } = require('../config/blockchain');

exports.registerMinistry = async (walletAddress, name, code, budgetCap) => {
  const { fundManagerContract } = getContracts();
  const tx = await fundManagerContract.registerMinistry(walletAddress, name, code, budgetCap);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

exports.allocateBudget = async (ministryWallet, amountCrore, transactionId, docHash) => {
  const { fundManagerContract } = getContracts();
  const tx = await fundManagerContract.allocateBudget(
    ministryWallet,
    amountCrore,
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
    amountCrore,
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
    budgetCrore,
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
  const tx = await auditLoggerContract.recordPayment(paymentId, aadhaarHash, schemeId, amount);
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
