// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./NFT.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Donation
 * @dev A contract to manage charitable donation campaigns with NFT rewards
 */
contract Donation is ReentrancyGuard {
    // ===============
    // State variables
    // ===============
    
    // Reference to the NFT contract
    NFT public nftContract;
    
    // Owner of the donation contract (platform admin)
    address public owner;
    
    // Campaign ID counter
    uint256 private _campaignIdCounter;
    
    // Overall platform stats
    uint256 public totalDonations;
    uint256 public totalDonorCount;
    
    // ===============
    // Data structures
    // ===============
    
    // Campaign/Event structure
    struct Campaign {
        string name;
        string description;
        address payable beneficiary;
        uint256 totalRaised;
        uint256 donorCount;
        bool active;
        uint256 createdAt;
    }
    
    // ===============
    // Mappings
    // ===============
    
    // Mapping from campaign ID to Campaign
    mapping(uint256 => Campaign) public campaigns;
    
    // Mapping from campaign ID to donor address to whether they've donated
    mapping(uint256 => mapping(address => bool)) private campaignDonors;
    
    // Mapping from campaign ID to donor address to total amount donated
    mapping(uint256 => mapping(address => uint256)) public campaignDonationTotals;
    
    // Track unique donors at platform level
    mapping(address => bool) private platformDonors;
    
    // ===============
    // Events
    // ===============
    
    event CampaignCreated(uint256 indexed campaignId, string name, address beneficiary);
    event CampaignUpdated(uint256 indexed campaignId, string name, bool active);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount, string message);
    
    // ===============
    // Modifiers
    // ===============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // ===============
    // Constructor
    // ===============
    
    constructor(address _nftContractAddress) {
        nftContract = NFT(_nftContractAddress);
        owner = msg.sender;
    }
    
    // ===============
    // Campaign management
    // ===============
    
    /**
     * @dev Create a new donation campaign
     * @param name Campaign name
     * @param description Campaign description
     * @param beneficiary Address that will receive the donations
     * @return Campaign ID
     */
    function createCampaign(
        string memory name,
        string memory description,
        address payable beneficiary
    ) external returns (uint256) {
        require(beneficiary != address(0), "Invalid beneficiary address");
        
        uint256 campaignId = _campaignIdCounter;
        _campaignIdCounter++;
        
        campaigns[campaignId] = Campaign({
            name: name,
            description: description,
            beneficiary: beneficiary,
            totalRaised: 0,
            donorCount: 0,
            active: true,
            createdAt: block.timestamp
        });
        
        emit CampaignCreated(campaignId, name, beneficiary);
        return campaignId;
    }
    
    /**
     * @dev Update campaign status (active/inactive)
     * @param campaignId ID of the campaign to update
     * @param active New active status
     */
    function updateCampaignStatus(uint256 campaignId, bool active) external {
        Campaign storage campaign = campaigns[campaignId];
        
        // Only owner or campaign beneficiary can update status
        require(
            msg.sender == owner || msg.sender == campaign.beneficiary,
            "Not authorized to update campaign"
        );
        
        campaign.active = active;
        
        emit CampaignUpdated(campaignId, campaign.name, active);
    }
    
    // ===============
    // Donation functions
    // ===============
    
    /**
     * @dev Allow users to donate ETH to a specific campaign with an optional message
     * @param campaignId ID of the campaign to donate to
     * @param message Optional message from the donor
     */
    function donate(uint256 campaignId, string memory message) external payable nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.active, "Campaign is not active");
        
        // Update all state variables before external calls
        
        // Record donation in NFT contract
        nftContract.recordDonation(msg.sender, campaignId, msg.value);
        
        // Track unique donors for this campaign
        if (!campaignDonors[campaignId][msg.sender]) {
            campaignDonors[campaignId][msg.sender] = true;
            campaign.donorCount++;
        }
        
        // Update campaign donor total
        campaignDonationTotals[campaignId][msg.sender] += msg.value;
        
        // Update campaign stats
        campaign.totalRaised += msg.value;
        
        // Update platform-wide stats
        if (!platformDonors[msg.sender]) {
            platformDonors[msg.sender] = true;
            totalDonorCount++;
        }
        totalDonations += msg.value;
        
        // Emit event before external call
        emit DonationReceived(campaignId, msg.sender, msg.value, message);
        
        // Transfer the donation to the campaign beneficiary (external call last)
        (bool success, ) = campaign.beneficiary.call{value: msg.value}("");
        require(success, "Transfer to beneficiary failed");
    }
    
    // ===============
    // View functions
    // ===============
    
    /**
     * @dev Get comprehensive details for a specific campaign
     * @param campaignId ID of the campaign
     * @return name Campaign name
     * @return description Campaign description
     * @return beneficiary Address that receives donations
     * @return totalRaised Total amount raised so far
     * @return donorCount Number of unique donors
     * @return active Whether the campaign is currently active
     * @return createdAt Timestamp when the campaign was created
     */
    function getCampaign(uint256 campaignId) external view 
    returns (
        string memory name,
        string memory description,
        address beneficiary,
        uint256 totalRaised,
        uint256 donorCount,
        bool active,
        uint256 createdAt
    ) {
        Campaign storage campaign = campaigns[campaignId];
        
        return (
            campaign.name,
            campaign.description,
            campaign.beneficiary,
            campaign.totalRaised,
            campaign.donorCount,
            campaign.active,
            campaign.createdAt
        );
    }
    
    /**
     * @dev Get total number of campaigns created
     * @return Total campaign count
     */
    function getCampaignCount() external view returns (uint256) {
        return _campaignIdCounter;
    }
    
    /**
     * @dev Check if an address has donated to a specific campaign
     * @param campaignId ID of the campaign
     * @param donor Address to check
     * @return True if the address has donated to the campaign
     */
    function hasDonatedToCampaign(uint256 campaignId, address donor) external view returns (bool) {
        return campaignDonors[campaignId][donor];
    }
    
    /**
     * @dev Get user's total donation amount to a specific campaign
     * @param campaignId ID of the campaign
     * @param user Address of the user
     * @return Total amount donated by the user to the campaign
     */
    function getUserCampaignDonation(uint256 campaignId, address user) external view returns (uint256) {
        return campaignDonationTotals[campaignId][user];
    }
    
    /**
     * @dev Check if an address has donated to any campaign on the platform
     * @param donor Address to check
     * @return True if the address has made at least one donation
     */
    function hasDonated(address donor) external view returns (bool) {
        return platformDonors[donor];
    }
    
    // ===============
    // Admin functions
    // ===============
    
    /**
     * @dev Transfer ownership of the donation platform
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }
}