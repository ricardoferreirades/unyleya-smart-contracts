# Unyleya

## About

Unyleya is a blockchain project featuring an NFT marketplace system built on Ethereum. The project consists of two main smart contracts:

- **PaymentToken**: An ERC-20 token used as the payment currency for purchasing NFTs
- **NFT**: An ERC-721 NFT contract that requires payment in PaymentToken tokens to mint

Users must approve the NFT contract to spend PaymentToken tokens before they can mint NFTs. The contract owner can set NFT prices and manage token metadata URIs.

## Install

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm ci
```

## Compile

Compile the smart contracts:

```bash
npm run compile
```

To force a clean recompilation:

```bash
npm run compile:force
```

## Deploy

### Environment Setup

Create a `.env` file in the root directory:

```bash
SEPOLIA_URL=https://rpc.sepolia.org
SEPOLIA_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Deploy Contracts

Deploy PaymentToken:

```bash
npm run deploy:payment-token
```

Deploy NFT:

```bash
npm run deploy:nft
```

Or use the main deploy script:

```bash
npx hardhat run scripts/deploy.ts -- --contract PaymentToken
npx hardhat run scripts/deploy.ts -- --contract NFT
```

Deploy to a specific network:

```bash
npx hardhat run scripts/deploy.ts --network sepolia -- --contract PaymentToken
```

## Test

Run the test suite:

```bash
npm run test
```

Generate gas usage report:

```bash
REPORT_GAS=true npm run test
```

## Technologies

- **Hardhat**: Development environment and testing framework
- **Solidity**: Smart contract programming language (v0.8.24)
- **OpenZeppelin Contracts**: Secure, audited smart contract libraries
- **TypeScript**: Type-safe JavaScript for deployment scripts
- **Ethers.js**: Ethereum library for interacting with the blockchain
- **Chai**: Assertion library for testing
- **hardhat-gas-reporter**: Gas usage analysis
- **hardhat-abi-exporter**: Automatic ABI export
