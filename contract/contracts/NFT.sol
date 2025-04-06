// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFT
 * @dev A contract for minting reward NFTs for donors to campaigns
 */
contract NFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    // ===============
    // State variables
    // ===============
    
    // Token counter for generating unique token IDs
    Counters.Counter private _tokenIdCounter;
    
    // Address of the donation contract that can call certain functions
    address public donationContract;
    
    // ===============
    // Data structures
    // ===============
    
    // Define milestones (in wei) and their corresponding token URIs
    struct Milestone {
        uint256 amount;
        string tokenURI;
    }
    
    // List of donation milestones
    Milestone[] public milestones;
    
    // ===============
    // Mappings
    // ===============
    
    // Track user donations per campaign
    mapping(uint256 => mapping(address => uint256)) public campaignUserDonations;
    
    // Track total donations across all campaigns
    mapping(address => uint256) public userTotalDonated;
    
    // Track total donations per campaign across all users
    mapping(uint256 => uint256) public campaignTotalDonations;
    
    // Track which milestone NFTs a user has claimed per campaign
    mapping(uint256 => mapping(address => mapping(uint256 => bool))) public campaignUserClaimedMilestones;
    
    // Track which global milestone NFTs a user has claimed
    mapping(address => mapping(uint256 => bool)) public userClaimedMilestones;
    
    // ===============
    // Events
    // ===============
    
    event MilestoneClaimed(address user, uint256 campaignId, uint256 milestoneIndex, uint256 tokenId);
    event DonationRecorded(address donor, uint256 campaignId, uint256 amount, uint256 newCampaignTotal, uint256 newGlobalTotal);
    
    // ===============
    // Modifiers
    // ===============
    
    modifier onlyDonationContract() {
        require(msg.sender == donationContract, "Only donation contract can call");
        _;
    }
    
    // ===============
    // Constructor
    // ===============
    
    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {
        // Initialize with default milestones (can be updated by owner)
        milestones.push(Milestone(0.1 ether, "ipfs://milestone1URI"));
        milestones.push(Milestone(0.5 ether, "ipfs://milestone2URI"));
        milestones.push(Milestone(1 ether, "ipfs://milestone3URI"));
    }
    
    // ===============
    // Admin functions
    // ===============
    
    /**
     * @dev Sets the donation contract address that's authorized to call restricted functions
     * @param _donationContract Address of the donation contract
     */
    function setDonationContract(address _donationContract) external onlyOwner {
        donationContract = _donationContract;
    }
    
    /**
     * @dev Updates an existing milestone
     * @param index Index of the milestone to update
     * @param amount New donation amount threshold
     * @param tokenURI New token URI for the milestone
     */
    function updateMilestone(uint256 index, uint256 amount, string memory tokenURI) external onlyOwner {
        require(index < milestones.length, "Invalid milestone index");
        milestones[index] = Milestone(amount, tokenURI);
    }
    
    /**
     * @dev Adds a new milestone
     * @param amount Donation amount threshold
     * @param tokenURI Token URI for the milestone
     */
    function addMilestone(uint256 amount, string memory tokenURI) external onlyOwner {
        milestones.push(Milestone(amount, tokenURI));
    }
    
    /**
     * @dev Mints a custom NFT to a specific address
     * @param to Address to mint the NFT to
     * @param tokenURI Token URI for the NFT
     * @return tokenId ID of the minted token
     */
    function mintNFT(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }
    
    // ===============
    // Donation tracking
    // ===============
    
    /**
     * @dev Records a donation (can only be called by donation contract)
     * @param donor Address of the donor
     * @param campaignId ID of the campaign
     * @param amount Amount donated in wei
     */
    function recordDonation(address donor, uint256 campaignId, uint256 amount) external onlyDonationContract {
        // Update campaign-specific donation total
        campaignUserDonations[campaignId][donor] += amount;
        
        // Also update global donation total
        userTotalDonated[donor] += amount;
        
        // Update campaign total donations
        campaignTotalDonations[campaignId] += amount;
        
        emit DonationRecorded(
            donor, 
            campaignId, 
            amount, 
            campaignUserDonations[campaignId][donor],
            userTotalDonated[donor]
        );
    }
    
    // ===============
    // NFT claiming functions
    // ===============
    
    /**
     * @dev Claims an NFT for reaching a campaign-specific milestone
     * @param campaignId ID of the campaign
     * @param milestoneIndex Index of the milestone
     * @return tokenId ID of the minted token
     */
    function claimCampaignMilestoneNFT(uint256 campaignId, uint256 milestoneIndex) external returns (uint256) {
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(!campaignUserClaimedMilestones[campaignId][msg.sender][milestoneIndex], "Milestone already claimed for this campaign");
        require(campaignUserDonations[campaignId][msg.sender] >= milestones[milestoneIndex].amount, 
                "Donation threshold not met for this campaign");
        
        campaignUserClaimedMilestones[campaignId][msg.sender][milestoneIndex] = true;
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, milestones[milestoneIndex].tokenURI);
        
        emit MilestoneClaimed(msg.sender, campaignId, milestoneIndex, tokenId);
        return tokenId;
    }
    
    /**
     * @dev Claims an NFT for reaching a global donation milestone
     * @param milestoneIndex Index of the milestone
     * @return tokenId ID of the minted token
     */
    function claimMilestoneNFT(uint256 milestoneIndex) external returns (uint256) {
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(!userClaimedMilestones[msg.sender][milestoneIndex], "Milestone already claimed");
        require(userTotalDonated[msg.sender] >= milestones[milestoneIndex].amount, "Donation threshold not met");
        
        userClaimedMilestones[msg.sender][milestoneIndex] = true;
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, milestones[milestoneIndex].tokenURI);
        
        emit MilestoneClaimed(msg.sender, 0, milestoneIndex, tokenId);
        return tokenId;
    }
    
    // ===============
    // View functions
    // ===============
    
    /**
     * @dev Gets the total amount donated by a user to a specific campaign
     * @param campaignId ID of the campaign
     * @param user Address of the user
     * @return Total amount donated in wei
     */
    function getUserCampaignDonationTotal(uint256 campaignId, address user) external view returns (uint256) {
        return campaignUserDonations[campaignId][user];
    }
    
    /**
     * @dev Gets the total amount donated by a user across all campaigns
     * @param user Address of the user
     * @return Total amount donated in wei
     */
    function getUserDonationTotal(address user) external view returns (uint256) {
        return userTotalDonated[user];
    }
    
    /**
     * @dev Gets the total amount donated to a specific campaign by all users
     * @param campaignId ID of the campaign
     * @return Total amount donated in wei
     */
    function getCampaignTotalDonations(uint256 campaignId) external view returns (uint256) {
        return campaignTotalDonations[campaignId];
    }
    
    /**
     * @dev Checks if a user has claimed a milestone NFT for a specific campaign
     * @param campaignId ID of the campaign
     * @param user Address of the user
     * @param milestoneIndex Index of the milestone
     * @return True if claimed, false otherwise
     */
    function hasClaimedCampaignMilestone(uint256 campaignId, address user, uint256 milestoneIndex) external view returns (bool) {
        return campaignUserClaimedMilestones[campaignId][user][milestoneIndex];
    }
    
    /**
     * @dev Checks if a user has claimed a global milestone NFT
     * @param user Address of the user
     * @param milestoneIndex Index of the milestone
     * @return True if claimed, false otherwise
     */
    function hasClaimedMilestone(address user, uint256 milestoneIndex) external view returns (bool) {
        return userClaimedMilestones[user][milestoneIndex];
    }
    
    /**
     * @dev Gets the total number of milestones
     * @return Number of milestones
     */
    function getMilestonesCount() external view returns (uint256) {
        return milestones.length;
    }
}