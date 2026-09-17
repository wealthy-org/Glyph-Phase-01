// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityRegistry is ERC721URIStorage, Ownable {
    uint256 private _nextAgentId = 1;
    mapping(uint256 => address) private _agentWallets;

    event AgentRegistered(uint256 indexed agentId, string agentURI, address indexed owner);
    event AgentWalletSet(uint256 indexed agentId, address indexed wallet);

    constructor() ERC721("Glyph Agent Identity", "GLYPH-ID") Ownable(msg.sender) {}

    /// @notice Mendaftarkan agent baru dan mencetak agentId unik
    function register(string calldata agentURI) external returns (uint256) {
        uint256 agentId = _nextAgentId++;
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, agentURI);

        emit AgentRegistered(agentId, agentURI, msg.sender);
        return agentId;
    }

    /// @notice Menghubungkan agentId dengan alamat smart account/wallet agent
    function setAgentWallet(uint256 agentId, address wallet) external {
        require(ownerOf(agentId) == msg.sender, "Not agent owner");
        _agentWallets[agentId] = wallet;
        emit AgentWalletSet(agentId, wallet);
    }

    /// @notice Melihat wallet agent yang terhubung
    function getAgentWallet(uint256 agentId) external view returns (address) {
        return _agentWallets[agentId];
    }
}
