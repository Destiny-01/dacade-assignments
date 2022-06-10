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
        uint256 startPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool isActive;
        bool ownerTaken;
    }

    mapping (address => mapping (uint256 => uint256)) bids;
    mapping (uint256 => Auction) auctions;
    mapping(uint256 => bool) tokenAuctioned;

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
    
    /* Mints token to caller */
    function mintToken(string memory tokenURI)
        public
        returns (uint256)
    {
        uint256 newItemId = _tokenIds.current();
        _tokenIds.increment();
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
        require(_tokenId >= 0, "Enter a valid tokenId");
        require(bytes(_title).length > 0, "Enter a valid title");
        require(!tokenAuctioned[_tokenId], "Nft is already being auctioned!");
        uint256 id = uint256(keccak256(bytes(_title))) % block.timestamp;
        
        auctions[id].id = id;
        auctions[id].title = _title;
        auctions[id].tokenId = _tokenId;
        auctions[id].startPrice = _startPrice;
        auctions[id].endTime = block.timestamp + _endTime;
        auctions[id].owner = msg.sender;
        auctions[id].isActive = true;

        tokenAuctioned[_tokenId] = true;
        _transfer(msg.sender, address(this), _tokenId);
        emit NewAuction(id);
    }

    /* Make a bid to a specific auction */
    function bid (uint256 _id) payable external isTimeUp(_id) {
        require(block.timestamp < auctions[_id].endTime || auctions[_id].isActive, "Auction ended");
        require(msg.sender != auctions[_id].owner, "Owner can't bid duh!!!");
        require(msg.value > auctions[_id].startPrice, "Amount is less than start price");

        uint256 currentBid = bids[msg.sender][_id] + msg.value;

        if (msg.value > auctions[_id].highestBid && msg.value > auctions[_id].startPrice) {
            auctions[_id].highestBid = msg.value;
        } else {
            require(currentBid > auctions[_id].highestBid, "Amount is less than current bid");
            auctions[_id].highestBid = currentBid;
        }

        auctions[_id].highestBidder = msg.sender;
        bids[msg.sender][_id] = currentBid;

        emit Bid(msg.sender, currentBid);
    }

    /* When auction is over, collect your rewards */
    function timeUp (uint256 _id) external isTimeUp(_id) {
        require(!auctions[_id].isActive, "Auction has not yet ended");
        require(block.timestamp > auctions[_id].endTime, "Auction has not expired");

        if (auctions[_id].owner == msg.sender && !auctions[_id].ownerTaken) {
            if (auctions[_id].highestBidder == address(0)) {
                _transfer(address(this), msg.sender, auctions[_id].tokenId);
            } else {
               (bool success,) = payable(auctions[_id].owner).call{value : auctions[_id].highestBid}("");
               require(success, "Transfer of highest bid to owner failed");
            }
            auctions[_id].ownerTaken = true;
        } else if (auctions[_id].highestBidder == msg.sender) {
            _transfer(address(this), auctions[_id].highestBidder, auctions[_id].tokenId);
        } else {
            require(bids[msg.sender][_id] != 0, "Did you participate???");
            (bool success,)  = payable(msg.sender).call{value : bids[msg.sender][_id]}("");
            require(success, "Refund failed");
        }
        bids[msg.sender][_id] = 0;
        tokenAuctioned[auctions[_id].tokenId] = false;
    }

    /* Gets details of the auction with that id */
    function getAuction(uint256 _id) external view returns (Auction memory auction) {
        return auctions[_id];
    }

    /* Gets how much time remains for a specific auction */
    function getTimeRemaining(uint256 _id) external view returns (uint256 time) {
        if(auctions[_id].endTime > block.timestamp) {
            return auctions[_id].endTime - block.timestamp;
        }
        return 0;
    }
}
