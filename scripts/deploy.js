// Simple JS script - no TypeScript, no imports with ES modules

const hre = require("hardhat");

async function main() {
  // Print basic info
  console.log("Starting minimal JS deployment script...");
  console.log("Node version:", process.version);
  console.log("Current directory:", process.cwd());
  
  try {
    // Get ethers from Hardhat Runtime Environment
    const { ethers } = hre;
    console.log("Got ethers from Hardhat");
    
    // Check network connection
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to network: chainId=${network.chainId}, name=${network.name}`);
    console.log(`Current block number: ${blockNumber}`);
    
    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer address: ${deployer.address}`);
    
    // Format balance based on ethers version
    const balance = await provider.getBalance(deployer.address);
    let formattedBalance;
    
    // Check if we're using ethers v5 or v6
    if (ethers.utils && ethers.utils.formatEther) {
      // Ethers v5
      formattedBalance = ethers.utils.formatEther(balance);
    } else {
      // Ethers v6
      formattedBalance = ethers.formatEther(balance);
    }
    
    console.log(`Deployer balance: ${formattedBalance} ETH`);
    
    // Get contract factory
    console.log("Creating NFT contract factory...");
    const NFT = await ethers.getContractFactory("NFT");
    console.log("Factory created successfully");
    
    // Deploy the contract
    console.log("Deploying NFT contract...");
    const nft = await NFT.deploy();
    console.log("Deployment transaction sent, waiting for confirmation...");
    
    // Use either deployed() or waitForDeployment() based on ethers version
    if (typeof nft.deployed === 'function') {
      // For ethers v5
      await nft.deployed();
      console.log(`Contract deployed to address: ${nft.address}`);
    } else {
      // For ethers v6
      await nft.waitForDeployment();
      const address = await nft.getAddress();
      console.log(`Contract deployed to address: ${address}`);
    }
    
    console.log("Deployment successful!");
    
  } catch (error) {
    console.error("Deployment failed with error:");
    console.error(error.message);
    
    // Additional error details
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.reason) {
      console.error(`Error reason: ${error.reason}`);
    }
    if (error.stack) {
      console.error("Stack trace:");
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run the deployment
main()
  .then(() => {
    console.log("Script execution complete");
    process.exit(0);
  })
  .catch(error => {
    console.error("Unhandled exception in main function:");
    console.error(error);
    process.exit(1);
  });