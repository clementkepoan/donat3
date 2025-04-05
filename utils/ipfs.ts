import axios from 'axios';

// Using NFT.Storage or Pinata for IPFS storage
// You'll need to sign up for an API key
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';

/**
 * Upload file to IPFS using Pinata
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        pinata_api_key: '50ab28c51dd198ad81f8',
        pinata_secret_api_key: '8a34c8bf0ebd413e942080fd3b59464a45ab9900ef7407039129accdf7daf335',
      },
    });

    // Return IPFS hash/CID
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload image to IPFS');
  }
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: '5c6e45b0cdaa1f8d41a0',
          pinata_secret_api_key: '59c5aacd72f41f7d7e0de78423169597c82f6c337e8137be309046dfedf20195',
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}