// seed-demo.js — Seeds realistic demo data for hackathon
// Run: node seed-demo.js
// Does NOT touch users collection (seed.js handles that)

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Scheme = require('./models/Scheme.model');
const Transaction = require('./models/Transaction.model');
const Beneficiary = require('./models/Beneficiary.model');
const Payment = require('./models/Payment.model');
const Flag = require('./models/Flag.model');
const Complaint = require('./models/Complaint.model');
const User = require('./models/User.model');

const run = async () => {
  await connectDB();

  // Fetch seeded users
  const superAdmin = await User.findOne({ role: 'super_admin' });
  const ministry = await User.findOne({ role: 'ministry_admin' });
  const state = await User.findOne({ role: 'state_admin' });
  const district = await User.findOne({ role: 'district_admin' });

  if (!superAdmin || !ministry || !state || !district) {
    console.error('Run seed.js first to create users');
    process.exit(1);
  }

  // Clear old demo data (keep users)
  await Scheme.deleteMany({});
  await Transaction.deleteMany({});
  await Beneficiary.deleteMany({});
  await Payment.deleteMany({});
  await Flag.deleteMany({});
  await Complaint.deleteMany({});
  console.log('Cleared old demo data');

  // ─── 1. SCHEMES ───
  const schemes = await Scheme.insertMany([
    {
      schemeId: 'PM-KISAN-2024', schemeName: 'PM Kisan Samman Nidhi', description: 'Direct income support of Rs 6000/year to farmer families',
      ownerMinistryCode: 'MOHFW', ownerMinistryName: 'Ministry of Health & Family Welfare', createdByUser: ministry._id,
      schemeType: 'central_sector', totalBudgetCrore: 60000, perBeneficiaryAmount: 6000,
      beneficiaryAmountType: 'annual', targetBeneficiaries: 100000000,
      startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), status: 'active',
      blockchainTxHash: '0xdemo_scheme_1', blockNumber: 1001
    },
    {
      schemeId: 'AYUSHMAN-2024', schemeName: 'Ayushman Bharat PMJAY', description: 'Health insurance cover of Rs 5 lakh per family per year',
      ownerMinistryCode: 'MOHFW', ownerMinistryName: 'Ministry of Health & Family Welfare', createdByUser: ministry._id,
      schemeType: 'centrally_sponsored', fundingRatioCentre: 60, fundingRatioState: 40,
      totalBudgetCrore: 7200, perBeneficiaryAmount: 500000,
      beneficiaryAmountType: 'annual', targetBeneficiaries: 50000000,
      startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), status: 'active',
      blockchainTxHash: '0xdemo_scheme_2', blockNumber: 1002
    },
    {
      schemeId: 'UJJWALA-2024', schemeName: 'Pradhan Mantri Ujjwala Yojana', description: 'Free LPG connections to women from BPL households',
      ownerMinistryCode: 'MOHFW', ownerMinistryName: 'Ministry of Health & Family Welfare', createdByUser: ministry._id,
      schemeType: 'central_sector', totalBudgetCrore: 1800, perBeneficiaryAmount: 1600,
      beneficiaryAmountType: 'one_time', targetBeneficiaries: 10000000,
      startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), status: 'active',
      blockchainTxHash: '0xdemo_scheme_3', blockNumber: 1003
    }
  ]);
  console.log('✅ 3 schemes created');

  // ─── 2. TRANSACTIONS (Fund Flow Chain) ───
  const now = Date.now();
  const day = 86400000;

  const txns = await Transaction.insertMany([
    // Centre → Ministry (Budget Allocation)
    {
      transactionId: `TXN-2024-MOHFW-${now - 30 * day}`, blockchainTxHash: '0xdemo_tx_001', blockNumber: 2001,
      fromRole: 'super_admin', fromName: 'Finance Ministry of India', fromCode: 'FIN_MIN',
      toRole: 'ministry_admin', toName: 'Ministry of Health & Family Welfare', toCode: 'MOHFW',
      toWalletAddress: ministry.walletAddress, amountCrore: 5000,
      schemeId: 'BUDGET_ALLOCATION', schemeName: 'Budget Allocation 2024-25',
      financialYear: '2024-25', quarter: 'Q1', ministryCode: 'MOHFW', status: 'confirmed',
      validations: { amountCheck: true, walletCheck: true, ucCheck: true, schemeActiveCheck: true }
    },
    {
      transactionId: `TXN-2024-MOHFW-${now - 20 * day}`, blockchainTxHash: '0xdemo_tx_002', blockNumber: 2010,
      fromRole: 'super_admin', fromName: 'Finance Ministry of India', fromCode: 'FIN_MIN',
      toRole: 'ministry_admin', toName: 'Ministry of Health & Family Welfare', toCode: 'MOHFW',
      toWalletAddress: ministry.walletAddress, amountCrore: 3000,
      schemeId: 'BUDGET_ALLOCATION', schemeName: 'Budget Allocation 2024-25',
      financialYear: '2024-25', quarter: 'Q2', ministryCode: 'MOHFW', status: 'confirmed',
      validations: { amountCheck: true, walletCheck: true, ucCheck: true, schemeActiveCheck: true }
    },
    // Ministry → State (PM-KISAN)
    {
      transactionId: `TXN-${now - 25 * day}-MOHFW-MH`, blockchainTxHash: '0xdemo_tx_003', blockNumber: 2020,
      fromRole: 'ministry_admin', fromCode: 'MOHFW', fromName: 'Ministry of Health & Family Welfare',
      toRole: 'state_admin', toCode: 'MH', toName: 'Maharashtra', toWalletAddress: state.walletAddress,
      amountCrore: 1200, schemeId: 'PM-KISAN-2024', schemeName: 'PM Kisan Samman Nidhi',
      financialYear: '2024-25', quarter: 'Q1', ministryCode: 'MOHFW', stateCode: 'MH', status: 'confirmed'
    },
    // Ministry → State (AYUSHMAN)
    {
      transactionId: `TXN-${now - 22 * day}-MOHFW-MH-AY`, blockchainTxHash: '0xdemo_tx_004', blockNumber: 2025,
      fromRole: 'ministry_admin', fromCode: 'MOHFW', fromName: 'Ministry of Health & Family Welfare',
      toRole: 'state_admin', toCode: 'MH', toName: 'Maharashtra', toWalletAddress: state.walletAddress,
      amountCrore: 800, schemeId: 'AYUSHMAN-2024', schemeName: 'Ayushman Bharat PMJAY',
      financialYear: '2024-25', quarter: 'Q1', ministryCode: 'MOHFW', stateCode: 'MH', status: 'confirmed'
    },
    // State → District (PM-KISAN)
    {
      transactionId: `TXN-${now - 18 * day}-MH-PUNE`, blockchainTxHash: '0xdemo_tx_005', blockNumber: 2030,
      fromRole: 'state_admin', fromCode: 'MH', fromName: 'Maharashtra',
      toRole: 'district_admin', toCode: 'PUNE', toName: 'Pune', toWalletAddress: district.walletAddress,
      amountCrore: 350, schemeId: 'PM-KISAN-2024', schemeName: 'PM Kisan Samman Nidhi',
      financialYear: '2024-25', quarter: 'Q1', ministryCode: 'MOHFW', stateCode: 'MH', districtCode: 'PUNE', status: 'confirmed'
    },
    // State → District (AYUSHMAN)
    {
      transactionId: `TXN-${now - 15 * day}-MH-PUNE-AY`, blockchainTxHash: '0xdemo_tx_006', blockNumber: 2035,
      fromRole: 'state_admin', fromCode: 'MH', fromName: 'Maharashtra',
      toRole: 'district_admin', toCode: 'PUNE', toName: 'Pune', toWalletAddress: district.walletAddress,
      amountCrore: 200, schemeId: 'AYUSHMAN-2024', schemeName: 'Ayushman Bharat PMJAY',
      financialYear: '2024-25', quarter: 'Q1', ministryCode: 'MOHFW', stateCode: 'MH', districtCode: 'PUNE', status: 'confirmed'
    }
  ]);
  console.log('✅ 6 transactions created (full fund flow chain)');

  // ─── 3. BENEFICIARIES ───
  const beneficiaryData = [
    { name: 'Ramesh Jadhav', gender: 'M', dob: '1985-03-15', aadhaar: '123456789012', bank: 'State Bank of India', ifsc: 'SBIN0001234', village: 'Hadapsar' },
    { name: 'Sunita Patil', gender: 'F', dob: '1990-07-22', aadhaar: '234567890123', bank: 'Bank of Maharashtra', ifsc: 'MAHB0002345', village: 'Kothrud' },
    { name: 'Amit Shinde', gender: 'M', dob: '1978-11-05', aadhaar: '345678901234', bank: 'Punjab National Bank', ifsc: 'PUNB0003456', village: 'Hinjewadi' },
    { name: 'Priya Deshmukh', gender: 'F', dob: '1995-01-18', aadhaar: '456789012345', bank: 'State Bank of India', ifsc: 'SBIN0004567', village: 'Wakad' },
    { name: 'Vijay Kulkarni', gender: 'M', dob: '1982-09-30', aadhaar: '567890123456', bank: 'Central Bank', ifsc: 'CBIN0005678', village: 'Katraj' },
    { name: 'Asha More', gender: 'F', dob: '1988-04-12', aadhaar: '678901234567', bank: 'Bank of India', ifsc: 'BKID0006789', village: 'Warje' },
    { name: 'Deepak Gaikwad', gender: 'M', dob: '1975-06-25', aadhaar: '789012345678', bank: 'Canara Bank', ifsc: 'CNRB0007890', village: 'Baner' },
    { name: 'Kavita Bhosale', gender: 'F', dob: '1992-12-08', aadhaar: '890123456789', bank: 'Union Bank', ifsc: 'UBIN0008901', village: 'Kondhwa' },
  ];

  const crypto = require('crypto');
  const hashA = (a) => crypto.createHash('sha256').update(a).digest('hex');

  const bens = [];
  for (const b of beneficiaryData) {
    const aHash = hashA(b.aadhaar);
    bens.push(await Beneficiary.create({
      aadhaarHash: aHash, aadhaarMasked: `XXXX XXXX ${b.aadhaar.slice(-4)}`,
      fullName: b.name, dateOfBirth: new Date(b.dob), gender: b.gender,
      bankAccountHash: hashA(b.bank + b.aadhaar), bankName: b.bank, ifscCode: b.ifsc,
      state: 'Maharashtra', district: 'Pune', village: b.village,
      enrolledByUser: district._id,
      enrollmentTxHash: `0xdemo_enroll_${b.aadhaar.slice(-4)}`, enrollmentBlockNumber: 3000 + bens.length,
      enrolledSchemes: [
        { schemeId: 'PM-KISAN-2024', schemeName: 'PM Kisan Samman Nidhi', enrolledByDistrict: 'Pune',
          blockchainEnrollTxHash: `0xdemo_enroll_${b.aadhaar.slice(-4)}`, enrollBlockNumber: 3000 + bens.length }
      ]
    }));
  }
  // Enroll first 4 also in Ayushman
  for (let i = 0; i < 4; i++) {
    bens[i].enrolledSchemes.push({
      schemeId: 'AYUSHMAN-2024', schemeName: 'Ayushman Bharat PMJAY', enrolledByDistrict: 'Pune',
      blockchainEnrollTxHash: `0xdemo_ay_enroll_${i}`, enrollBlockNumber: 3100 + i
    });
    await bens[i].save();
  }
  console.log('✅ 8 beneficiaries created');

  // ─── 4. PAYMENTS ───
  const payments = [];
  for (let i = 0; i < bens.length; i++) {
    payments.push({
      paymentId: `PAY-KISAN-I1-${i}`, aadhaarHash: bens[i].aadhaarHash, beneficiaryDbId: bens[i]._id,
      schemeId: 'PM-KISAN-2024', schemeName: 'PM Kisan Samman Nidhi', installmentNumber: 1, financialYear: '2024-25',
      amount: 2000, state: 'Maharashtra', district: 'Pune',
      bankName: bens[i].bankName, ifscCode: bens[i].ifscCode,
      pfmsRef: `PFMS-KISAN-${1000 + i}`, npciRef: `NPCI-${2000 + i}`,
      blockchainTxHash: `0xdemo_pay_k1_${i}`, blockNumber: 4000 + i,
      status: 'success', paidAt: new Date(now - 12 * day), triggeredBy: district._id, batchId: 'BATCH-KISAN-I1'
    });
  }
  // Installment 2 for first 5
  for (let i = 0; i < 5; i++) {
    payments.push({
      paymentId: `PAY-KISAN-I2-${i}`, aadhaarHash: bens[i].aadhaarHash, beneficiaryDbId: bens[i]._id,
      schemeId: 'PM-KISAN-2024', schemeName: 'PM Kisan Samman Nidhi', installmentNumber: 2, financialYear: '2024-25',
      amount: 2000, state: 'Maharashtra', district: 'Pune',
      bankName: bens[i].bankName, ifscCode: bens[i].ifscCode,
      pfmsRef: `PFMS-KISAN-${3000 + i}`, npciRef: `NPCI-${4000 + i}`,
      blockchainTxHash: `0xdemo_pay_k2_${i}`, blockNumber: 4100 + i,
      status: 'success', paidAt: new Date(now - 5 * day), triggeredBy: district._id, batchId: 'BATCH-KISAN-I2'
    });
  }
  // 1 failed payment
  payments.push({
    paymentId: 'PAY-FAIL-001', aadhaarHash: bens[6].aadhaarHash, beneficiaryDbId: bens[6]._id,
    schemeId: 'PM-KISAN-2024', schemeName: 'PM Kisan Samman Nidhi', installmentNumber: 2, financialYear: '2024-25',
    amount: 2000, state: 'Maharashtra', district: 'Pune',
    bankName: bens[6].bankName, ifscCode: bens[6].ifscCode,
    status: 'failed', failureReason: 'Bank account inactive', triggeredBy: district._id, batchId: 'BATCH-KISAN-I2'
  });
  await Payment.insertMany(payments);
  console.log(`✅ ${payments.length} payments created`);

  // ─── 5. FLAGS ───
  await Flag.insertMany([
    {
      flagId: 'FLAG-DEMO-001', transactionId: txns[4].transactionId,
      blockchainTxHash: txns[4].blockchainTxHash, flagType: 'high', flagCode: 'SPEED_ANOMALY',
      flagReason: 'Funds released within 45 minutes of receiving with no UC uploaded',
      raisedByType: 'auto_system', ministryCode: 'MOHFW', stateCode: 'MH', districtCode: 'PUNE',
      responseDeadline: new Date(now + 5 * day), status: 'awaiting_response'
    },
    {
      flagId: 'FLAG-DEMO-002', transactionId: txns[2].transactionId,
      blockchainTxHash: txns[2].blockchainTxHash, flagType: 'medium', flagCode: 'ROUND_FIGURE',
      flagReason: 'Repeated round-figure transactions from same entity (6 in 30 days)',
      raisedByType: 'auto_system', ministryCode: 'MOHFW', stateCode: 'MH',
      responseDeadline: new Date(now + 10 * day), status: 'active'
    },
    {
      flagId: 'FLAG-DEMO-003', transactionId: txns[5].transactionId,
      blockchainTxHash: txns[5].blockchainTxHash, flagType: 'critical', flagCode: 'AMOUNT_MISMATCH',
      flagReason: 'District tried to pay 2.50 Cr but only 1.80 Cr available — blocked by smart contract',
      raisedByType: 'auto_system', districtCode: 'PUNE', stateCode: 'MH', ministryCode: 'MOHFW',
      responseDeadline: new Date(now + 3 * day), status: 'active'
    },
    {
      flagId: 'FLAG-DEMO-004', transactionId: txns[3].transactionId,
      blockchainTxHash: txns[3].blockchainTxHash, flagType: 'info', flagCode: 'CITIZEN_COMPLAINT',
      flagReason: 'Citizen reported not receiving PM-KISAN installment despite showing success',
      raisedByType: 'citizen', stateCode: 'MH', districtCode: 'PUNE',
      responseDeadline: new Date(now + 14 * day), status: 'resolved',
      cagDecision: { decision: 'resolved', decisionNote: 'Payment verified on NPCI — delay in bank credit', decidedAt: new Date(now - 2 * day) }
    }
  ]);
  console.log('✅ 4 flags created (critical, high, medium, resolved)');

  // ─── 6. COMPLAINTS ───
  await Complaint.insertMany([
    {
      complaintId: 'CMP-DEMO-001', aadhaarHash: bens[2].aadhaarHash, aadhaarMasked: bens[2].aadhaarMasked,
      citizenPhone: '9876543210', complaintType: 'payment_not_received',
      schemeId: 'PM-KISAN-2024', schemeName: 'PM Kisan Samman Nidhi', installmentNumber: 2,
      description: 'I have not received the 2nd installment of PM-KISAN. My neighbours have already received it.',
      expectedAmount: 2000, receivedAmount: 0, state: 'Maharashtra', district: 'Pune', status: 'under_review'
    },
    {
      complaintId: 'CMP-DEMO-002', aadhaarHash: bens[5].aadhaarHash, aadhaarMasked: bens[5].aadhaarMasked,
      citizenPhone: '9988776655', complaintType: 'wrong_amount',
      schemeId: 'PM-KISAN-2024', schemeName: 'PM Kisan Samman Nidhi', installmentNumber: 1,
      description: 'Received only Rs 1500 instead of Rs 2000. Please check and credit the remaining amount.',
      expectedAmount: 2000, receivedAmount: 1500, state: 'Maharashtra', district: 'Pune', status: 'received'
    }
  ]);
  console.log('✅ 2 complaints created');

  console.log('\n🎉 Demo data seeded successfully!\n');
  console.log('Summary:');
  console.log('  Schemes:       3 (PM-KISAN, AYUSHMAN, UJJWALA)');
  console.log('  Transactions:  6 (Centre→Ministry→State→District)');
  console.log('  Beneficiaries: 8 (enrolled in Pune)');
  console.log(`  Payments:      ${payments.length} (success + failed)`);
  console.log('  Flags:         4 (critical, high, medium, resolved)');
  console.log('  Complaints:    2');
  process.exit(0);
};

run().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
