# Environment Variables Guide

This document explains all environment variables used in the project, including the new NFT-related variables.

## Network Configuration (Existing)

### Sepolia Testnet
```bash
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# Or use public RPC: https://rpc.sepolia.org

SEPOLIA_PRIVATE_KEY=your_private_key_here
# Must be 64 hex characters (32 bytes), with or without 0x prefix
```

### Etherscan Verification
```bash
ETHERSCAN_API_KEY=your_etherscan_api_key
# Required for contract verification on Etherscan
```

### Gas Reporting (Optional)
```bash
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=true
```

---

## NFT Contract Deployment Variables (NEW)

These variables are used when deploying the NFT contract using environment variables instead of command-line arguments.

### Required for NFT Deployment

```bash
# Payment Token Contract Address
# The address of the deployed PaymentToken (ERC-20) contract
# This is the token that will be used to pay for NFT minting
PAYMENT_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890

# NFT Price
# The price of each NFT in payment token units
# Can be specified as:
#   - Decimal format: "10" (means 10 tokens, will be converted to wei)
#   - Wei format: "10000000000000000000" (exact wei amount)
# Note: PaymentToken uses 18 decimals, so "10" = 10 * 10^18 wei
NFT_PRICE=10

# NFT Collection Name
# The name of your NFT collection (e.g., "My Awesome NFTs")
NFT_NAME="My Awesome NFTs"

# NFT Collection Symbol
# The symbol/ticker for your NFT collection (e.g., "MANFT")
NFT_SYMBOL="MANFT"
```

### Alternative Variable Names

The deployment script also accepts these alternative names for compatibility:

```bash
# These work for both PaymentToken and NFT deployment
TOKEN_NAME="My Awesome NFTs"  # Alternative to NFT_NAME
TOKEN_SYMBOL="MANFT"          # Alternative to NFT_SYMBOL
```

### Deployment Control Variables

```bash
# Contract to deploy
DEPLOY_CONTRACT=NFT

# Network to deploy to
DEPLOY_NETWORK=sepolia
# Options: hardhat, localhost, sepolia, etc.
```

---

## NFT Testing/Interaction Variables (NEW)

These variables are used when testing or interacting with deployed NFT contracts.

### Required for NFT Minting Test Script

```bash
# NFT Contract Address
# The address of your deployed NFT contract
NFT_CONTRACT_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12

# Payment Token Address
# The address of the PaymentToken contract (same as PAYMENT_TOKEN_ADDRESS)
# Used to check balances and approve spending
PAYMENT_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
```

### Optional for NFT Minting

```bash
# Mint To Address
# If set, NFTs will be minted to this address instead of the caller
# If not set, NFTs will be minted to the caller's address
MINT_TO_ADDRESS=0x9876543210987654321098765432109876543210
```

---

## Complete .env Example

Here's a complete example `.env` file with all variables:

```bash
# ============================================
# Network Configuration
# ============================================
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_PRIVATE_KEY=your_64_character_hex_private_key_here

# ============================================
# Etherscan & Gas Reporting
# ============================================
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=true

# ============================================
# PaymentToken Contract (Deploy First)
# ============================================
# After deploying PaymentToken, set this:
# PAYMENT_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890

# ============================================
# NFT Contract Deployment
# ============================================
# Set these when deploying NFT contract:
PAYMENT_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
NFT_PRICE=10
NFT_NAME="My Awesome NFTs"
NFT_SYMBOL="MANFT"

# ============================================
# NFT Contract Interaction
# ============================================
# Set these after deploying NFT contract:
NFT_CONTRACT_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12

# Optional: Mint to specific address
# MINT_TO_ADDRESS=0x9876543210987654321098765432109876543210
```

---

## Usage Examples

### Deploy NFT Using Environment Variables

```bash
# Set variables in .env file, then:
DEPLOY_CONTRACT=NFT DEPLOY_NETWORK=sepolia npm run deploy:nft
```

Or using command-line arguments (recommended):

```bash
npm run deploy:nft -- --token-address 0x... --price "10" --name "My NFT" --symbol "MNFT" --network sepolia
```

### Test NFT Minting

```bash
# Set NFT_CONTRACT_ADDRESS and PAYMENT_TOKEN_ADDRESS in .env, then:
npx hardhat run scripts/test-nft-mint.js --network sepolia
```

---

## Variable Priority

When using command-line arguments, they take precedence over environment variables:

1. **Command-line arguments** (highest priority)
2. **Environment variables** (fallback)
3. **Default values** (if any)

Example:
```bash
# Even if NFT_PRICE=20 in .env, this will use 15:
npm run deploy:nft -- --price "15" ...
```

---

## Important Notes

1. **Payment Token Must Be Deployed First**: You need to deploy the PaymentToken contract before deploying the NFT contract, as the NFT contract requires the PaymentToken address.

2. **Price Format**: The `NFT_PRICE` can be specified as:
   - Decimal: `"10"` (automatically converted to wei: 10 * 10^18)
   - Wei: `"10000000000000000000"` (exact wei amount)

3. **Private Key Security**: 
   - Never commit your `.env` file to version control
   - Use a test account private key, never your mainnet key
   - The private key must be 64 hex characters (32 bytes)

4. **Address Format**: All addresses should be in lowercase or checksum format (0x followed by 40 hex characters)

---

## Troubleshooting

### "PAYMENT_TOKEN_ADDRESS is not set"
- Make sure you've deployed the PaymentToken contract first
- Set `PAYMENT_TOKEN_ADDRESS` in your `.env` file

### "NFT_PRICE must be greater than zero"
- Ensure `NFT_PRICE` is set and is a positive number
- Use decimal format like `"10"` or wei format

### "token address cannot be zero"
- Verify `PAYMENT_TOKEN_ADDRESS` is set correctly
- Make sure the address is a valid contract address

### "Insufficient allowance" when minting
- The script will automatically approve tokens, but if it fails:
  - Make sure you have enough PAY tokens
  - Manually approve: Call `approve(NFT_CONTRACT_ADDRESS, price)` on the PaymentToken contract

