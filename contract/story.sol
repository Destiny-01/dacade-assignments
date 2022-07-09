// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

pragma solidity ^0.8.3;

contract StoryBook is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter public _storyCounter;

    struct Story {
        string title;
        string description;
        State status;
        address owner;
        uint256 createdAt;
    }

    enum State {
        Public,
        Private
    }

    mapping(address => uint) public myStories;
    mapping(address => uint256) private myStoriesCount;


    mapping(uint256 => Story) private stories;

    event NewStory(uint256 id, address owner);
    event DeletedStory(uint256 _id);
    event Edited(uint256 _id);

    /// @dev checks if caller is story owner
    modifier isStoryOwner(uint256 _id) {
        require(stories[_id].owner == msg.sender, "Invalid caller");
        _;
    }
    /// @dev checks if _status is valid
    modifier isValidStatus(uint256 _status) {
        require(
            _status == 1 || _status == 0,
            "status can only be public or private"
        );
        _;
    }

    modifier exist(uint _id){
        require(_id < _storyCounter.current(), "Query of non existent story");
        _;
    }

    /*╔═════════════════════════════╗
      ║        STORY FUNCTIONS      ║
      ╚═════════════════════════════╝*/

    /* Creates a new story provided the right parameters are given */
    function createStory(
        string memory _title,
        string memory _description,
        uint256 _status
    ) external isValidStatus(_status) {
        require(bytes(_title).length > 0, "Invalid title");
        require(bytes(_description).length > 0, "Invalid description");
        uint256 id = _storyCounter.current();
        State status = _status == 0 ? State.Public : State.Private;
        _storyCounter.increment();
        stories[id] = Story(
            _title,
            _description,
            status,
            msg.sender,
            block.timestamp
        );
        myStoriesCount[msg.sender]++;
        emit NewStory(id, msg.sender);
    }

    /* Deletes a story provided you are the owner */
    function deleteStory(uint256 _id) external exist(_id) {
        require(
            stories[_id].owner == msg.sender || owner() == msg.sender,
            "Unauthorized user"
        );
        stories[_id] = stories[_storyCounter.current() - 1];
        delete stories[_storyCounter.current() - 1];
        _storyCounter.decrement();
        myStoriesCount[msg.sender]--;
        emit DeletedStory(_id);
    }

    /// @dev allows a story owner to edit his story
    function editStory(
        uint256 _id,
        string memory _title,
        string memory _description
    ) public exist(_id) isStoryOwner(_id) {
        uint256 _descriptionLength = bytes(_description).length;
        uint256 _titleLength = bytes(_title).length;
        require(
            _descriptionLength > 0 || _titleLength > 0,
            "Stories values can't be set to be empty"
        );
        if (_descriptionLength == 0) {
            stories[_id].title = _title;
            
        } else if (_titleLength == 0) {
            stories[_id].description = _description;
        } else {
            stories[_id].title = _title;
            stories[_id].description = _description;
            
        }
        emit Edited(_id);
    }

    /// @dev allows a story owner to change his story status
    /// @param _status can either be switched to public or private
    function changeStatus(uint256 _id, uint256 _status)
        external
        exist(_id)
        isStoryOwner(_id)
        isValidStatus(_status)
    {
        if (_status == 0) {
            stories[_id].status = State.Public;
        } else {
            stories[_id].status = State.Private;
        }
    }

    /* Get details of the story with that id */
    function getStory(uint256 _id) public view exist(_id) returns (Story memory story) {
        if(stories[_id].status == State.Private){
            require(msg.sender == stories[_id].owner || owner() == msg.sender, "Only the owner can view a private story");
            return stories[_id];
        }else{
            return stories[_id];
        }
    }

    /* Get all stories */
    function getStories() public view returns (Story[] memory story) {
        Story[] memory allStories = new Story[](_storyCounter.current());
        uint256 index = 0;
        for (uint256 i = 0; i < _storyCounter.current(); i++) {
            if (stories[i].status == State.Public) {
                allStories[index] = stories[i];
                index++;
            }
        }

        return allStories;
    }
}
