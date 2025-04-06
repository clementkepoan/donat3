# Donat3 - Innovating Fundraising with Blockchain and NFTs

**Donat3** is a revolutionary fundraising platform that leverages **live engagement** with **NFT-based transactions** on the **Matic (Polygon) blockchain**. It addresses common issues in traditional fundraising, including transparency, donor interaction, and complicated payment systems. By utilizing blockchain technology, Donat3 creates a more transparent, secure, and interactive fundraising experience.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [System Architecture](#system-architecture)
- [Technologies Used](#technologies-used)
- [Installation Guide](#installation-guide)
- [Contribution](#contribution)
- [License](#license)
- [Contact](#contact)

## Overview

Fundraising platforms often face challenges like lack of transparency, limited donor interaction, and difficult-to-trace transactions. **Donat3** solves these problems by offering:

- **Blockchain-powered transactions** using NFTs for transparent donations.
- **Real-time donor interaction** through live streaming and campaign updates.
- **Easy access** to blockchain technology via **MetaMask** integration.

With **Polygon (Matic)** for fast and low-cost transactions and **CurveGrid** for enterprise-grade blockchain solutions, Donat3 ensures a seamless and efficient experience for all users. Additionally, **Multibaas** is integrated for even more powerful enterprise blockchain capabilities, enabling efficient cross-chain interactions and streamlining decentralized application development.

### Problem Solved:
- **Transparency**: Traditional fundraising platforms often lack clear tracking. Donat3’s use of blockchain ensures that all donations are traceable and secure.
- **Donor Engagement**: Donat3 promotes real-time interaction between donors and fundraisers via live streaming, fostering stronger connections.
- **Complex Transactions**: Traditional platforms often have confusing processes. Donat3 simplifies donations through blockchain-based transactions and minting NFTs.

## Key Features

### Blockchain-Powered Donations
- **NFT Transactions & Minting**: Donat3 allows donations to be **minted as NFTs** on the **Polygon blockchain**, ensuring security, transparency, and easy traceability.
- **NFT Minting Process**: After a donor makes a contribution, an NFT is minted as proof of donation, which can be viewed and stored in their wallet.
- **Tamper-Proof Records**: The **Polygon (Matic)** blockchain guarantees the integrity of transactions, making donations fully verifiable and secure.

### Donor Engagement
- **Live Event Integration**: Fundraisers can host live events and interact with donors in real-time through live streaming.
- **Real-Time Updates**: Donors can see how their contributions are being utilized through live updates, building trust and fostering deeper engagement.

### Easy Access for All
- **MetaMask Integration**: Donat3 integrates with **MetaMask** to facilitate easy and secure interaction with the blockchain. Donors and fundraisers can use their wallets to make transactions seamlessly.
- **YouTube Integration**: The platform supports live streaming via YouTube, making it easy for fundraisers to engage with their audience.

### Enterprise-Grade Blockchain Solutions
- **CurveGrid Integration**: Donat3 utilizes **CurveGrid**, which provides advanced blockchain integration and cross-chain interoperability, offering secure, scalable, and flexible solutions for enterprise needs.
- **Multibaas Integration**: **Multibaas** offers decentralized, enterprise-grade blockchain solutions that enhance Donat3's capabilities. It provides support for multiple blockchain platforms and enhances smart contract functionality for greater flexibility, scalability, and cross-chain interaction.

## How It Works

1. **Host a Live Fundraising Event**: Fundraisers create and stream live events where donors can interact with them in real time.
2. **Make Blockchain Transactions & Mint NFTs**: Donations are made using **MetaMask**, and each donation is recorded as an **NFT** on the **Polygon blockchain**.
3. **Real-Time Donor Engagement**: Donors can participate in live events, ask questions, and see the impact of their contributions.
4. **Track Donations & NFTs**: Both fundraisers and donors can track the status of the donations in real-time, ensuring full transparency. Donors can also store and display their NFT as proof of contribution.

### Technical Flow:
1. The fundraiser sets up a live event and streams it via YouTube.
2. Donors use **MetaMask** to make donations, and each donation is recorded as an NFT on the **Polygon and Flow blockchain**.
3. NFTs are minted automatically and stored in the donor's wallet, making the donation process both transparent and secure.
4. Donations are securely stored in the **MongoDB** database, and updates are available to both fundraisers and donors in real-time.

## System Architecture

Donat3’s architecture ensures scalability, security, and efficient blockchain integration. It consists of the following key components:

- **Frontend**: Developed with **Next.js**, providing a dynamic and responsive user interface for easy navigation.
- **Backend**: **Node.js** handles the server-side logic, API routes, and interaction with the blockchain and database.
- **Smart Contracts**: Written in **Solidity** and deployed on the **Polygon (Matic) and Flow (FLO))** network, managing NFT-based transactions and minting.
- **Database**: **MongoDB** is used for storing user data, event information, and donation records.
- **Blockchain Solutions**: The platform uses **CurveGrid** for enhanced blockchain management and cross-chain interoperability.
- **Blockchain Enterprise Integration**: **Multibaas** enables enterprise-level solutions for managing smart contracts and decentralized applications, ensuring scalability and flexibility.
- **Live Streaming**: The platform integrates **YouTube API** for live event broadcasting.

## Technologies Used

- **Frontend**: **Next.js** for building the user interface with server-side rendering and static site generation.
- **Backend**: **Node.js** for handling backend logic and interacting with the blockchain and database.
- **Smart Contracts**: 
  - **Solidity** for creating NFT-based smart contracts deployed on the **Polygon (Matic)** blockchain and **Flow** blockchain for efficient, high-performance transactions.
- **Blockchain**:
  - **Polygon (Matic)** for secure, low-cost, and scalable transactions.
  - **Flow** for fast, developer-friendly, and scalable blockchain solutions, ideal for managing the NFT-based features of Donat3.
- **NFT Minting**: Integration of **NFT Minting** capabilities on the Polygon network for transparent proof of donations.
- **Database**: **MongoDB** for flexible data storage, including user information and donation records.
- **Blockchain Integration**: **CurveGrid** for enterprise-level blockchain integration and cross-chain functionality.
- **Enterprise Blockchain Solutions**: **Multibaas** for cross-chain decentralized application development and enhanced blockchain infrastructure.
- **Wallet**: **MetaMask** for user authentication and seamless blockchain transactions.
- **Real-Time Streaming**: **YouTube API** for live streaming, enabling interaction between fundraisers and donors.

## Installation Guide

### Prerequisites:
- **Node.js** (Version 14.x or above)
- **MetaMask** for blockchain wallet integration.
- **YouTube API Key** for live streaming.
- **MongoDB** for the database.
- **Solidity Compiler** for smart contract development.

### Steps to Run the Project Locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/clementkepoan/donat3.git
   cd donat3

2. **Set up necessary ENV variables (API Keys, URI, Auth)**
   Frontend .env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID = <YOUR_GOOGLE_CLIENT_I>
   NEXT_PUBLIC_ALCHEMY_API_KEY = <YOUR_ALCHEMY_API_KEK>
   NEXT_PUBLIC_MULTIBAAS_API_KEY = <YOUR_MULTIBAAS_API_KEY>
   NEXT_PUBLIC_NFT_STORAGE_KEY = <YOUR_NFT_STORAGE_KEY>
   NEXT_PUBLIC_PINATA_API_KEY = <YOUR_PINATA_API_KEY>
   NEXT_PUBLIC_PINATA_API_SECRET = <YOUR_PINATA_API_SECRET>

   Backend .env
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key

4. **Run Backend**
   ```bash
   cd backend
   npm run dev

5. **Run Frontend**
   ```bash
   cd frontend
   npm run dev

6. **Run the program locally on localhost**
   Open web browser
   type `http://localhost:{PORT}`, {PORT} is modifiable, default set to be 3000

### Smart Contracts:

Flow EVM Testnet Donation Contract:
  -0x70950b30978fb9917B20dE0fd96a62e99ac9871C
Deployed using Hardhat


NFT Polygon Amoy Contract:
  -0x70950b30978fb9917B20dE0fd96a62e99ac9871C
Deployed using MultiBaas (Curvegrid)


  
