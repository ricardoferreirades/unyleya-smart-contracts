# Hardhat Project

This project demonstrates a basic Hardhat setup for Ethereum smart contract development.

## Project Structure

```
unyleya/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment and utility scripts
├── test/              # Test files
├── abis/              # Exported contract ABIs (auto-generated)
├── hardhat.config.js  # Hardhat configuration
└── package.json       # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Available Scripts

### Compile Contracts

```bash
npm run compile
# or
npx hardhat compile
```

**Note:** Hardhat uses incremental compilation, so if you see "Nothing to compile", it means your contracts are already up to date and haven't changed since the last compilation. This is normal behavior.

To force a clean recompilation:

```bash
npm run compile:force
# or
npm run clean && npm run compile
```

This will clean the cache and artifacts, then recompile all contracts from scratch.

### Clean Build Artifacts

```bash
npm run clean
# or
npx hardhat clean
```

This removes the `cache` and `artifacts` directories. Useful when you want to start fresh or troubleshoot compilation issues.

### Run Tests

```bash
npm run test
# or
npx hardhat test
```

### Run Local Hardhat Network

```bash
npm run node
# or
npx hardhat node
```

This will start a local Ethereum network on `http://127.0.0.1:8545` with 20 accounts pre-funded with test ETH.

### Deploy Contracts

```bash
npm run deploy
# or
npx hardhat run scripts/deploy.js
```

To deploy to a specific network:

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

### Verify Contracts on Etherscan

After deploying a contract, you can verify it on Etherscan:

```bash
npx hardhat verify --network <network-name> <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGUMENTS>
```

Example for the PaymentToken contract:

```bash
npx hardhat verify --network sepolia 0x1234567890123456789012345678901234567890 "Token Name" "SYMBOL"
```

The Etherscan API key is configured in `hardhat.config.js` and loaded from your `.env` file.

**Note:** This project uses Etherscan API V2, which uses a single API key for all networks (Sepolia, Goerli, Mainnet, etc.). The old V1 API with network-specific keys is deprecated and will be removed by May 31st, 2025.

## Configuration

### Network Configuration

The project is pre-configured with the following networks:
- **hardhat**: Local Hardhat network (chainId: 1337)
- **localhost**: Local node connection (chainId: 1337)
- **sepolia**: Sepolia testnet (chainId: 11155111)

To add additional networks, edit `hardhat.config.js`. Example for Sepolia testnet:

```javascript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_URL || "",
    accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
  },
}
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Sepolia Testnet Configuration (Required for deployment)
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# Or use the public RPC: https://rpc.sepolia.org
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key_here

# Etherscan API Key (Required for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Gas Reporter Configuration
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=true
```

**Important Notes:**
- **Private Key Format**: Must be 64 hex characters (32 bytes). Can include or exclude the `0x` prefix.
- **Security**: Never commit your `.env` file or private keys to version control!
- **Test Account Only**: Use a test account private key, never your mainnet private key!
- **Getting a Private Key**: Export from MetaMask or another wallet (Settings → Security & Privacy → Show Private Key)
- **Etherscan API Key**: Get from [etherscan.io/apis](https://etherscan.io/apis). The same API key works for Goerli, Sepolia, and Mainnet.

**Example `.env` file:**
```bash
SEPOLIA_URL=https://rpc.sepolia.org
SEPOLIA_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
ETHERSCAN_API_KEY=ABCD1234EFGH5678IJKL9012
```

**Important:** Never commit your `.env` file or private keys to version control!

## Solidity Version

The project is configured to use Solidity `0.8.24` with optimizer enabled (200 runs).

## Testing

Tests are written using Hardhat's testing framework with Chai assertions. Run tests with:

```bash
npm run test
```

### Gas Reporting

The project includes `hardhat-gas-reporter` to track gas usage. To generate a gas report:

```bash
REPORT_GAS=true npm run test
```

The report will be saved to `gas-report.txt`. You can also add a CoinMarketCap API key to your `.env` file to get USD cost estimates:

```
COINMARKETCAP_API_KEY=your_api_key_here
```

### ABI Export

The project uses `hardhat-abi-exporter` to automatically export contract ABIs. After compilation, ABIs are exported to the `abis/` directory in a flat structure. This is configured to run automatically on compile.

## Additional Plugins

### dotenv

Environment variables are loaded from a `.env` file using `dotenv`. This allows you to securely store sensitive information like private keys and API keys without committing them to version control.

### hardhat-gas-reporter

Automatically generates gas usage reports when running tests. Configured in `hardhat.config.js` with options for currency, output file, and CoinMarketCap integration.

### hardhat-abi-exporter

Automatically exports contract ABIs to the `abis/` directory after compilation. Useful for frontend integration and contract interaction.

### Etherscan Verification

The project includes Etherscan configuration for contract verification using **Etherscan API V2**. This allows you to verify your deployed contracts on Etherscan, making the source code publicly available and enabling interaction through Etherscan's interface.

To verify a contract:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

The verification uses the `@nomicfoundation/hardhat-verify` plugin (included in Hardhat Toolbox) and requires an Etherscan API key in your `.env` file. The same API key works for all networks (Sepolia, Goerli, Mainnet, etc.) with the V2 API.

**Note:** Contracts are also automatically verified on Sourcify when using the verify command.

## Next Steps

1. Write your smart contracts in the `contracts/` directory
2. Create deployment scripts in `scripts/`
3. Write tests in the `test/` directory
4. Configure your networks in `hardhat.config.js`
5. Deploy and test your contracts!

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Ethereum Developer Resources](https://ethereum.org/en/developers/)

