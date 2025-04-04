const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Auction Platform", function() {
  
  // Set up the contract and test accounts
  async function deployAuctionFixture() {
    // Get test accounts
    const [owner, seller, bidder1, bidder2] = await ethers.getSigners();
    
    // Deploy NFT Auction contract
    const NFTAuction = await ethers.getContractFactory("NFTAuction");
    const auction = await NFTAuction.deploy();
    
    // Get addresses for easier reference
    const ownerAddress = await owner.getAddress();
    const sellerAddress = await seller.getAddress();
    const bidder1Address = await bidder1.getAddress();
    const bidder2Address = await bidder2.getAddress();
    
    return { auction, owner, seller, bidder1, bidder2, ownerAddress, sellerAddress, bidder1Address, bidder2Address };
  }
  
  describe("Deployment", function() {
    it("Should initialize counters correctly", async function() {
      const { auction } = await loadFixture(deployAuctionFixture);
      
      expect(await auction.tokenCounter()).to.equal(0);
      expect(await auction.listingCounter()).to.equal(0);
    });
    
    it("Should set correct NFT name and symbol", async function() {
      const { auction } = await loadFixture(deployAuctionFixture);
      
      expect(await auction.name()).to.equal("AmazonNFT");
      expect(await auction.symbol()).to.equal("ANFT");
    });
  });
  
  describe("NFT Minting", function() {
    it("Should mint an NFT with correct tokenURI", async function() {
      const { auction, seller, sellerAddress } = await loadFixture(deployAuctionFixture);
      
      const tokenURI = "ipfs://test-metadata";
      
      // Mint NFT
      await auction.mint(tokenURI, sellerAddress);
      
      // Check counter incremented
      expect(await auction.tokenCounter()).to.equal(1);
      
      // Check token ownership and URI
      expect(await auction.ownerOf(1)).to.equal(sellerAddress);
      expect(await auction.tokenURI(1)).to.equal(tokenURI);
    });
    
    it("Should emit Minted event when minting", async function() {
      const { auction, seller, sellerAddress } = await loadFixture(deployAuctionFixture);
      
      const tokenURI = "ipfs://test-metadata";
      
      // Check event emission
      await expect(auction.mint(tokenURI, sellerAddress))
        .to.emit(auction, "Minted")
        .withArgs(sellerAddress, 1, tokenURI);
    });
    
    it("Should fail to mint when contract is paused", async function() {
      const { auction, seller, sellerAddress } = await loadFixture(deployAuctionFixture);
      
      // Pause the contract
      await auction.pause();
      
      // Try to mint - should fail with a custom error
      await expect(
        auction.mint("ipfs://test", sellerAddress)
      ).to.be.reverted; // Just check that it reverts without specifying the message
      
      // Unpause and try again - should work
      await auction.unpause();
      await expect(
        auction.mint("ipfs://test", sellerAddress)
      ).not.to.be.reverted;
    });
  });
  
  // Set up fixture with minted NFTs
  async function mintedNFTFixture() {
    const { auction, owner, seller, bidder1, bidder2, ownerAddress, sellerAddress, bidder1Address, bidder2Address } = await loadFixture(deployAuctionFixture);
    
    // Mint an NFT for the seller
    await auction.mint("ipfs://seller-nft", sellerAddress);
    
    return { auction, owner, seller, bidder1, bidder2, ownerAddress, sellerAddress, bidder1Address, bidder2Address };
  }
  
  describe("Auction Creation", function() {
    it("Should create an auction with correct details", async function() {
      const { auction, seller, sellerAddress } = await loadFixture(mintedNFTFixture);
      
      const tokenId = 1;
      const price = ethers.parseEther("0.5");
      const duration = 86400; // 1 day in seconds
      
      // Create auction
      await auction.connect(seller).createAuctionListing(price, tokenId, duration);
      
      // Check listing counter incremented
      expect(await auction.listingCounter()).to.equal(1);
      
      // Check listing details
      const listing = await auction.listings(1);
      expect(listing.seller).to.equal(sellerAddress);
      expect(listing.tokenId).to.equal(tokenId);
      expect(listing.price).to.equal(price);
      expect(listing.netPrice).to.equal(price);
      expect(listing.status).to.equal(1); // STATUS_OPEN
      
      // Check NFT transferred to contract
      expect(await auction.ownerOf(tokenId)).to.equal(await auction.getAddress());
    });
    
    it("Should emit AuctionCreated event", async function() {
      const { auction, seller, sellerAddress } = await loadFixture(mintedNFTFixture);
      
      const tokenId = 1;
      const price = ethers.parseEther("0.5");
      const duration = 86400; // 1 day in seconds
      
      const currentTime = await time.latest();
      
      // Check event emission with proper arguments
      await expect(auction.connect(seller).createAuctionListing(price, tokenId, duration))
        .to.emit(auction, "AuctionCreated")
        .withArgs(1, sellerAddress, price, tokenId, currentTime + 1, currentTime + 1 + duration);
    });
    
    it("Should revert if non-owner tries to auction NFT", async function() {
      const { auction, bidder1 } = await loadFixture(mintedNFTFixture);
      
      const tokenId = 1; // Owned by seller, not bidder1
      const price = ethers.parseEther("0.5");
      const duration = 86400;
      
      // Bidder1 tries to auction seller's NFT
      await expect(
        auction.connect(bidder1).createAuctionListing(price, tokenId, duration)
      ).to.be.revertedWith("You must own the NFT to auction it");
    });
    
    it("Should revert when creating auction for non-existent token", async function() {
      const { auction, seller } = await loadFixture(mintedNFTFixture);
      
      const nonExistentTokenId = 999;
      
      await expect(
        auction.connect(seller).createAuctionListing(ethers.parseEther("1.0"), nonExistentTokenId, 86400)
      ).to.be.reverted;
    });
  });
  
  // Set up fixture with active auction
  async function activeAuctionFixture() {
    const { auction, owner, seller, bidder1, bidder2, ownerAddress, sellerAddress, bidder1Address, bidder2Address } = await mintedNFTFixture();
    
    // Create an auction
    const startPrice = ethers.parseEther("0.5");
    const duration = 86400; // 1 day
    
    await auction.connect(seller).createAuctionListing(startPrice, 1, duration);
    
    return { 
      auction, owner, seller, bidder1, bidder2, 
      ownerAddress, sellerAddress, bidder1Address, bidder2Address,
      auctionId: 1, tokenId: 1, startPrice, duration
    };
  }
  
  describe("Bidding", function() {
    it("Should allow placing a bid that meets the minimum price", async function() {
      const { auction, bidder1, startPrice, auctionId } = await loadFixture(activeAuctionFixture);
      
      // Place a bid
      await auction.connect(bidder1).bid(auctionId, { value: startPrice });
      
      // Check bid recorded
      expect(await auction.bids(auctionId, await bidder1.getAddress())).to.equal(startPrice);
      
      // Check highest bidder
      expect(await auction.highestBidder(auctionId)).to.equal(await bidder1.getAddress());
    });
    
    it("Should emit BidCreated event when bidding", async function() {
      const { auction, bidder1, bidder1Address, startPrice, auctionId } = await loadFixture(activeAuctionFixture);
      
      await expect(auction.connect(bidder1).bid(auctionId, { value: startPrice }))
        .to.emit(auction, "BidCreated")
        .withArgs(auctionId, bidder1Address, startPrice);
    });
    
    it("Should reject bids below the current price", async function() {
      const { auction, bidder1, startPrice, auctionId } = await loadFixture(activeAuctionFixture);
      
      const lowBid = startPrice / 2n;
      
      await expect(
        auction.connect(bidder1).bid(auctionId, { value: lowBid })
      ).to.be.revertedWith("cannot bid below the latest bidding price");
    });
    
    it("Should increase the price after each bid", async function() {
      const { auction, bidder1, startPrice, auctionId } = await loadFixture(activeAuctionFixture);
      
      // Place a bid
      await auction.connect(bidder1).bid(auctionId, { value: startPrice });
      
      // Check that price increased by 10%
      const listing = await auction.listings(auctionId);
      const expectedNewPrice = startPrice + (startPrice / 10n);
      expect(listing.price).to.equal(expectedNewPrice);
    });
    
    it("Should accumulate bid amounts from the same bidder", async function() {
      const { auction, bidder1, bidder1Address, startPrice, auctionId } = await loadFixture(activeAuctionFixture);
      
      // First bid
      const firstBid = startPrice;
      await auction.connect(bidder1).bid(auctionId, { value: firstBid });
      
      // Get price after first bid (price + 10%)
      const listingAfterFirstBid = await auction.listings(auctionId);
      
      // Second bid - should only need to pay the difference plus 10%
      const secondBid = ethers.parseEther("0.1");
      await auction.connect(bidder1).bid(auctionId, { value: secondBid });
      
      // Check total bid recorded
      const expectedTotal = firstBid + secondBid;
      expect(await auction.bids(auctionId, bidder1Address)).to.equal(expectedTotal);
    });
    
    it("Should reject bids after auction end time", async function() {
      const { auction, bidder1, startPrice, auctionId, duration } = await loadFixture(activeAuctionFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Try to bid after auction ended
      await expect(
        auction.connect(bidder1).bid(auctionId, { value: startPrice })
      ).to.be.revertedWith("auction has ended");
    });
    
    it("Should not allow the seller to bid on their own auction", async function() {
      const { auction, seller, startPrice, auctionId } = await loadFixture(activeAuctionFixture);
      
      await expect(
        auction.connect(seller).bid(auctionId, { value: startPrice })
      ).to.be.revertedWith("cannot bid on what you own");
    });
    
    it("Should handle outbidding correctly", async function() {
      const { auction, bidder1, bidder2, bidder1Address, bidder2Address, startPrice, auctionId } = await loadFixture(activeAuctionFixture);
      
      // First bidder places bid
      await auction.connect(bidder1).bid(auctionId, { value: startPrice });
      
      // Get price after first bid
      const listingAfterFirstBid = await auction.listings(auctionId);
      const newPrice = listingAfterFirstBid.price;
      
      // Second bidder outbids
      await auction.connect(bidder2).bid(auctionId, { value: newPrice });
      
      // Check highest bidder is updated
      expect(await auction.highestBidder(auctionId)).to.equal(bidder2Address);
    });
  });
  
  // Set up fixture with bids
  async function auctionWithBidsFixture() {
    const { 
      auction, owner, seller, bidder1, bidder2,
      ownerAddress, sellerAddress, bidder1Address, bidder2Address,
      auctionId, tokenId, startPrice, duration 
    } = await activeAuctionFixture();
    
    // First bidder places bid
    await auction.connect(bidder1).bid(auctionId, { value: startPrice });
    
    // Get price after first bid
    const listingAfterFirstBid = await auction.listings(auctionId);
    const newPrice = listingAfterFirstBid.price;
    
    // Second bidder outbids
    await auction.connect(bidder2).bid(auctionId, { value: newPrice });
    
    return { 
      auction, owner, seller, bidder1, bidder2,
      ownerAddress, sellerAddress, bidder1Address, bidder2Address,
      auctionId, tokenId, startPrice, duration,
      bidder1Bid: startPrice,
      bidder2Bid: newPrice
    };
  }
  
  describe("Auction Completion", function() {
    it("Should allow winner to complete auction after end time", async function() {
      const { 
        auction, bidder2, bidder2Address, seller, sellerAddress,
        auctionId, tokenId, duration
      } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Complete the auction as the winner
      await auction.connect(bidder2).completeAuction(auctionId);
      
      // Check auction status
      const listing = await auction.listings(auctionId);
      expect(listing.status).to.equal(2); // STATUS_DONE
      
      // Check NFT transferred to winner
      expect(await auction.ownerOf(tokenId)).to.equal(bidder2Address);
    });
    
    it("Should allow seller to complete auction after end time", async function() {
      const { 
        auction, bidder2, bidder2Address, seller,
        auctionId, tokenId, duration
      } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Complete the auction as the seller
      await auction.connect(seller).completeAuction(auctionId);
      
      // Check NFT transferred to winner
      expect(await auction.ownerOf(tokenId)).to.equal(bidder2Address);
    });
    
    it("Should emit AuctionCompleted event", async function() {
      const { 
        auction, bidder2, bidder2Address, seller, sellerAddress,
        auctionId, bidder2Bid, duration
      } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Check event emission with the correct bid amount
      await expect(auction.connect(bidder2).completeAuction(auctionId))
        .to.emit(auction, "AuctionCompleted")
        .withArgs(auctionId, sellerAddress, bidder2Address, bidder2Bid);
    });
    
    it("Should transfer funds to the seller", async function() {
      const { 
        auction, bidder2, seller, sellerAddress,
        auctionId, bidder2Bid, duration
      } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Get seller's balance before completion
      const sellerBalanceBefore = await ethers.provider.getBalance(sellerAddress);
      
      // Complete the auction
      await auction.connect(bidder2).completeAuction(auctionId);
      
      // Check seller's balance increased
      const sellerBalanceAfter = await ethers.provider.getBalance(sellerAddress);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(bidder2Bid);
    });
    
    it("Should return NFT to seller if no bids were placed", async function() {
      const { 
        auction, seller, sellerAddress, 
        duration
      } = await loadFixture(activeAuctionFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Complete the auction
      await auction.connect(seller).completeAuction(1);
      
      // Check NFT returned to seller
      expect(await auction.ownerOf(1)).to.equal(sellerAddress);
    });
    
    it("Should not allow completing auction before end time", async function() {
      const { auction, bidder2, auctionId } = await loadFixture(auctionWithBidsFixture);
      
      // Try to complete before auction ends
      await expect(
        auction.connect(bidder2).completeAuction(auctionId)
      ).to.be.revertedWith("auction is still open");
    });
    
    it("Should not allow non-seller/non-winner to complete auction", async function() {
      const { auction, bidder1, auctionId, duration } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Try to complete by non-seller/non-winner
      await expect(
        auction.connect(bidder1).completeAuction(auctionId)
      ).to.be.revertedWith("only seller or winner can complete auction");
    });
    
    it("Should not allow completing an already completed auction", async function() {
      const { auction, bidder2, auctionId, duration } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Complete the auction
      await auction.connect(bidder2).completeAuction(auctionId);
      
      // Try to complete again
      await expect(
        auction.connect(bidder2).completeAuction(auctionId)
      ).to.be.revertedWith("auction already completed");
    });
  });
  
  describe("Bid Withdrawal", function() {
    it("Should allow non-winners to withdraw their bids after auction ends", async function() {
      const { 
        auction, bidder1, bidder1Address, bidder1Bid,
        auctionId, duration
      } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Get bidder's balance before withdrawal
      const bidderBalanceBefore = await ethers.provider.getBalance(bidder1Address);
      
      // Withdraw bid - should send funds back
      const tx = await auction.connect(bidder1).withdrawBid(auctionId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      // Check bidder's balance increased (minus gas costs)
      const bidderBalanceAfter = await ethers.provider.getBalance(bidder1Address);
      expect(bidderBalanceAfter + gasUsed - bidderBalanceBefore).to.equal(bidder1Bid);
      
      // Check bid record cleared
      expect(await auction.bids(auctionId, bidder1Address)).to.equal(0);
    });
    
    it("Should emit WithdrawBid event", async function() {
      const { 
        auction, bidder1, bidder1Address, bidder1Bid,
        auctionId, duration
      } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Check event emission
      await expect(auction.connect(bidder1).withdrawBid(auctionId))
        .to.emit(auction, "WithdrawBid")
        .withArgs(auctionId, bidder1Address, bidder1Bid);
    });
    
    it("Should not allow highest bidder to withdraw", async function() {
      const { auction, bidder2, auctionId, duration } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Try to withdraw as highest bidder
      await expect(
        auction.connect(bidder2).withdrawBid(auctionId)
      ).to.be.revertedWith("highest bidder cannot withdraw bid");
    });
    
    it("Should not allow withdrawal during active auction", async function() {
      const { auction, bidder1, auctionId } = await loadFixture(auctionWithBidsFixture);
      
      // Try to withdraw during active auction
      await expect(
        auction.connect(bidder1).withdrawBid(auctionId)
      ).to.be.revertedWith("auction must be ended");
    });
    
    it("Should not allow withdrawal if no bid was placed", async function() {
      const { auction, owner, auctionId, duration } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Try to withdraw with no bids
      await expect(
        auction.connect(owner).withdrawBid(auctionId)
      ).to.be.revertedWith("no bids to withdraw");
    });
    
    it("Should not allow double withdrawal", async function() {
      const { auction, bidder1, auctionId, duration } = await loadFixture(auctionWithBidsFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Withdraw once
      await auction.connect(bidder1).withdrawBid(auctionId);
      
      // Try to withdraw again
      await expect(
        auction.connect(bidder1).withdrawBid(auctionId)
      ).to.be.revertedWith("no bids to withdraw");
    });
  });
  
  describe("Admin Functions", function() {
    it("Should allow pausing and unpausing the contract", async function() {
      const { auction } = await loadFixture(deployAuctionFixture);
      
      // Pause
      await auction.pause();
      expect(await auction.paused()).to.be.true;
      
      // Unpause
      await auction.unpause();
      expect(await auction.paused()).to.be.false;
    });
    
    it("Should prevent creating auctions when paused", async function() {
      const { auction, seller } = await loadFixture(mintedNFTFixture);
      
      // Pause the contract
      await auction.pause();
      
      // Try to create auction
      await expect(
        auction.connect(seller).createAuctionListing(ethers.parseEther("1.0"), 1, 86400)
      ).to.be.reverted; // Just check that it reverts without specifying the message
    });
    
    it("Should prevent bidding when paused", async function() {
      const { auction, bidder1, auctionId, startPrice } = await loadFixture(activeAuctionFixture);
      
      // Pause the contract
      await auction.pause();
      
      // Try to bid
      await expect(
        auction.connect(bidder1).bid(auctionId, { value: startPrice })
      ).to.be.reverted; // Just check that it reverts without specifying the message
    });
    
    it("Should allow updating min auction increment", async function() {
      const { auction } = await loadFixture(deployAuctionFixture);
      
      const newIncrement = 2000; // 20%
      await auction.updateMinAuctionIncrement(newIncrement);
      
      expect(await auction.minAuctionIncrement()).to.equal(newIncrement);
    });
  });
  
  describe("Edge Cases", function() {
    it("Should handle multiple auctions simultaneously", async function() {
      const { auction, seller, bidder1, bidder2 } = await loadFixture(mintedNFTFixture);
      
      // Mint a second NFT
      await auction.mint("ipfs://second-nft", await seller.getAddress());
      
      // Create two auctions
      await auction.connect(seller).createAuctionListing(ethers.parseEther("0.5"), 1, 86400);
      await auction.connect(seller).createAuctionListing(ethers.parseEther("1.0"), 2, 86400);
      
      // Bid on both auctions
      await auction.connect(bidder1).bid(1, { value: ethers.parseEther("0.5") });
      await auction.connect(bidder2).bid(2, { value: ethers.parseEther("1.0") });
      
      // Check bids recorded correctly
      expect(await auction.bids(1, await bidder1.getAddress())).to.equal(ethers.parseEther("0.5"));
      expect(await auction.bids(2, await bidder2.getAddress())).to.equal(ethers.parseEther("1.0"));
      
      // Check highest bidders
      expect(await auction.highestBidder(1)).to.equal(await bidder1.getAddress());
      expect(await auction.highestBidder(2)).to.equal(await bidder2.getAddress());
    });
    
    it("Should handle auction with no bids", async function() {
      const { auction, seller, sellerAddress, auctionId, tokenId, duration } = await loadFixture(activeAuctionFixture);
      
      // Advance time past the auction end
      await time.increase(duration + 1);
      
      // Complete auction with no bids
      await auction.connect(seller).completeAuction(auctionId);
      
      // NFT should be returned to seller
      expect(await auction.ownerOf(tokenId)).to.equal(sellerAddress);
    });
  });
});