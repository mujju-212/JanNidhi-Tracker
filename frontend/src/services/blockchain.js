// Frontend blockchain utility — uses MetaMask for signing
import { ethers } from 'ethers';

// Contract addresses (same as backend .env)
const CONTRACTS = {
  FUND_MANAGER: '0x4949d642e2609BCD59db1b15DBe1004D290Db2f0',
  SCHEME_REGISTRY: '0x111454C35deC4a67Fc103E2345E7904B9D9c3560',
  AUDIT_LOGGER: '0xDDe66445863a01eD8293639B61eD3e513E7e7b07'
};

// Minimal ABIs — only the functions we call from frontend
const FUND_MANAGER_ABI = [
  'function registeredMinistries(address) view returns (bool)',
  'function walletBalance(address) view returns (uint256)',
  'function registerMinistry(address _wallet, string _name, string _code, uint256 _budgetCap)',
  'function allocateBudget(address _ministryWallet, uint256 _amountCrore, string _transactionId, string _docHash)',
  'function releaseFunds(address _to, uint256 _amount, string _txId, string _schemeId, string _docHash)',
  'event BudgetAllocated(address indexed ministry, uint256 amount, string transactionId)'
];

const SCHEME_REGISTRY_ABI = [
  'function createScheme(string _id, string _name, string _code, uint256 _budget, uint256 _start, uint256 _end)',
  'function isSchemeActive(string _id) view returns (bool)'
];

const AUDIT_LOGGER_ABI = [
  'function enrollBeneficiary(string _aadhaarHash, string _schemeId)',
  'function recordPayment(string _paymentId, string _aadhaarHash, string _schemeId, uint256 _amount)',
  'function raiseFlag(string _flagId, string _txId, string _flagCode, string _flagReason)'
];

// Connect MetaMask — handles "already pending" gracefully
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed. Please install MetaMask extension.');
  }

  let accounts;
  try {
    // First try to get already-connected accounts (no popup)
    accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      // No accounts connected — request permission (this shows the MetaMask popup)
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  } catch (err) {
    if (err.code === -32002) {
      // "Already pending" — wait a moment and try getting accounts
      await new Promise(r => setTimeout(r, 1500));
      accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('MetaMask connection pending. Please check the MetaMask popup.');
      }
    } else {
      throw err;
    }
  }

  // Check if on Sepolia
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0xaa36a7') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }]
      });
    } catch (err) {
      throw new Error('Please switch MetaMask to Sepolia testnet');
    }
  }

  return accounts[0];
}


// Get ethers provider + signer from MetaMask
function getProviderAndSigner() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
}

// Get contract instances signed by MetaMask
async function getContracts() {
  const provider = getProviderAndSigner();
  const signer = await provider.getSigner();
  return {
    fundManager: new ethers.Contract(CONTRACTS.FUND_MANAGER, FUND_MANAGER_ABI, signer),
    schemeRegistry: new ethers.Contract(CONTRACTS.SCHEME_REGISTRY, SCHEME_REGISTRY_ABI, signer),
    auditLogger: new ethers.Contract(CONTRACTS.AUDIT_LOGGER, AUDIT_LOGGER_ABI, signer),
    signer
  };
}

// ─── FUND MANAGER ───

export async function allocateBudgetOnChain(ministryWallet, amountCrore, transactionId, docHash, ministryName, ministryCode, budgetCap) {
  const { fundManager } = await getContracts();

  // Auto-register ministry if not registered
  const isRegistered = await fundManager.registeredMinistries(ministryWallet);
  if (!isRegistered) {
    console.log('Registering ministry on-chain via MetaMask...');
    const regTx = await fundManager.registerMinistry(
      ministryWallet, ministryName || 'Ministry', ministryCode || 'MIN', BigInt(budgetCap || 99999)
    );
    await regTx.wait();
    console.log('Ministry registered');
  }

  // Now allocate — this triggers MetaMask popup
  const tx = await fundManager.allocateBudget(
    ministryWallet, BigInt(amountCrore), transactionId, docHash || ''
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

// Read on-chain balance for any wallet
export async function getOnChainBalance(walletAddr) {
  const { fundManager } = await getContracts();
  const balance = await fundManager.walletBalance(walletAddr);
  return Number(balance);
}

export async function releaseFundsOnChain(toWallet, amountCrore, transactionId, schemeId, docHash) {
  const { fundManager, signer } = await getContracts();
  const myAddr = await signer.getAddress();

  // Check on-chain balance before attempting release
  const balance = await fundManager.walletBalance(myAddr);
  const balanceNum = Number(balance);
  if (balanceNum < amountCrore) {
    throw new Error(
      `On-chain balance insufficient: Wallet ${myAddr.slice(0, 10)}... has ${balanceNum} Cr, but this transfer needs ${amountCrore} Cr. Connect the funded ministry/state wallet or receive funds on-chain first.`
    );
  }

  try {
    const tx = await fundManager.releaseFunds(
      toWallet, BigInt(amountCrore), transactionId, schemeId, docHash || ''
    );
    const receipt = await tx.wait();
    return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch (err) {
    const reason = err?.reason || err?.info?.error?.message || err?.message || '';
    if (reason.includes('Only super admin')) {
      throw new Error('Connected wallet is hitting a super-admin-only path. Reconnect the funded ministry/state wallet and reload the page before retrying.');
    }
    throw err;
  }
}

// ─── SCHEME REGISTRY ───

export async function createSchemeOnChain(schemeId, schemeName, ministryCode, budgetCrore, startDate, endDate) {
  const { schemeRegistry } = await getContracts();
  const tx = await schemeRegistry.createScheme(
    schemeId, schemeName, ministryCode, BigInt(budgetCrore),
    Math.floor(new Date(startDate).getTime() / 1000),
    Math.floor(new Date(endDate).getTime() / 1000)
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

// ─── AUDIT LOGGER ───

export async function enrollBeneficiaryOnChain(aadhaarHash, schemeId) {
  const { auditLogger } = await getContracts();
  const tx = await auditLogger.enrollBeneficiary(aadhaarHash, schemeId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export async function recordPaymentOnChain(paymentId, aadhaarHash, schemeId, amount) {
  const { auditLogger } = await getContracts();
  const tx = await auditLogger.recordPayment(paymentId, aadhaarHash, schemeId, BigInt(amount));
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export async function raiseFlagOnChain(flagId, transactionId, flagCode, flagReason) {
  const { auditLogger } = await getContracts();
  const tx = await auditLogger.raiseFlag(flagId, transactionId, flagCode, flagReason);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}
