const { ethers } = require('ethers');
const FundManagerABI = require('../abis/FundManager.json');
const SchemeRegistryABI = require('../abis/SchemeRegistry.json');
const AuditLoggerABI = require('../abis/AuditLogger.json');

let provider;
let signer;
let fundManagerContract;
let schemeRegistryContract;
let auditLoggerContract;

const requireEnv = (key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not set`);
  }
  return process.env[key];
};

const initializeBlockchain = async () => {
  const rpcUrl = requireEnv('BLOCKCHAIN_RPC_URL');
  const privateKey = requireEnv('PRIVATE_KEY');
  const fundManagerAddress = requireEnv('FUND_MANAGER_CONTRACT');
  const schemeRegistryAddress = requireEnv('SCHEME_REGISTRY_CONTRACT');
  const auditLoggerAddress = requireEnv('AUDIT_LOGGER_CONTRACT');

  provider = new ethers.JsonRpcProvider(rpcUrl);
  signer = new ethers.Wallet(privateKey, provider);

  fundManagerContract = new ethers.Contract(fundManagerAddress, FundManagerABI, signer);
  schemeRegistryContract = new ethers.Contract(schemeRegistryAddress, SchemeRegistryABI, signer);
  auditLoggerContract = new ethers.Contract(auditLoggerAddress, AuditLoggerABI, signer);

  const network = await provider.getNetwork();
  console.log(`Blockchain connected on chain ${network.chainId}`);
};

const getContracts = () => ({
  fundManagerContract,
  schemeRegistryContract,
  auditLoggerContract,
  provider,
  signer
});

module.exports = { initializeBlockchain, getContracts };
