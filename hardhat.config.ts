import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 60000, // Increase timeout to 60 seconds
    },
    hardhat: {
      // Settings for hardhat network
    }
  },
  // Increase mocha timeout for tests
  mocha: {
    timeout: 100000
  }
};

export default config;