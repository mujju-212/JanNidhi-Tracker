require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User.model');
const Scheme = require('../models/Scheme.model');
const Transaction = require('../models/Transaction.model');
const Beneficiary = require('../models/Beneficiary.model');
const Payment = require('../models/Payment.model');
const Flag = require('../models/Flag.model');
const Complaint = require('../models/Complaint.model');
const { initializeBlockchain, getContracts } = require('../config/blockchain');

const TARGETS = {
  superAdminWallet: '0x482c64D4f5db307A0BA0b8a89E47A029e97d4D68',
  ministryWallet: '0x8FA367e26E1c9f303c9e87c32d595d02679BA621',
  stateWallet: '0xb167128A58dDC814C5ed848412cC43d09781e0c5'
};

async function updateUsers() {
  await User.findOneAndUpdate(
    { role: 'super_admin' },
    { walletAddress: TARGETS.superAdminWallet.toLowerCase() },
    { new: true }
  );

  await User.findOneAndUpdate(
    {
      role: 'ministry_admin',
      $or: [
        { email: 'secretary@mohfw.gov.in' },
        { email: 'secretary@education.gov.in' },
        { 'jurisdiction.ministryCode': { $in: ['MOHFW', 'MOE'] } }
      ]
    },
    {
      fullName: 'Dr. Rajesh Kumar',
      email: 'secretary@education.gov.in',
      designation: 'Secretary, Ministry of Education',
      walletAddress: TARGETS.ministryWallet.toLowerCase(),
      'jurisdiction.ministry': 'Ministry of Education',
      'jurisdiction.ministryCode': 'MOE'
    },
    { new: true }
  );

  await User.findOneAndUpdate(
    {
      role: 'state_admin',
      $or: [
        { email: 'finance@maharashtra.gov.in' },
        { email: 'finance@karnataka.gov.in' },
        { 'jurisdiction.stateCode': { $in: ['MH', 'KA'] } }
      ]
    },
    {
      fullName: 'Rajiv Deshmukh',
      email: 'finance@karnataka.gov.in',
      designation: 'Principal Secretary, Finance',
      walletAddress: TARGETS.stateWallet.toLowerCase(),
      'jurisdiction.ministry': 'Ministry of Education',
      'jurisdiction.ministryCode': 'MOE',
      'jurisdiction.state': 'Karnataka',
      'jurisdiction.stateCode': 'KA'
    },
    { new: true }
  );

  await User.findOneAndUpdate(
    {
      role: 'district_admin',
      $or: [
        { email: 'collector@pune.gov.in' },
        { email: 'collector@bengaluru.gov.in' },
        { 'jurisdiction.districtCode': { $in: ['PUNE', 'BLR'] } }
      ]
    },
    {
      fullName: 'Sanjay Patil',
      email: 'collector@bengaluru.gov.in',
      designation: 'District Commissioner, Bengaluru Urban',
      'jurisdiction.state': 'Karnataka',
      'jurisdiction.stateCode': 'KA',
      'jurisdiction.district': 'Bengaluru Urban',
      'jurisdiction.districtCode': 'BLR'
    },
    { new: true }
  );
}

async function updateDemoData() {
  await Scheme.updateMany(
    { ownerMinistryCode: { $in: ['MOHFW', 'MOE'] } },
    { ownerMinistryCode: 'MOE', ownerMinistryName: 'Ministry of Education' }
  );

  await Transaction.updateMany(
    { ministryCode: 'MOHFW' },
    { ministryCode: 'MOE' }
  );
  await Transaction.updateMany(
    { fromCode: 'MOHFW' },
    { fromCode: 'MOE', fromName: 'Ministry of Education' }
  );
  await Transaction.updateMany(
    { toCode: 'MOHFW' },
    { toCode: 'MOE', toName: 'Ministry of Education', toWalletAddress: TARGETS.ministryWallet.toLowerCase() }
  );
  await Transaction.updateMany(
    { stateCode: 'MH' },
    { stateCode: 'KA' }
  );
  await Transaction.updateMany(
    { fromCode: 'MH' },
    { fromCode: 'KA', fromName: 'Karnataka' }
  );
  await Transaction.updateMany(
    { toCode: 'MH' },
    { toCode: 'KA', toName: 'Karnataka', toWalletAddress: TARGETS.stateWallet.toLowerCase() }
  );
  await Transaction.updateMany(
    { districtCode: 'PUNE' },
    { districtCode: 'BLR' }
  );
  await Transaction.updateMany(
    { fromCode: 'PUNE' },
    { fromCode: 'BLR', fromName: 'Bengaluru Urban' }
  );
  await Transaction.updateMany(
    { toCode: 'PUNE' },
    { toCode: 'BLR', toName: 'Bengaluru Urban' }
  );

  await Beneficiary.updateMany(
    { state: 'Maharashtra', district: 'Pune' },
    { state: 'Karnataka', district: 'Bengaluru Urban' }
  );
  await Beneficiary.updateMany(
    { 'enrolledSchemes.enrolledByDistrict': 'Pune' },
    { $set: { 'enrolledSchemes.$[item].enrolledByDistrict': 'Bengaluru Urban' } },
    { arrayFilters: [{ 'item.enrolledByDistrict': 'Pune' }] }
  );

  await Payment.updateMany(
    { state: 'Maharashtra', district: 'Pune' },
    { state: 'Karnataka', district: 'Bengaluru Urban' }
  );

  await Flag.updateMany(
    { ministryCode: 'MOHFW' },
    { ministryCode: 'MOE' }
  );
  await Flag.updateMany(
    { stateCode: 'MH' },
    { stateCode: 'KA' }
  );
  await Flag.updateMany(
    { districtCode: 'PUNE' },
    { districtCode: 'BLR' }
  );

  await Complaint.updateMany(
    { state: 'Maharashtra', district: 'Pune' },
    { state: 'Karnataka', district: 'Bengaluru Urban' }
  );
}

async function printSummary() {
  const users = await User.find(
    { role: { $in: ['super_admin', 'ministry_admin', 'state_admin', 'district_admin'] } },
    { role: 1, email: 1, walletAddress: 1, jurisdiction: 1 }
  )
    .sort({ role: 1 })
    .lean();

  console.log('\nUpdated role mappings:');
  console.log(JSON.stringify(users, null, 2));

  const { fundManagerContract, blockchainReady } = getContracts();
  if (!blockchainReady || !fundManagerContract) {
    console.log('\nBlockchain not ready in script, skipped on-chain balance check.');
    return;
  }

  const ministryBalance = await fundManagerContract.walletBalance(TARGETS.ministryWallet);
  const stateBalance = await fundManagerContract.walletBalance(TARGETS.stateWallet);

  console.log('\nOn-chain balances:');
  console.log(`Ministry (${TARGETS.ministryWallet}): ${Number(ministryBalance)} Cr`);
  console.log(`State (${TARGETS.stateWallet}): ${Number(stateBalance)} Cr`);
}

async function run() {
  await connectDB();
  await initializeBlockchain();
  await updateUsers();
  await updateDemoData();
  await printSummary();
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Sync failed:', error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
