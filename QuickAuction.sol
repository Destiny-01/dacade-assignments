// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract QuickAuction is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("AuctionNFT", "AUC") {}

    struct Auction {
        uint256 id;
        string title;
        uint256 tokenId;
        address owner;
        uint256 highestBid;
        address highestBidder;
        address[] buyers;
        uint256 endTime;
        bool isActive;
        bool ownerTaken;
    }

    mapping (address => mapping (uint256 => uint256)) bids;
    mapping (uint256 => Auction) auctions;

    event NewAuction(uint256 id);
    event Bid(address indexed sender, uint256 amount);
    event End(address winner, uint256 amount);

    /* Check if the auction has ended */
    modifier isTimeUp (uint256 _id) {
        if (block.timestamp > auctions[_id].endTime) {
            auctions[_id].isActive = false;
        }
        _;
    }
    
    /* Mints the token to them */
    function mintToken(string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    
    /*╔═════════════════════════════╗
      ║        AUCTION FUNCTIONS    ║
      ╚═════════════════════════════╝*/

    /* Creates a new auction provided the right parameters are given */
    function createAuction(
        string memory _title,
        uint256 _tokenId,
        uint256 _startPrice,
        uint256 _endTime
    ) external {
        uint256 id = uint256(keccak256(bytes(_title))) % block.timestamp;
        
        auctions[id].id = id;
        auctions[id].title = _title;
        auctions[id].tokenId = _tokenId;
        auctions[id].highestBid = _startPrice;
        auctions[id].endTime = block.timestamp + _endTime;
        auctions[id].owner = msg.sender;
        auctions[id].isActive = true;

        _transfer(msg.sender, address(this), _tokenId);
        emit NewAuction(id);
    }

    /* Make a bid to a specific auction */
    function bid (uint256 _id) payable external isTimeUp(_id) {
        require(block.timestamp < auctions[_id].endTime || auctions[_id].isActive, "Auction ended");
        require(msg.sender != auctions[_id].owner, "Owner can't bid duh!!!");

        uint256 currentBid = bids[msg.sender][_id] + msg.value;

        if (msg.value > auctions[_id].highestBid) {
            auctions[_id].highestBid = msg.value;
        } else {
            require(currentBid > auctions[_id].highestBid, "Amount is less than current bid");
            auctions[_id].highestBid = currentBid;
        }

        auctions[_id].highestBidder = msg.sender;
        if (bids[msg.sender][_id] == 0) {
            auctions[_id].buyers.push(msg.sender);
        }
        bids[msg.sender][_id] = currentBid;

        emit Bid(msg.sender, currentBid);
    }

    /* Auction is over, collect your rewards */
    function timeUp (uint256 _id, bool willReducePrice) external isTimeUp(_id) {
        require(!auctions[_id].isActive, "Auction has not yet ended");

        if (auctions[_id].owner == msg.sender && !auctions[_id].ownerTaken) {
            if (auctions[_id].highestBidder == address(0)) {
                willReducePrice
                    ? revert("Price too hig or no bidder. Please reduce your price using reducePrice()")
                    : _transfer(address(this), msg.sender, auctions[_id].tokenId);
            } else {
                payable(auctions[_id].owner).transfer(auctions[_id].highestBid);
            }
            auctions[_id].ownerTaken = true;
        } else if (auctions[_id].highestBidder == msg.sender) {
            _transfer(address(this), auctions[_id].highestBidder, auctions[_id].tokenId);
        } else {
            require(bids[msg.sender][_id] != 0, "Did you participate???");
            payable(msg.sender).transfer(bids[msg.sender][_id]);
        }
        bids[msg.sender][_id] = 0;
    }

    /* Auction is over and there is no bidder, reduce your starting price */
    function reducePrice (uint256 _id, uint256 _endAfter, uint256 _newBid) external isTimeUp(_id) {
        require(auctions[_id].owner == msg.sender, "Wrong auction, not yours");
        require(!auctions[_id].isActive, "Auction has not yet ended");
        require(auctions[_id].highestBidder == address(0), "There is already a bidder, call timeUp()");
        require(_newBid < auctions[_id].highestBid, "Yo, your starting price needs to be lower...");

        auctions[_id].highestBid = _newBid;
        auctions[_id].endTime = block.timestamp + _endAfter;
        auctions[_id].isActive = true;
    }

    /* Get details of the auction with that id */
    function getAuction(uint256 _id) external view returns (Auction memory auction) {
        return auctions[_id];
    }

    /* Get how long is remaining to auction for a specific auction */
    function getTimeRemaining(uint256 _id) external view returns (uint256 time) {
        if(auctions[_id].endTime > block.timestamp) {
            return auctions[_id].endTime - block.timestamp;
        }
        return 0;
    }
}
