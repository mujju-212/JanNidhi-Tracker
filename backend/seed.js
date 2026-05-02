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
      walletAddress: '0x482c64D4f5db307A0BA0b8a89E47A029e97d4D68',
      isFirstLogin: false
    },
    {
      fullName: 'Dr. Rajesh Kumar',
      email: 'secretary@education.gov.in',
      password: 'Ministry@1234',
      employeeId: 'IAS-2024-002',
      phone: '9800000002',
      designation: 'Secretary, Ministry of Education',
      role: 'ministry_admin',
      jurisdiction: {
        ministry: 'Ministry of Education',
        ministryCode: 'MOE'
      },
      walletAddress: '0x8FA367e26E1c9f303c9e87c32d595d02679BA621',
      isFirstLogin: false
    },
    {
      fullName: 'Rajiv Deshmukh',
      email: 'finance@karnataka.gov.in',
      password: 'State@1234',
      employeeId: 'IAS-2024-003',
      phone: '9800000003',
      designation: 'Principal Secretary, Finance',
      role: 'state_admin',
      jurisdiction: {
        ministry: 'Ministry of Education',
        ministryCode: 'MOE',
        state: 'Karnataka',
        stateCode: 'KA'
      },
      walletAddress: '0xb167128A58dDC814C5ed848412cC43d09781e0c5',
      isFirstLogin: false
    },
    {
      fullName: 'Sanjay Patil',
      email: 'collector@bengaluru.gov.in',
      password: 'District@1234',
      employeeId: 'IAS-2024-004',
      phone: '9800000004',
      designation: 'District Commissioner, Bengaluru Urban',
      role: 'district_admin',
      jurisdiction: {
        state: 'Karnataka',
        stateCode: 'KA',
        district: 'Bengaluru Urban',
        districtCode: 'BLR'
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
  console.log('Ministry Admin: secretary@education.gov.in / Ministry@1234');
  console.log('State Admin:    finance@karnataka.gov.in / State@1234');
  console.log('District Admin: collector@bengaluru.gov.in / District@1234');
  console.log('CAG Auditor:    cag@cagindia.gov.in / CAG@12345');
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
