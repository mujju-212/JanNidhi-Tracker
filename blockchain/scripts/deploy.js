const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with:', deployer.address);

  const FundManager = await ethers.getContractFactory('FundManager');
  const fm = await FundManager.deploy();
  await fm.waitForDeployment();
  console.log('FundManager:', await fm.getAddress());

  const SchemeRegistry = await ethers.getContractFactory('SchemeRegistry');
  const sr = await SchemeRegistry.deploy();
  await sr.waitForDeployment();
  console.log('SchemeRegistry:', await sr.getAddress());

  const AuditLogger = await ethers.getContractFactory('AuditLogger');
  const al = await AuditLogger.deploy();
  await al.waitForDeployment();
  console.log('AuditLogger:', await al.getAddress());

  console.log('Copy these addresses to backend/.env');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
