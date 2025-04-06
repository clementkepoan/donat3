const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Donat3 Platform", function() {
  
  // Set up the contracts and test accounts
  async function deployContractsFixture() {
    // Get test accounts
    const [owner, beneficiary, donor1, donor2] = await ethers.getSigners();
    
    // Deploy NFT contract
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy("Donat3 Rewards", "DNT3");
    
    // Deploy Donation contract
    const Donation = await ethers.getContractFactory("Donation");
    const donation = await Donation.deploy(await nft.getAddress());
    
    // Set donation contract in NFT contract
    await nft.setDonationContract(await donation.getAddress());
    
    return { nft, donation, owner, beneficiary, donor1, donor2 };
  }
  
  describe("Deployment", function() {
    it("Should set the right owner for both contracts", async function() {
      const { nft, donation, owner } = await loadFixture(deployContractsFixture);
      
      expect(await nft.owner()).to.equal(await owner.getAddress());
      expect(await donation.owner()).to.equal(await owner.getAddress());
    });
    
    it("Should have NFT contract linked in Donation contract", async function() {
      const { nft, donation } = await loadFixture(deployContractsFixture);
      
      expect(await donation.nftContract()).to.equal(await nft.getAddress());
    });
    
    it("Should have Donation contract linked in NFT contract", async function() {
      const { nft, donation } = await loadFixture(deployContractsFixture);
      
      expect(await nft.donationContract()).to.equal(await donation.getAddress());
    });
    
    it("Should have initial milestones set up", async function() {
      const { nft } = await loadFixture(deployContractsFixture);
      
      expect(await nft.getMilestonesCount()).to.equal(3);
      
      // Check the first milestone details
      const milestone0 = await nft.milestones(0);
      expect(milestone0[0]).to.equal(ethers.parseEther("0.1"));
      expect(milestone0[1]).to.equal("ipfs://milestone1URI");
    });
  });
  
  describe("Campaign Management", function() {
    it("Should create a campaign with correct details", async function() {
      const { donation, beneficiary } = await loadFixture(deployContractsFixture);
      
      await donation.createCampaign(
        "Test Campaign", 
        "A test campaign for charity", 
        await beneficiary.getAddress()
      );
      
      const campaignId = 0;
      const campaign = await donation.getCampaign(campaignId);
      
      expect(campaign[0]).to.equal("Test Campaign");
      expect(campaign[1]).to.equal("A test campaign for charity");
      expect(campaign[2]).to.equal(await beneficiary.getAddress());
      expect(campaign[3]).to.equal(0n); // totalRaised (use BigInt notation)
      expect(campaign[4]).to.equal(0); // donorCount
      expect(campaign[5]).to.equal(true); // active
    });
    
    it("Should update campaign status correctly", async function() {
      const { donation, beneficiary, donor1 } = await loadFixture(deployContractsFixture);
      
      await donation.createCampaign(
        "Test Campaign", 
        "A test campaign for charity", 
        await beneficiary.getAddress()
      );
      
      const campaignId = 0;
      
      // Owner can deactivate
      await donation.updateCampaignStatus(campaignId, false);
      expect((await donation.getCampaign(campaignId))[5]).to.equal(false);
      
      // Owner can reactivate
      await donation.updateCampaignStatus(campaignId, true);
      expect((await donation.getCampaign(campaignId))[5]).to.equal(true);
      
      // Beneficiary can also update status
      await donation.connect(beneficiary).updateCampaignStatus(campaignId, false);
      expect((await donation.getCampaign(campaignId))[5]).to.equal(false);
      
      // Random user cannot update
      await expect(
        donation.connect(donor1).updateCampaignStatus(campaignId, true)
      ).to.be.revertedWith("Not authorized to update campaign");
    });
    
    it("Should assign unique ID numbers to each campaign", async function() {
      const { donation, beneficiary } = await loadFixture(deployContractsFixture);
      
      // Create two campaigns
      await donation.createCampaign(
        "First Campaign", 
        "Description 1", 
        await beneficiary.getAddress()
      );
      
      await donation.createCampaign(
        "Second Campaign", 
        "Description 2", 
        await beneficiary.getAddress()
      );
      
      // Check that we have two campaigns with different details
      expect(await donation.getCampaignCount()).to.equal(2);
      
      const campaign1 = await donation.getCampaign(0);
      const campaign2 = await donation.getCampaign(1);
      
      expect(campaign1[0]).to.equal("First Campaign");
      expect(campaign2[0]).to.equal("Second Campaign");
    });
  });
  
  // Helper function to set up campaigns for testing
  async function setupCampaignsFixture() {
    const { nft, donation, owner, beneficiary, donor1, donor2 } = await loadFixture(deployContractsFixture);
    
    // Create a campaign
    await donation.createCampaign(
      "Help Fund My Art Project",
      "I'm creating digital art and need your support!",
      await beneficiary.getAddress()
    );
    
    // Create a second campaign
    await donation.createCampaign(
      "Support My Music Album",
      "Help me release my first indie album",
      await beneficiary.getAddress()
    );
    
    return { nft, donation, owner, beneficiary, donor1, donor2 };
  }
  
  describe("Donations", function() {
    let campaignId;
    
    beforeEach(async function() {
      campaignId = 0;
    });
    
    it("Should send money directly to the campaign beneficiary", async function() {
      const { donation, beneficiary, donor1 } = await loadFixture(setupCampaignsFixture);
      
      const donationAmount = ethers.parseEther("0.1");
      const initialBeneficiaryBalance = await ethers.provider.getBalance(await beneficiary.getAddress());
      
      // Make the donation
      await donation.connect(donor1).donate(campaignId, "Great project!", {
        value: donationAmount
      });
      
      // Check that beneficiary received the funds
      const finalBeneficiaryBalance = await ethers.provider.getBalance(await beneficiary.getAddress());
      expect(finalBeneficiaryBalance - initialBeneficiaryBalance).to.equal(donationAmount);
    });
    
    it("Should process donation correctly", async function() {
      const { nft, donation, donor1 } = await loadFixture(setupCampaignsFixture);
      const donor1Address = await donor1.getAddress();
      
      // Donate to the campaign
      await donation.connect(donor1).donate(campaignId, "Good luck!", {
        value: ethers.parseEther("0.1")
      });
      
      // Check campaign stats
      const campaign = await donation.getCampaign(campaignId);
      expect(campaign[3]).to.equal(ethers.parseEther("0.1")); // totalRaised
      expect(campaign[4]).to.equal(1); // donorCount
      
      // Check platform stats
      expect(await donation.totalDonations()).to.equal(ethers.parseEther("0.1"));
      expect(await donation.totalDonorCount()).to.equal(1);
      
      // Check donor tracking
      expect(await donation.hasDonatedToCampaign(campaignId, donor1Address)).to.equal(true);
      expect(await donation.getUserCampaignDonation(campaignId, donor1Address)).to.equal(ethers.parseEther("0.1"));
      
      // Check NFT contract state
      expect(await nft.campaignUserDonations(campaignId, donor1Address)).to.equal(ethers.parseEther("0.1"));
      expect(await nft.userTotalDonated(donor1Address)).to.equal(ethers.parseEther("0.1"));
      expect(await nft.getCampaignTotalDonations(campaignId)).to.equal(ethers.parseEther("0.1"));
    });
    
    it("Should track multiple donors correctly", async function() {
      const { donation, donor1, donor2 } = await loadFixture(setupCampaignsFixture);
      const donor1Address = await donor1.getAddress();
      const donor2Address = await donor2.getAddress();
      
      // Two donations from different donors
      await donation.connect(donor1).donate(campaignId, "Donation 1", {
        value: ethers.parseEther("0.1")
      });
      await donation.connect(donor2).donate(campaignId, "Donation 2", {
        value: ethers.parseEther("0.2")
      });
      
      // Check campaign stats
      const campaign = await donation.getCampaign(campaignId);
      expect(campaign[3]).to.equal(ethers.parseEther("0.3")); // totalRaised
      expect(campaign[4]).to.equal(2); // donorCount
      
      // Check platform stats
      expect(await donation.totalDonations()).to.equal(ethers.parseEther("0.3"));
      expect(await donation.totalDonorCount()).to.equal(2);
      
      // Check both donors are tracked
      expect(await donation.hasDonatedToCampaign(campaignId, donor1Address)).to.equal(true);
      expect(await donation.hasDonatedToCampaign(campaignId, donor2Address)).to.equal(true);
    });
    
    it("Should track repeated donations correctly", async function() {
      const { donation, donor1 } = await loadFixture(setupCampaignsFixture);
      const donor1Address = await donor1.getAddress();
      
      // Two donations from the same donor
      await donation.connect(donor1).donate(campaignId, "First donation", {
        value: ethers.parseEther("0.1")
      });
      
      await donation.connect(donor1).donate(campaignId, "Second donation", {
        value: ethers.parseEther("0.2")
      });
      
      // Check campaign stats
      const campaign = await donation.getCampaign(campaignId);
      expect(campaign[3]).to.equal(ethers.parseEther("0.3")); // totalRaised
      expect(campaign[4]).to.equal(1); // donorCount - should still be 1
      
      // Check donor's total
      expect(await donation.getUserCampaignDonation(campaignId, donor1Address)).to.equal(ethers.parseEther("0.3"));
    });
    
    it("Should let users donate to different campaigns separately", async function() {
      const { donation, donor1 } = await loadFixture(setupCampaignsFixture);
      
      // Donate to first campaign
      await donation.connect(donor1).donate(0, "For the art project", {
        value: ethers.parseEther("0.2")
      });
      
      // Donate to second campaign
      await donation.connect(donor1).donate(1, "For the music album", {
        value: ethers.parseEther("0.3")
      });
      
      // Check campaign totals are tracked separately
      const campaign1 = await donation.getCampaign(0);
      const campaign2 = await donation.getCampaign(1);
      
      expect(campaign1[3]).to.equal(ethers.parseEther("0.2"));
      expect(campaign2[3]).to.equal(ethers.parseEther("0.3"));
    });
    
    it("Should not allow donations to inactive campaigns", async function() {
      const { donation, donor1 } = await loadFixture(setupCampaignsFixture);
      
      // Deactivate the campaign
      await donation.updateCampaignStatus(campaignId, false);
      
      // Try to donate
      await expect(
        donation.connect(donor1).donate(campaignId, "Should fail", {
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Campaign is not active");
    });
    
    it("Should track total platform donations correctly", async function() {
      const { donation, donor1, donor2 } = await loadFixture(setupCampaignsFixture);
      
      // Initially zero
      expect(await donation.totalDonations()).to.equal(0n);
      
      // Make multiple donations
      await donation.connect(donor1).donate(0, "Donation to first", {
        value: ethers.parseEther("0.1")
      });
      
      await donation.connect(donor2).donate(1, "Donation to second", {
        value: ethers.parseEther("0.2")
      });
      
      // Check platform total
      expect(await donation.totalDonations()).to.equal(ethers.parseEther("0.3"));
    });
  });
  
  describe("NFT Milestone Rewards", function() {
    it("Should allow claiming campaign milestone NFT", async function() {
      const { nft, donation, donor1 } = await loadFixture(setupCampaignsFixture);
      const donor1Address = await donor1.getAddress();
      
      // Donate enough to reach first milestone
      await donation.connect(donor1).donate(0, "Reaching milestone", {
        value: ethers.parseEther("0.1")
      });
      
      // Claim the NFT
      await nft.connect(donor1).claimCampaignMilestoneNFT(0, 0);
      
      // Should be marked as claimed
      expect(await nft.hasClaimedCampaignMilestone(0, donor1Address, 0)).to.equal(true);
      
      // Check balance increased
      expect(await nft.balanceOf(donor1Address)).to.equal(1);
      
      // Check token URI
      const tokenId = 0; // First token
      expect(await nft.tokenURI(tokenId)).to.equal("ipfs://milestone1URI");
    });
    
    it("Should allow claiming global milestone NFT", async function() {
      const { nft, donation, donor1 } = await loadFixture(setupCampaignsFixture);
      const donor1Address = await donor1.getAddress();
      
      // Donate to reach first milestone
      await donation.connect(donor1).donate(0, "Reaching milestone", {
        value: ethers.parseEther("0.1")
      });
      
      // Claim the global milestone NFT
      await nft.connect(donor1).claimMilestoneNFT(0);
      
      // Should be marked as claimed
      expect(await nft.hasClaimedMilestone(donor1Address, 0)).to.equal(true);
      
      // Check NFT ownership
      expect(await nft.balanceOf(donor1Address)).to.equal(1);
    });
    
    it("Should not allow claiming milestone twice", async function() {
      const { nft, donation, donor1 } = await loadFixture(setupCampaignsFixture);
      
      // Donate and claim first milestone
      await donation.connect(donor1).donate(0, "Donation", {
        value: ethers.parseEther("0.1")
      });
      
      await nft.connect(donor1).claimCampaignMilestoneNFT(0, 0);
      
      // Try to claim again
      await expect(
        nft.connect(donor1).claimCampaignMilestoneNFT(0, 0)
      ).to.be.revertedWith("Milestone already claimed for this campaign");
    });
    
    it("Should not allow claiming milestone if threshold not met", async function() {
      const { nft, donation, donor1 } = await loadFixture(setupCampaignsFixture);
      
      // Donate less than required for milestone 1
      await donation.connect(donor1).donate(0, "Small donation", {
        value: ethers.parseEther("0.05")
      });
      
      // Try to claim milestone 0
      await expect(
        nft.connect(donor1).claimCampaignMilestoneNFT(0, 0)
      ).to.be.revertedWith("Donation threshold not met for this campaign");
    });
    
    it("Should allow claiming across milestone thresholds", async function() {
      const { nft, donation, donor1 } = await loadFixture(setupCampaignsFixture);
      const donor1Address = await donor1.getAddress();
      
      // Donate enough to reach third milestone
      await donation.connect(donor1).donate(0, "Large donation", {
        value: ethers.parseEther("1.0")
      });
      
      // Should be able to claim all three milestone levels
      await nft.connect(donor1).claimCampaignMilestoneNFT(0, 0); // 0.1 ETH
      await nft.connect(donor1).claimCampaignMilestoneNFT(0, 1); // 0.5 ETH
      await nft.connect(donor1).claimCampaignMilestoneNFT(0, 2); // 1.0 ETH
      
      // Check NFT balance
      expect(await nft.balanceOf(donor1Address)).to.equal(3);
    });
    
    it("Should combine donations across campaigns for global milestones", async function() {
      const { nft, donation, donor1 } = await loadFixture(setupCampaignsFixture);
      
      // Donate to first campaign
      await donation.connect(donor1).donate(0, "First donation", {
        value: ethers.parseEther("0.05")
      });
      
      // Not enough for first milestone yet
      await expect(
        nft.connect(donor1).claimMilestoneNFT(0)
      ).to.be.revertedWith("Donation threshold not met");
      
      // Donate to second campaign
      await donation.connect(donor1).donate(1, "Second donation", {
        value: ethers.parseEther("0.05")
      });
      
      // Total should now be 0.1 ETH - enough for first milestone
      await nft.connect(donor1).claimMilestoneNFT(0);
      
      // Check that the NFT was received
      expect(await nft.balanceOf(await donor1.getAddress())).to.equal(1);
    });
    
    it("Should track campaign-specific milestones separately from global ones", async function() {
      const { nft, donation, donor1 } = await loadFixture(setupCampaignsFixture);
      const donor1Address = await donor1.getAddress();
      
      // Make donations to different campaigns
      await donation.connect(donor1).donate(0, "Donation to campaign 0", {
        value: ethers.parseEther("0.1")
      });
      
      await donation.connect(donor1).donate(1, "Donation to campaign 1", {
        value: ethers.parseEther("0.05")
      });
      
      // Can claim campaign-specific milestone for campaign 0
      await nft.connect(donor1).claimCampaignMilestoneNFT(0, 0);
      expect(await nft.hasClaimedCampaignMilestone(0, donor1Address, 0)).to.be.true;
      
      // Cannot claim for campaign 1 (not enough)
      await expect(
        nft.connect(donor1).claimCampaignMilestoneNFT(1, 0)
      ).to.be.revertedWith("Donation threshold not met for this campaign");
      
      // Can claim global milestone (total is 0.15 ETH)
      await nft.connect(donor1).claimMilestoneNFT(0);
      expect(await nft.hasClaimedMilestone(donor1Address, 0)).to.be.true;
      
      // User should have 2 NFTs (1 campaign-specific + 1 global)
      expect(await nft.balanceOf(donor1Address)).to.equal(2);
    });
  });
  
  describe("Admin Functions", function() {
    it("Should allow owner to add milestone", async function() {
      const { nft } = await loadFixture(deployContractsFixture);
      
      const initialCount = await nft.getMilestonesCount();
      
      await nft.addMilestone(ethers.parseEther("2.0"), "ipfs://newMilestoneURI");
      
      const newCount = await nft.getMilestonesCount();
      expect(newCount).to.equal(initialCount + 1n);
      
      const milestone = await nft.milestones(initialCount);
      expect(milestone[0]).to.equal(ethers.parseEther("2.0"));
      expect(milestone[1]).to.equal("ipfs://newMilestoneURI");
    });
    
    it("Should allow owner to update milestone", async function() {
      const { nft } = await loadFixture(deployContractsFixture);
      
      await nft.updateMilestone(0, ethers.parseEther("0.2"), "ipfs://updatedURI");
      
      const milestone = await nft.milestones(0);
      expect(milestone[0]).to.equal(ethers.parseEther("0.2"));
      expect(milestone[1]).to.equal("ipfs://updatedURI");
    });
    
    it("Should allow owner to mint custom NFT", async function() {
      const { nft, donor1 } = await loadFixture(deployContractsFixture);
      const donor1Address = await donor1.getAddress();
      
      await nft.mintNFT(donor1Address, "ipfs://customNFT");
      
      expect(await nft.balanceOf(donor1Address)).to.equal(1);
      expect(await nft.tokenURI(0)).to.equal("ipfs://customNFT");
    });
    
    it("Should allow owner to transfer ownership", async function() {
      const { donation, donor1 } = await loadFixture(deployContractsFixture);
      
      await donation.transferOwnership(await donor1.getAddress());
      expect(await donation.owner()).to.equal(await donor1.getAddress());
    });
    
    it("Should not allow non-owner to call admin functions", async function() {
      const { nft, donation, donor1, donor2 } = await loadFixture(deployContractsFixture);
      
      await expect(
        nft.connect(donor1).addMilestone(ethers.parseEther("2.0"), "ipfs://newMilestoneURI")
      ).to.be.reverted;
      
      await expect(
        nft.connect(donor1).updateMilestone(0, ethers.parseEther("0.2"), "ipfs://updatedURI")
      ).to.be.reverted;
      
      await expect(
        nft.connect(donor1).mintNFT(await donor2.getAddress(), "ipfs://customNFT")
      ).to.be.reverted;
      
      await expect(
        donation.connect(donor1).transferOwnership(await donor2.getAddress())
      ).to.be.revertedWith("Only owner can call this function");
    });
  });
  
  describe("Integration", function() {
    it("Should complete a full donor journey across multiple campaigns", async function() {
      const { nft, donation, beneficiary, donor1, donor2 } = await loadFixture(deployContractsFixture);
      const donor1Address = await donor1.getAddress();
      const donor2Address = await donor2.getAddress();
      const beneficiaryAddress = await beneficiary.getAddress();
      
      // Create two campaigns
      await donation.createCampaign("Art Project", "Support art", beneficiaryAddress);
      await donation.createCampaign("Music Project", "Support music", beneficiaryAddress);
      
      // Donor 1 makes donations to both campaigns
      await donation.connect(donor1).donate(0, "Supporting art", {
        value: ethers.parseEther("0.4")
      });
      
      await donation.connect(donor1).donate(1, "Supporting music", {
        value: ethers.parseEther("0.2")
      });
      
      // Donor 2 supports just one campaign
      await donation.connect(donor2).donate(0, "Just for art", {
        value: ethers.parseEther("0.5")
      });
      
      // Check campaign totals
      expect((await donation.getCampaign(0))[3]).to.equal(ethers.parseEther("0.9"));
      expect((await donation.getCampaign(1))[3]).to.equal(ethers.parseEther("0.2"));
      
      // Donor 1 claims both campaign-specific and global milestones
      await nft.connect(donor1).claimCampaignMilestoneNFT(0, 0); // 0.1 ETH milestone for campaign 0
      await nft.connect(donor1).claimCampaignMilestoneNFT(1, 0); // 0.1 ETH milestone for campaign 1
      
      await nft.connect(donor1).claimMilestoneNFT(0); // 0.1 ETH global milestone
      await nft.connect(donor1).claimMilestoneNFT(1); // 0.5 ETH global milestone
      
      // Donor 2 claims milestones
      await nft.connect(donor2).claimCampaignMilestoneNFT(0, 0); // 0.1 ETH milestone for campaign 0
      await nft.connect(donor2).claimCampaignMilestoneNFT(0, 1); // 0.5 ETH milestone for campaign 0
      
      await nft.connect(donor2).claimMilestoneNFT(0); // 0.1 ETH global milestone
      await nft.connect(donor2).claimMilestoneNFT(1); // 0.5 ETH global milestone
      
      // Check final NFT balances
      expect(await nft.balanceOf(donor1Address)).to.equal(4);
      expect(await nft.balanceOf(donor2Address)).to.equal(4);
      
      // Platform stats should be accurate
      expect(await donation.totalDonations()).to.equal(ethers.parseEther("1.1"));
      expect(await donation.totalDonorCount()).to.equal(2);
    });
    
    it("Should handle donation transfers reliably", async function() {
      const { donation, beneficiary, donor1 } = await loadFixture(deployContractsFixture);
      const beneficiaryAddress = await beneficiary.getAddress();
      
      // Create a campaign
      await donation.createCampaign("Test Campaign", "Test description", beneficiaryAddress);
      
      // Get initial balances
      const initialBeneficiaryBalance = await ethers.provider.getBalance(beneficiaryAddress);
      
      // Make a donation
      const donationAmount = ethers.parseEther("0.5");
      await donation.connect(donor1).donate(0, "Test donation", {
        value: donationAmount
      });
      
      // Check final balances
      const finalBeneficiaryBalance = await ethers.provider.getBalance(beneficiaryAddress);
      
      // Beneficiary should have received exactly the donation amount
      expect(finalBeneficiaryBalance - initialBeneficiaryBalance).to.equal(donationAmount);
      
      // Campaign stats should reflect the donation
      const campaign = await donation.getCampaign(0);
      expect(campaign[3]).to.equal(donationAmount);
    });
  });
});