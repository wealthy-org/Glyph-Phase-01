// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DecisionRegistry {
    event DecisionCommitted(
        uint256 indexed decisionId,
        bytes32 decisionHash,
        address indexed committedBy,
        uint256 timestamp
    );

    uint256 public nextDecisionId;

    function commitDecision(bytes32 decisionHash) external returns (uint256) {
        uint256 id = nextDecisionId++;
        emit DecisionCommitted(id, decisionHash, msg.sender, block.timestamp);
        return id;
    }
}
