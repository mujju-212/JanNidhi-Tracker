// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AuditLogger {
    struct AuditFlag {
        string flagId;
        string transactionId;
        string flagCode;
        string flagReason;
        address raisedBy;
        uint256 timestamp;
        bool isResolved;
    }

    struct BeneficiaryEnrollment {
        string aadhaarHash;
        string schemeId;
        uint256 enrolledAt;
        address enrolledBy;
    }

    struct PaymentRecord {
        string paymentId;
        string aadhaarHash;
        string schemeId;
        uint256 amount;
        uint256 paidAt;
        address paidBy;
    }

    mapping(string => AuditFlag) public flags;
    mapping(string => BeneficiaryEnrollment) public enrollments;
    mapping(string => PaymentRecord) public payments;

    string[] public flagIds;

    event FlagRaised(string flagId, string transactionId, string flagCode, address raisedBy);
    event FlagResolved(string flagId, address resolvedBy);
    event BeneficiaryEnrolled(string aadhaarHash, string schemeId, uint256 timestamp);
    event PaymentRecorded(string paymentId, string aadhaarHash, string schemeId, uint256 amount);

    function raiseFlag(
        string memory _flagId,
        string memory _transactionId,
        string memory _flagCode,
        string memory _flagReason
    ) external {
        flags[_flagId] = AuditFlag({
            flagId: _flagId,
            transactionId: _transactionId,
            flagCode: _flagCode,
            flagReason: _flagReason,
            raisedBy: msg.sender,
            timestamp: block.timestamp,
            isResolved: false
        });
        flagIds.push(_flagId);
        emit FlagRaised(_flagId, _transactionId, _flagCode, msg.sender);
    }

    function resolveFlag(string memory _flagId) external {
        flags[_flagId].isResolved = true;
        emit FlagResolved(_flagId, msg.sender);
    }

    function enrollBeneficiary(string memory _aadhaarHash, string memory _schemeId) external {
        string memory key = string(abi.encodePacked(_aadhaarHash, _schemeId));
        enrollments[key] = BeneficiaryEnrollment({
            aadhaarHash: _aadhaarHash,
            schemeId: _schemeId,
            enrolledAt: block.timestamp,
            enrolledBy: msg.sender
        });
        emit BeneficiaryEnrolled(_aadhaarHash, _schemeId, block.timestamp);
    }

    function recordPayment(
        string memory _paymentId,
        string memory _aadhaarHash,
        string memory _schemeId,
        uint256 _amount
    ) external {
        payments[_paymentId] = PaymentRecord({
            paymentId: _paymentId,
            aadhaarHash: _aadhaarHash,
            schemeId: _schemeId,
            amount: _amount,
            paidAt: block.timestamp,
            paidBy: msg.sender
        });
        emit PaymentRecorded(_paymentId, _aadhaarHash, _schemeId, _amount);
    }

    function isEnrolled(string memory _aadhaarHash, string memory _schemeId) external view returns (bool) {
        string memory key = string(abi.encodePacked(_aadhaarHash, _schemeId));
        return enrollments[key].enrolledAt > 0;
    }

    function getFlag(string memory _flagId) external view returns (AuditFlag memory) {
        return flags[_flagId];
    }
}
