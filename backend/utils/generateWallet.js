const { ethers } = require('ethers');

exports.generateWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : null
  };
};
