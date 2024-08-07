//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Feedback is ERC721 {
    ISemaphore public semaphore;

    struct GroupInfo {
        uint256 groupId;
        string name;
    }

    GroupInfo[] public groups;

    constructor(address semaphoreAddress) ERC721("AnonymousEvents", "AE") {
        semaphore = ISemaphore(semaphoreAddress);
    }

    function getAllGroups() external view returns (GroupInfo[] memory) {
        return groups;
    }

    function getGroup(
        uint256 groupId
    ) external view returns (GroupInfo memory) {
        return groups[groupId];
    }

    function createGroup(string calldata name) external {
        uint256 groupId = groups.length;
        groups.push(GroupInfo(groupId, name));
    }

    function joinGroup(uint256 groupId, uint256 identityCommitment) external {
        semaphore.addMember(groupId, identityCommitment);
    }

    function enterEvent(
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256 feedback,
        uint256[8] calldata points,
        address mintTo,
        uint256 groupId
    ) external {
        ISemaphore.SemaphoreProof memory proof = ISemaphore.SemaphoreProof(
            merkleTreeDepth,
            merkleTreeRoot,
            nullifier,
            feedback,
            groupId,
            points
        );

        semaphore.validateProof(groupId, proof);

        // Generate NFT as a proof of participation
        _safeMint(mintTo, groupId);
    }
}
