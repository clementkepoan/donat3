const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Contract", function () {
  let nft;
  let owner;
  let user1;
  let user2;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy();
    // Update to use waitForDeployment() instead of deployTransaction.wait()
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should have the correct name and symbol", async function () {
      expect(await nft.name()).to.equal("MyNFT");
      expect(await nft.symbol()).to.equal("MNFT");
    });
  });
  
  describe("Minting", function () {
    it("Should allow owner to mint NFTs", async function () {
      await expect(nft.mint(user1.address, 1))
        .to.emit(nft, 'Transfer')
        .withArgs(ethers.ZeroAddress, user1.address, 1);
      
      expect(await nft.ownerOf(1)).to.equal(user1.address);
      expect(await nft.balanceOf(user1.address)).to.equal(1);
    });
    
    it("Should not allow non-owners to mint NFTs", async function () {
      await expect(
        nft.connect(user1).mint(user1.address, 2)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });
  
  describe("Token URI", function () {
    beforeEach(async function () {
      await nft.mint(user1.address, 1);
    });
    
    it("Should return a valid token URI with base64 encoded JSON", async function () {
      const tokenURI = await nft.tokenURI(1);
      
      // Check if it's a data URI with base64
      expect(tokenURI).to.include("data:application/json;base64,");
      
      // Decode the base64 content
      const base64Content = tokenURI.split(",")[1];
      const decodedContent = Buffer.from(base64Content, 'base64').toString('utf8');
      const jsonData = JSON.parse(decodedContent);
      
      // Validate the JSON structure
      expect(jsonData.name).to.equal("NFT #1");
      expect(jsonData.description).to.equal("An on-chain generated NFT.");
      expect(jsonData.image).to.include("data:image/svg+xml;base64,");
    });
    
    it("Should include a valid SVG in the token URI", async function () {
      const tokenURI = await nft.tokenURI(1);
      const base64Content = tokenURI.split(",")[1];
      const decodedContent = Buffer.from(base64Content, 'base64').toString('utf8');
      const jsonData = JSON.parse(decodedContent);
      
      // Extract and decode the SVG
      const svgBase64 = jsonData.image.split(",")[1];
      const svgContent = Buffer.from(svgBase64, 'base64').toString('utf8');
      
      expect(svgContent).to.include("<svg");
      expect(svgContent).to.include("</svg>");
    });
  });
  
  describe("ERC721 functionality", function () {
    beforeEach(async function () {
      await nft.mint(user1.address, 1);
    });
    
    it("Should support transferring tokens", async function () {
      await nft.connect(user1).transferFrom(user1.address, user2.address, 1);
      
      expect(await nft.ownerOf(1)).to.equal(user2.address);
      expect(await nft.balanceOf(user1.address)).to.equal(0);
      expect(await nft.balanceOf(user2.address)).to.equal(1);
    });
    
    it("Should correctly implement ERC721Enumerable", async function () {
      await nft.mint(user1.address, 2);
      
      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.tokenByIndex(0)).to.equal(1);
      expect(await nft.tokenByIndex(1)).to.equal(2);
      
      expect(await nft.tokenOfOwnerByIndex(user1.address, 0)).to.equal(1);
      expect(await nft.tokenOfOwnerByIndex(user1.address, 1)).to.equal(2);
    });
    
    it("Should implement supportsInterface correctly", async function () {
      // Test for ERC165 interface
      expect(await nft.supportsInterface("0x01ffc9a7")).to.equal(true);
      
      // Test for ERC721 interface
      expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true);
      
      // Test for ERC721Metadata interface
      expect(await nft.supportsInterface("0x5b5e139f")).to.equal(true);
      
      // Test for ERC721Enumerable interface
      expect(await nft.supportsInterface("0x780e9d63")).to.equal(true);
    });
  });
});