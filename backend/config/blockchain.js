const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

let provider;
let signer;
let fundManagerContract;
let schemeRegistryContract;
let auditLoggerContract;
let blockchainReady = false;

// Safe ABI loader — returns empty array if file not found yet
const loadABI = (filename) => {
  const filePath = path.join(__dirname, '../abis', filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ABI not found: ${filename} — deploy contracts first`);
    return [];
  }
  return require(filePath);
};

const initializeBlockchain = async () => {
  try {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const fundManagerAddress = process.env.FUND_MANAGER_CONTRACT;
    const schemeRegistryAddress = process.env.SCHEME_REGISTRY_CONTRACT;
    const auditLoggerAddress = process.env.AUDIT_LOGGER_CONTRACT;

    // Skip if placeholder values still in .env
    if (!privateKey || privateKey.includes('YourHardhat') || privateKey.includes('YourAddress')) {
      console.warn('⚠️  Blockchain: Contract addresses not set in .env — skipping blockchain init');
      console.warn('   → Deploy contracts on Remix, then update FUND_MANAGER_CONTRACT etc. in .env');
      return;
    }

    const FundManagerABI    = loadABI('FundManager.json');
    const SchemeRegistryABI = loadABI('SchemeRegistry.json');
    const AuditLoggerABI    = loadABI('AuditLogger.json');

    if (!FundManagerABI.length || !SchemeRegistryABI.length || !AuditLoggerABI.length) {
      console.warn('⚠️  Blockchain: ABI files missing — paste ABIs from Remix into backend/abis/');
      return;
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);
    signer   = new ethers.Wallet(privateKey, provider);

    fundManagerContract    = new ethers.Contract(fundManagerAddress,    FundManagerABI,    signer);
    schemeRegistryContract = new ethers.Contract(schemeRegistryAddress, SchemeRegistryABI, signer);
    auditLoggerContract    = new ethers.Contract(auditLoggerAddress,    AuditLoggerABI,    signer);

    const network = await provider.getNetwork();
    blockchainReady = true;
    console.log(`✅ Blockchain connected — Chain ID: ${network.chainId} (Sepolia=11155111)`);

  } catch (err) {
    console.warn(`⚠️  Blockchain init failed: ${err.message}`);
    console.warn('   → Server will run without blockchain until contracts are deployed');
  }
};

const getContracts = () => ({
  fundManagerContract,
  schemeRegistryContract,
  auditLoggerContract,
  provider,
  signer,
  blockchainReady
});

module.exports = { initializeBlockchain, getContracts };
