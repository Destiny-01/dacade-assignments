// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract StoryBook {
    struct Story {
        string title;
        string description;
        string status;
        address owner;
        uint256 createdAt;  
    }

    mapping(uint256 => Story) private stories;
    mapping(address => uint256) private privateStoriesCount;
    uint256 private publicStoriesCount;
    uint256 private storiesIndex;

    event NewStory(uint256 id, address owner);
    event DeletedStory(uint256 _id);
    
    /*╔═════════════════════════════╗
      ║        STORY FUNCTIONS      ║
      ╚═════════════════════════════╝*/

    function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    /* Creates a new story provided the right parameters are given */ 
    function createStory( 
        uint256 _id,
        string memory _title,
        string memory _description,
        string memory _status
    ) external {
        stories[storiesIndex++] = Story(
            _title,
            _description,
            _status, 
            msg.sender,
            block.timestamp
        );

        if (compareStrings(_status, "private")) {
            privateStoriesCount[msg.sender]++;
        } else if (compareStrings(_status, "public")) {
            publicStoriesCount++;
        }
        emit NewStory(_id, msg.sender);
    }

    // return all my private stories
    function getMyPrivateStories() public view returns (Story[] memory) {
        Story[] memory allPrivateStories = new Story[](privateStoriesCount[msg.sender]);
        for (uint256 i = 0; i < storiesIndex; i++) {
            if (stories[i].owner == msg.sender) {
                allPrivateStories[i] = stories[i];
            }
        }
        return allPrivateStories;
    }

    // get all public stories
    function getAllPublicStories() public view returns (Story[] memory) {        
        Story[] memory allPublicStories = new Story[](publicStoriesCount);
        for (uint256 i = 0; i < storiesIndex; i++) {
            if (compareStrings(stories[i].status, "public")) {
                allPublicStories[i] = stories[i];
            }            
        }
        return allPublicStories;
    }

    // delete story at index @_index
    function deleteStory(uint256 _index) public {
        require(stories[_index].owner == msg.sender, "Only owner can delete story");
        string memory status = stories[_index].status;
        stories[_index] = stories[storiesIndex - 1];
        delete stories[storiesIndex - 1];  

        if (compareStrings(status, "private")) {
            privateStoriesCount[msg.sender]--;
        } else if (compareStrings(status, "public")) {
            publicStoriesCount--;
        }      
    }

    // return public stories length
    function getStoriesPublicLength() external view returns (uint256) {
        return publicStoriesCount;
    }

    // return private stories length
    function getPrivateStoriesLength() public view returns (uint256) {
        return privateStoriesCount[msg.sender];
    }
}