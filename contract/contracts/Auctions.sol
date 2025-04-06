// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Pausable.sol';

contract NFTAuction is ERC721URIStorage, ReentrancyGuard, Pausable {

    uint256 public tokenCounter;
    uint256 public listingCounter;

    uint8 public constant STATUS_OPEN = 1;
    uint8 public constant STATUS_DONE = 2;

    uint256 public minAuctionIncrement = 1000; // 10% expressed as basis points (10% = 1000 basis points)

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price; // display price
        uint256 netPrice; // actual price
        uint256 startAt;
        uint256 endAt; 
        uint8 status;
    }

    event Minted(address indexed minter, uint256 nftID, string uri);
    event AuctionCreated(uint256 listingId, address indexed seller, uint256 price, uint256 tokenId, uint256 startAt, uint256 endAt);
    event BidCreated(uint256 listingId, address indexed bidder, uint256 bid);
    event AuctionCompleted(uint256 listingId, address indexed seller, address indexed bidder, uint256 bid);
    event WithdrawBid(uint256 listingId, address indexed bidder, uint256 bid);

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => uint256)) public bids;
    mapping(uint256 => address) public highestBidder;
    mapping(uint256 => uint256) public finalSalePrices;

    constructor() ERC721("AmazonNFT", "ANFT") {
        tokenCounter = 0;
        listingCounter = 0;
    }

    function mint(string memory tokenURI, address minterAddress) public whenNotPaused returns (uint256) {
        tokenCounter++;
        uint256 tokenId = tokenCounter;

        _safeMint(minterAddress, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit Minted(minterAddress, tokenId, tokenURI);

        return tokenId;
    }

    function createAuctionListing(uint256 price, uint256 tokenId, uint256 durationInSeconds) public whenNotPaused returns (uint256) {
        require(ownerOf(tokenId) == msg.sender, "You must own the NFT to auction it");
        
        listingCounter++;
        uint256 listingId = listingCounter;

        uint256 startAt = block.timestamp;
        uint256 endAt = startAt + durationInSeconds;

        listings[listingId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            netPrice: price,
            status: STATUS_OPEN,
            startAt: startAt,
            endAt: endAt
        });

        _transfer(msg.sender, address(this), tokenId);

        emit AuctionCreated(listingId, msg.sender, price, tokenId, startAt, endAt);

        return listingId;
    }

    function bid(uint256 listingId) public payable nonReentrant whenNotPaused {
        require(isAuctionOpen(listingId), 'auction has ended');
        Listing storage listing = listings[listingId];
        require(msg.sender != listing.seller, "cannot bid on what you own");

        uint256 newBid = bids[listingId][msg.sender] + msg.value;
        require(newBid >= listing.price, "cannot bid below the latest bidding price");

        bids[listingId][msg.sender] += msg.value;
        highestBidder[listingId] = msg.sender;

        if (listing.price < newBid) {
            listing.price = newBid;
        }
        
        uint256 incentive = listing.price / 10;
        listing.price = listing.price + incentive;

        emit BidCreated(listingId, msg.sender, newBid);
    }

    function completeAuction(uint256 listingId) public nonReentrant whenNotPaused {
        require(!isAuctionOpen(listingId), 'auction is still open');

        Listing storage listing = listings[listingId];
        require(listing.status != STATUS_DONE, "auction already completed");
        
        address winner = highestBidder[listingId]; 
        require(
            msg.sender == listing.seller || msg.sender == winner, 
            'only seller or winner can complete auction'
        );

        if(winner != address(0)) {
            _transfer(address(this), winner, listing.tokenId);

            uint256 amount = bids[listingId][winner];
            bids[listingId][winner] = 0;
            _transferFund(payable(listing.seller), amount);
            emit AuctionCompleted(listingId, listing.seller, winner, amount);
        } else {
            _transfer(address(this), listing.seller, listing.tokenId);
        }

        listing.status = STATUS_DONE;
    }

    function withdrawBid(uint256 listingId) public nonReentrant whenNotPaused {
        require(isAuctionExpired(listingId), 'auction must be ended');
        require(highestBidder[listingId] != msg.sender, 'highest bidder cannot withdraw bid');

        uint256 balance = bids[listingId][msg.sender];
        require(balance > 0, "no bids to withdraw");
        
        bids[listingId][msg.sender] = 0;
        _transferFund(payable(msg.sender), balance);

        emit WithdrawBid(listingId, msg.sender, balance);
    }

    function isAuctionOpen(uint256 id) public view returns (bool) {
        return
            listings[id].status == STATUS_OPEN &&
            listings[id].endAt > block.timestamp;
    }

    function isAuctionExpired(uint256 id) public view returns (bool) {
        return listings[id].endAt <= block.timestamp;
    }

    function _transferFund(address payable to, uint256 amount) internal {
        if (amount == 0) {
            return;
        }
        require(to != address(0), 'Error, cannot transfer to address(0)');

        (bool transferSent, ) = to.call{value: amount}("");
        require(transferSent, "Error, failed to send Ether");
    }

    // Admin functions
    function pause() public {
        _pause();
    }

    function unpause() public {
        _unpause();
    }

    function updateMinAuctionIncrement(uint256 _minAuctionIncrement) public {
        minAuctionIncrement = _minAuctionIncrement;
    }
}
