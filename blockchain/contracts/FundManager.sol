// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FundManager {
    address public superAdmin;

    struct Ministry {
        string name;
        string code;
        uint256 budgetCapCrore;
        uint256 allocatedCrore;
        uint256 releasedCrore;
        bool isActive;
        uint256 createdAt;
    }

    struct FundTransaction {
        string transactionId;
        address from;
        address to;
        uint256 amountCrore;
        string schemeId;
        string docHash;
        uint256 timestamp;
        bool isFlagged;
    }

    mapping(address => Ministry) public ministries;
    mapping(string => FundTransaction) public transactions;
    mapping(address => uint256) public walletBalance;

    string[] public transactionIds;

    event MinistryRegistered(address indexed wallet, string name, string code, uint256 budgetCap);
    event BudgetAllocated(string transactionId, address indexed to, uint256 amount, uint256 blockNumber);
    event FundsReleased(string transactionId, address indexed from, address indexed to, uint256 amount);
    event TransactionFlagged(string transactionId, string reason);

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, 'Only super admin');
        _;
    }

    modifier onlyActiveMinistry() {
        require(ministries[msg.sender].isActive, 'Not an active ministry');
        _;
    }

    constructor() {
        superAdmin = msg.sender;
    }

    function registerMinistry(
        address _wallet,
        string memory _name,
        string memory _code,
        uint256 _budgetCapCrore
    ) external onlySuperAdmin {
        require(!ministries[_wallet].isActive, 'Ministry already exists');
        ministries[_wallet] = Ministry({
            name: _name,
            code: _code,
            budgetCapCrore: _budgetCapCrore,
            allocatedCrore: 0,
            releasedCrore: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        emit MinistryRegistered(_wallet, _name, _code, _budgetCapCrore);
    }

    function allocateBudget(
        address _ministryWallet,
        uint256 _amountCrore,
        string memory _transactionId,
        string memory _docHash
    ) external onlySuperAdmin {
        require(ministries[_ministryWallet].isActive, 'Ministry not active');
        require(
            ministries[_ministryWallet].allocatedCrore + _amountCrore <= ministries[_ministryWallet].budgetCapCrore,
            'Exceeds ministry budget cap'
        );

        ministries[_ministryWallet].allocatedCrore += _amountCrore;
        walletBalance[_ministryWallet] += _amountCrore;

        transactions[_transactionId] = FundTransaction({
            transactionId: _transactionId,
            from: msg.sender,
            to: _ministryWallet,
            amountCrore: _amountCrore,
            schemeId: 'BUDGET_ALLOCATION',
            docHash: _docHash,
            timestamp: block.timestamp,
            isFlagged: false
        });
        transactionIds.push(_transactionId);

        emit BudgetAllocated(_transactionId, _ministryWallet, _amountCrore, block.number);
    }

    function releaseFunds(
        address _toWallet,
        uint256 _amountCrore,
        string memory _transactionId,
        string memory _schemeId,
        string memory _docHash
    ) external {
        require(walletBalance[msg.sender] >= _amountCrore, 'Insufficient balance');

        walletBalance[msg.sender] -= _amountCrore;
        walletBalance[_toWallet] += _amountCrore;

        transactions[_transactionId] = FundTransaction({
            transactionId: _transactionId,
            from: msg.sender,
            to: _toWallet,
            amountCrore: _amountCrore,
            schemeId: _schemeId,
            docHash: _docHash,
            timestamp: block.timestamp,
            isFlagged: false
        });
        transactionIds.push(_transactionId);

        emit FundsReleased(_transactionId, msg.sender, _toWallet, _amountCrore);
    }

    function flagTransaction(string memory _transactionId, string memory _reason) external {
        transactions[_transactionId].isFlagged = true;
        emit TransactionFlagged(_transactionId, _reason);
    }

    function getBalance(address _wallet) external view returns (uint256) {
        return walletBalance[_wallet];
    }

    function getTransaction(string memory _txId) external view returns (FundTransaction memory) {
        return transactions[_txId];
    }

    function getMinistry(address _wallet) external view returns (Ministry memory) {
        return ministries[_wallet];
    }
}
