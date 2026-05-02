/**
 * Seed demo transaction data for CAG auditor views.
 * Run: node seeds/seed-transactions.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jannidhi';

const sampleTransactions = [
  // ─── CENTRE → MINISTRY ───
  {
    transactionId: 'TXN-2024-MOHFW-001',
    blockchainTxHash: '0xdemo_sa_to_ministry_tx_hash_001',
    blockNumber: 7200001,
    fromRole: 'super_admin',
    fromWalletAddress: '0x482c64D4f5db307A0BA0b8a89E47A029e97d4D68',
    fromName: 'Finance Ministry of India',
    fromCode: 'FIN_MIN',
    toRole: 'ministry_admin',
    toWalletAddress: '0x8FA367e26E1c9f303c9e87c32d595d02679BA621',
    toName: 'Ministry of Health & Family Welfare',
    toCode: 'MOHFW',
    amountCrore: 500,
    schemeId: 'PM-KISAN-2024',
    schemeName: 'PM Kisan Samman Nidhi',
    financialYear: '2024-25',
    quarter: 'Q1',
    ministryCode: 'MOHFW',
    status: 'confirmed',
    validations: { amountCheck: true, walletCheck: true, ucCheck: true, schemeActiveCheck: true }
  },
  {
    transactionId: 'TXN-2024-MOHFW-002',
    blockchainTxHash: '0xdemo_sa_to_ministry_tx_hash_002',
    blockNumber: 7200050,
    fromRole: 'super_admin',
    fromWalletAddress: '0x482c64D4f5db307A0BA0b8a89E47A029e97d4D68',
    fromName: 'Finance Ministry of India',
    fromCode: 'FIN_MIN',
    toRole: 'ministry_admin',
    toWalletAddress: '0x8FA367e26E1c9f303c9e87c32d595d02679BA621',
    toName: 'Ministry of Health & Family Welfare',
    toCode: 'MOHFW',
    amountCrore: 300,
    schemeId: 'PMJAY-2024',
    schemeName: 'Ayushman Bharat PMJAY',
    financialYear: '2024-25',
    quarter: 'Q2',
    ministryCode: 'MOHFW',
    status: 'confirmed',
    validations: { amountCheck: true, walletCheck: true, ucCheck: true, schemeActiveCheck: true }
  },

  // ─── MINISTRY → STATE ───
  {
    transactionId: 'TXN-2024-MOHFW-KA-001',
    blockchainTxHash: '0xdemo_ministry_to_state_tx_hash_001',
    blockNumber: 7200100,
    fromRole: 'ministry_admin',
    fromWalletAddress: '0x8FA367e26E1c9f303c9e87c32d595d02679BA621',
    fromName: 'Ministry of Health & Family Welfare',
    fromCode: 'MOHFW',
    toRole: 'state_admin',
    toWalletAddress: '0xcF6D4a40301552e1405FBa27638549346081AeC9',
    toName: 'State of Karnataka',
    toCode: 'KA',
    amountCrore: 200,
    schemeId: 'PM-KISAN-2024',
    schemeName: 'PM Kisan Samman Nidhi',
    financialYear: '2024-25',
    quarter: 'Q1',
    ministryCode: 'MOHFW',
    stateCode: 'KA',
    status: 'confirmed',
    validations: { amountCheck: true, walletCheck: true, ucCheck: true, schemeActiveCheck: true }
  },
  {
    transactionId: 'TXN-2024-MOHFW-MH-001',
    blockchainTxHash: '0xdemo_ministry_to_state_tx_hash_002',
    blockNumber: 7200150,
    fromRole: 'ministry_admin',
    fromWalletAddress: '0x8FA367e26E1c9f303c9e87c32d595d02679BA621',
    fromName: 'Ministry of Health & Family Welfare',
    fromCode: 'MOHFW',
    toRole: 'state_admin',
    toWalletAddress: '0xABCD1234567890abcdef1234567890ABCDef0001',
    toName: 'State of Maharashtra',
    toCode: 'MH',
    amountCrore: 150,
    schemeId: 'PMJAY-2024',
    schemeName: 'Ayushman Bharat PMJAY',
    financialYear: '2024-25',
    quarter: 'Q2',
    ministryCode: 'MOHFW',
    stateCode: 'MH',
    status: 'confirmed',
    validations: { amountCheck: true, walletCheck: true, ucCheck: true, schemeActiveCheck: true }
  },

  // ─── STATE → DISTRICT ───
  {
    transactionId: 'TXN-2024-KA-BLR-001',
    blockchainTxHash: '0xdemo_state_to_district_tx_hash_001',
    blockNumber: 7200200,
    fromRole: 'state_admin',
    fromWalletAddress: '0xcF6D4a40301552e1405FBa27638549346081AeC9',
    fromName: 'State of Karnataka',
    fromCode: 'KA',
    toRole: 'district_admin',
    toWalletAddress: '0xDIST_BLR_001',
    toName: 'Bangalore Urban District',
    toCode: 'BLR',
    amountCrore: 80,
    schemeId: 'PM-KISAN-2024',
    schemeName: 'PM Kisan Samman Nidhi',
    financialYear: '2024-25',
    quarter: 'Q1',
    ministryCode: 'MOHFW',
    stateCode: 'KA',
    districtCode: 'BLR',
    status: 'confirmed',
    validations: { amountCheck: true, walletCheck: true, ucCheck: true, schemeActiveCheck: true }
  },
  {
    transactionId: 'TXN-2024-KA-MYS-001',
    blockchainTxHash: '0xdemo_state_to_district_tx_hash_002',
    blockNumber: 7200250,
    fromRole: 'state_admin',
    fromWalletAddress: '0xcF6D4a40301552e1405FBa27638549346081AeC9',
    fromName: 'State of Karnataka',
    fromCode: 'KA',
    toRole: 'district_admin',
    toWalletAddress: '0xDIST_MYS_001',
    toName: 'Mysore District',
    toCode: 'MYS',
    amountCrore: 60,
    schemeId: 'PM-KISAN-2024',
    schemeName: 'PM Kisan Samman Nidhi',
    financialYear: '2024-25',
    quarter: 'Q1',
    ministryCode: 'MOHFW',
    stateCode: 'KA',
    districtCode: 'MYS',
    status: 'confirmed',
    validations: { amountCheck: true, walletCheck: true, ucCheck: true, schemeActiveCheck: true }
  },

  // ─── PENDING TRANSACTION (for flag demo) ───
  {
    transactionId: 'TXN-2024-MOHFW-KA-PENDING',
    blockchainTxHash: 'PENDING',
    blockNumber: null,
    fromRole: 'ministry_admin',
    fromWalletAddress: '0x8FA367e26E1c9f303c9e87c32d595d02679BA621',
    fromName: 'Ministry of Health & Family Welfare',
    fromCode: 'MOHFW',
    toRole: 'state_admin',
    toWalletAddress: '0xcF6D4a40301552e1405FBa27638549346081AeC9',
    toName: 'State of Karnataka',
    toCode: 'KA',
    amountCrore: 50,
    schemeId: 'PM-KISAN-2024',
    schemeName: 'PM Kisan Samman Nidhi',
    financialYear: '2024-25',
    quarter: 'Q3',
    ministryCode: 'MOHFW',
    stateCode: 'KA',
    status: 'pending',
    validations: { amountCheck: true, walletCheck: false, ucCheck: false, schemeActiveCheck: true }
  },

  // ─── FLAGGED TRANSACTION ───
  {
    transactionId: 'TXN-2024-MH-SUSPICIOUS',
    blockchainTxHash: '0xdemo_flagged_tx_hash_001',
    blockNumber: 7200300,
    fromRole: 'state_admin',
    fromWalletAddress: '0xABCD1234567890abcdef1234567890ABCDef0001',
    fromName: 'State of Maharashtra',
    fromCode: 'MH',
    toRole: 'district_admin',
    toWalletAddress: '0xDIST_PUNE_001',
    toName: 'Pune District',
    toCode: 'PUNE',
    amountCrore: 120,
    schemeId: 'PMJAY-2024',
    schemeName: 'Ayushman Bharat PMJAY',
    financialYear: '2024-25',
    quarter: 'Q2',
    ministryCode: 'MOHFW',
    stateCode: 'MH',
    districtCode: 'PUNE',
    status: 'confirmed',
    isFlagged: true,
    validations: { amountCheck: false, walletCheck: true, ucCheck: false, schemeActiveCheck: true }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let inserted = 0;
    let skipped = 0;

    for (const tx of sampleTransactions) {
      const exists = await Transaction.findOne({ transactionId: tx.transactionId });
      if (exists) {
        skipped++;
        continue;
      }
      await Transaction.create(tx);
      inserted++;
    }

    console.log(`✅ Seed complete: ${inserted} inserted, ${skipped} skipped (already exist)`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
