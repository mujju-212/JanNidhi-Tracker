require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User.model');

const seed = async () => {
  await connectDB();
  await User.deleteMany({});

  const users = [
    {
      fullName: 'Nirmala Sitharaman',
      email: 'admin@finmin.gov.in',
      password: 'Admin@1234',
      employeeId: 'IAS-2024-001',
      phone: '9800000001',
      designation: 'Finance Minister',
      role: 'super_admin',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      isFirstLogin: false
    },
    {
      fullName: 'Dr. Rajesh Kumar',
      email: 'secretary@mohfw.gov.in',
      password: 'Ministry@1234',
      employeeId: 'IAS-2024-002',
      phone: '9800000002',
      designation: 'Secretary, MoHFW',
      role: 'ministry_admin',
      jurisdiction: {
        ministry: 'Ministry of Health & Family Welfare',
        ministryCode: 'MOHFW'
      },
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      isFirstLogin: false
    },
    {
      fullName: 'Rajiv Deshmukh',
      email: 'finance@maharashtra.gov.in',
      password: 'State@1234',
      employeeId: 'IAS-2024-003',
      phone: '9800000003',
      designation: 'Principal Secretary, Finance',
      role: 'state_admin',
      jurisdiction: {
        ministry: 'Ministry of Health & Family Welfare',
        ministryCode: 'MOHFW',
        state: 'Maharashtra',
        stateCode: 'MH'
      },
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      isFirstLogin: false
    },
    {
      fullName: 'Sanjay Patil',
      email: 'collector@pune.gov.in',
      password: 'District@1234',
      employeeId: 'IAS-2024-004',
      phone: '9800000004',
      designation: 'District Collector, Pune',
      role: 'district_admin',
      jurisdiction: {
        state: 'Maharashtra',
        stateCode: 'MH',
        district: 'Pune',
        districtCode: 'PUNE'
      },
      walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      isFirstLogin: false
    },
    {
      fullName: 'V. Ananthaswamy',
      email: 'cag@cagindia.gov.in',
      password: 'CAG@12345',
      employeeId: 'CAG-2024-001',
      phone: '9800000005',
      designation: 'Comptroller and Auditor General',
      role: 'central_cag',
      walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      isFirstLogin: false
    }
  ];

  for (const user of users) {
    user.password = await bcrypt.hash(user.password, 12);
  }

  await User.insertMany(users);
  console.log('Demo accounts seeded.');
  console.log('Super Admin:    admin@finmin.gov.in / Admin@1234');
  console.log('Ministry Admin: secretary@mohfw.gov.in / Ministry@1234');
  console.log('State Admin:    finance@maharashtra.gov.in / State@1234');
  console.log('District Admin: collector@pune.gov.in / District@1234');
  console.log('CAG Auditor:    cag@cagindia.gov.in / CAG@12345');
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
