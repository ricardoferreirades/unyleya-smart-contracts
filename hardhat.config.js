require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");
require("hardhat-abi-exporter");

// Helper function to validate private key
function getPrivateKey(key) {
  if (!key || key.length === 0) {
    return [];
  }
  // Remove 0x prefix if present and validate length (64 hex chars = 32 bytes)
  const cleanKey = key.startsWith("0x") ? key.slice(2) : key;
  if (cleanKey.length === 64 && /^[0-9a-fA-F]+$/.test(cleanKey)) {
    return [key.startsWith("0x") ? key : `0x${key}`];
  }
  return [];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // chainId: 1337,
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    //   chainId: 1337,
    // },
    // Add your network configurations here
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: getPrivateKey(process.env.SEPOLIA_PRIVATE_KEY),
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPriceApi: process.env.GAS_PRICE_API || "",
  },
  abiExporter: {
    path: "./abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [],
    spacing: 2,
    pretty: false,
    format: "minimal",
  },
  etherscan: {
    // Etherscan API V2 - single API key for all networks
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  sourcify: {
    enabled: true,
  },
};

