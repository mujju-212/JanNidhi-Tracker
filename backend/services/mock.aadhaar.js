const AADHAAR_DB = {
  '123456789012': {
    name: 'Ramesh Kumar',
    dob: '1990-05-15',
    gender: 'M',
    state: 'Maharashtra',
    district: 'Pune',
    phone: '98XXXXXXXX'
  },
  '234567890123': {
    name: 'Sunita Devi',
    dob: '1985-03-22',
    gender: 'F',
    state: 'Maharashtra',
    district: 'Pune',
    phone: '97XXXXXXXX'
  },
  '345678901234': {
    name: 'Arjun Singh',
    dob: '1978-11-10',
    gender: 'M',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    phone: '96XXXXXXXX'
  }
};

exports.verifyAadhaar = (aadhaarNumber) => {
  const record = AADHAAR_DB[aadhaarNumber];
  if (!record) return { verified: false, message: 'Aadhaar not found' };
  return {
    verified: true,
    data: {
      name: record.name,
      dob: record.dob,
      gender: record.gender,
      state: record.state,
      district: record.district,
      phone: record.phone,
      aadhaarMasked: `XXXX XXXX ${aadhaarNumber.slice(-4)}`
    }
  };
};
