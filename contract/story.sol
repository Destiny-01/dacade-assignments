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

    mapping (address => mapping (uint256 => Story)) myStories;
    Story[] stories;

    event NewStory(uint256 id, address owner);
    event DeletedStory(uint256 _id);
    
    /*╔═════════════════════════════╗
      ║        STORY FUNCTIONS      ║
      ╚═════════════════════════════╝*/

    /* Creates a new story provided the right parameters are given */
    function createStory(
        uint256 _id,
        string memory _title,
        string memory _description,
        string memory _status
    ) external {
        require(myStories[msg.sender][_id].createdAt == 0, "Id taken");
        myStories[msg.sender][_id].title = _title;
        myStories[msg.sender][_id].description = _description;
        myStories[msg.sender][_id].status = _status;
        myStories[msg.sender][_id].owner = msg.sender;
        myStories[msg.sender][_id].createdAt = block.timestamp;

        stories.push(Story(_title, _description, _status, msg.sender, block.timestamp));

        emit NewStory(_id, msg.sender);
    }

    /* Deletes a story provided you are the owner */
    function deleteStory(uint256 _id) external {
        for (uint256 i = 0; i < stories.length; i++){
            if (stories[i].createdAt == _id && stories[i].owner == msg.sender){
                delete(myStories[msg.sender][_id]);
                delete(stories[i]);
                emit DeletedStory(_id);
                return;
            }
        }
        revert("Story not found or not yours");
    }

    /* Get details of the story with that id */
    function getStory(uint256 _id) external view returns (Story memory story) {
        for (uint256 i = 0; i < stories.length; i++){
            if (stories[i].createdAt == _id){
                return stories[i];
            }
        }
    }

    /* Get all stories */
    function getStories() external view returns (Story[] memory story) {
        return stories;
    }
}