require("dotenv").config();
const mongoose = require("mongoose");
const Beneficiary = require("./models/Beneficiary.model");
const Payment = require("./models/Payment.model");
(async () => {
  await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
  const beneficiaries = await Beneficiary.find({}, { fullName: 1, aadhaarMasked: 1, state: 1, district: 1, bankName: 1, ifscCode: 1, enrolledSchemes: 1 }).limit(5).lean();
  const payments = await Payment.find({}, { schemeId: 1, amount: 1, status: 1, installmentNumber: 1, aadhaarHash: 1 }).limit(8).lean();
  console.log(JSON.stringify({ beneficiaries, payments }, null, 2));
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error(err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
