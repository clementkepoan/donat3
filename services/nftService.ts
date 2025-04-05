import { ethers } from 'ethers';

// Updated ABI to include the publicMint function
const NFT_ABI = [
  // Core functions needed for minting
  "function publicMint(address to) public payable returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];

// Contract address - use environment variable or hardcode for now
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

/**
 * Mint an NFT to the recipient address
 */
export async function mintNFT(
  metadataURI: string, 
  recipientAddress: string
): Promise<string> {
  if (!window.ethereum) {
    throw new Error('No Ethereum wallet detected. Please install MetaMask.');
  }

  try {
    // Connect to the user's wallet
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Default recipient to connected wallet if not specified
    const recipient = recipientAddress || await signer.getAddress();
    
    // Validate and get checksummed address
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }
    const checksummedRecipient = ethers.getAddress(recipient);
    
    // Connect to the NFT contract
    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      signer
    );
    
    console.log(`Minting NFT to ${checksummedRecipient}`);
    
    // Use the publicMint function from the updated contract
    const tx = await nftContract.publicMint(
      checksummedRecipient,
      { 
        gasLimit: 100000 // Set explicit gas limit to avoid estimation issues
      }
    );
    
    console.log(`Mint transaction sent: ${tx.hash}`);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait(1);
    console.log(`Mint transaction confirmed in block ${receipt?.blockNumber}`);
    
    return tx.hash;
  } catch (error: any) {
    console.error('Error in mintNFT:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction was rejected in your wallet');
    }
    
    if (error.message && error.message.includes('insufficient funds')) {
      throw new Error('Insufficient funds for gas fees');
    }
    
    if (error.message && error.message.includes('execution reverted')) {
      throw new Error('Minting failed: ' + (error.reason || 'Contract execution reverted'));
    }
    
    throw error;
  }
}

/**
 * Check if wallet is connected and return the address
 */
export async function checkWalletConnection(): Promise<string | null> {
  if (!window.ethereum) {
    return null;
  }
  
  try {
    // Request accounts from the wallet
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
    if (accounts && accounts.length > 0) {
      return ethers.getAddress(accounts[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return null;
  }
}

