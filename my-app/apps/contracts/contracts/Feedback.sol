//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Feedback is ERC721Enumerable {
    ISemaphore public semaphore;

    struct GroupInfo {
        uint256 groupId;
        string name;
    }

    GroupInfo[] public groups;

    mapping(uint256 groupId => GroupInfo) public groupIdToGroupInfo;

    mapping(uint256 tokenId => uint256 groupId) public tokenIdToGroupId;

    mapping (uint256 groupId => uint256[] tokenIds) public groupIdsToTokenIds;


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

    function getAllNftsForGroup(uint256 groupId) external view returns (uint256[] memory) {
        return groupIdsToTokenIds[groupId];
    }

    function createGroup(string calldata name) external {
        uint256 groupId = groups.length;
        GroupInfo memory newGroupInfo = GroupInfo(groupId, name);
        groups.push(newGroupInfo);
        groupIdToGroupInfo[groupId] = newGroupInfo;
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
        uint256 nextId = totalSupply();
        _safeMint(mintTo, nextId);
        tokenIdToGroupId[nextId] = groupId;
        groupIdsToTokenIds[groupId].push(nextId);
    }
}
