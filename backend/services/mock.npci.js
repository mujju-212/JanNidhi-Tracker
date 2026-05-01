const NPCI_DB = {
  '123456789012': {
    bankName: 'State Bank of India',
    branch: 'Pune Main Branch',
    ifscCode: 'SBIN0001234',
    accountMasked: 'XXXXXX7823'
  },
  '234567890123': {
    bankName: 'Bank of Maharashtra',
    branch: 'Deccan Branch',
    ifscCode: 'MAHB0001122',
    accountMasked: 'XXXXXX4512'
  },
  '345678901234': {
    bankName: 'Punjab National Bank',
    branch: 'Lucknow Branch',
    ifscCode: 'PUNB0044200',
    accountMasked: 'XXXXXX9901'
  }
};

exports.fetchBankDetails = (aadhaarNumber) => {
  const bank = NPCI_DB[aadhaarNumber];
  if (!bank) return { found: false };
  return { found: true, data: bank };
};
