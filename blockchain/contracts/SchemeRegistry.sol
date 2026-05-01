// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SchemeRegistry {
    address public superAdmin;

    struct Scheme {
        string schemeId;
        string schemeName;
        string ministryCode;
        uint256 totalBudgetCrore;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        uint256 createdAt;
    }

    mapping(string => Scheme) public schemes;
    string[] public schemeIds;

    event SchemeCreated(string schemeId, string schemeName, string ministryCode, uint256 budget);
    event SchemeStatusChanged(string schemeId, bool isActive);

    constructor() {
        superAdmin = msg.sender;
    }

    function createScheme(
        string memory _schemeId,
        string memory _schemeName,
        string memory _ministryCode,
        uint256 _totalBudgetCrore,
        uint256 _startDate,
        uint256 _endDate
    ) external {
        require(!schemes[_schemeId].isActive, 'Scheme ID already exists');
        schemes[_schemeId] = Scheme({
            schemeId: _schemeId,
            schemeName: _schemeName,
            ministryCode: _ministryCode,
            totalBudgetCrore: _totalBudgetCrore,
            startDate: _startDate,
            endDate: _endDate,
            isActive: true,
            createdAt: block.timestamp
        });
        schemeIds.push(_schemeId);
        emit SchemeCreated(_schemeId, _schemeName, _ministryCode, _totalBudgetCrore);
    }

    function isSchemeActive(string memory _schemeId) external view returns (bool) {
        return schemes[_schemeId].isActive && block.timestamp <= schemes[_schemeId].endDate;
    }

    function getScheme(string memory _schemeId) external view returns (Scheme memory) {
        return schemes[_schemeId];
    }

    function deactivateScheme(string memory _schemeId) external {
        schemes[_schemeId].isActive = false;
        emit SchemeStatusChanged(_schemeId, false);
    }
}
