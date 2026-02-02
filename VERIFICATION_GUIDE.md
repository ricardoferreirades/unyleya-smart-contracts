# Contract Verification Guide

## ⚠️ Important Note

**Contracts deployed to Hardhat (local) network CANNOT be verified on Etherscan.** Only contracts deployed to public networks (Sepolia, Mainnet, etc.) can be verified.

## Step 1: Deploy to Sepolia Testnet

First, deploy your contracts to Sepolia:

### Deploy PaymentToken to Sepolia:
```bash
TOKEN_NAME="My Token" TOKEN_SYMBOL="MTK" DEPLOY_NETWORK=sepolia npm run deploy:payment-token
```

### Deploy Lock to Sepolia:
```bash
UNLOCK_TIME=3600 DEPLOY_NETWORK=sepolia npm run deploy:lock
```

After deployment, **save the contract address** that is displayed.

## Step 2: Verify Contracts

### Verify PaymentToken:
```bash
npx hardhat run scripts/verify.ts --network sepolia <CONTRACT_ADDRESS> "My Token" "MTK"
```

Example:
```bash
npx hardhat run scripts/verify.ts --network sepolia 0x1234567890123456789012345678901234567890 "My Token" "MTK"
```

### Verify Lock:
```bash
npx hardhat run scripts/verify.ts --network sepolia <CONTRACT_ADDRESS> <UNLOCK_TIMESTAMP>
```

Example:
```bash
npx hardhat run scripts/verify.ts --network sepolia 0x1234567890123456789012345678901234567890 1735689600
```

## Step 3: View on Etherscan

After successful verification, the script will display the Etherscan link. You can also manually visit:

**Sepolia Etherscan:**
- PaymentToken: `https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>`
- Lock: `https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>`

## Prerequisites

1. **Etherscan API Key**: Make sure you have `ETHERSCAN_API_KEY` in your `.env` file
   - Get one at: https://etherscan.io/apis
   - Free tier is sufficient for testnet verification

2. **Sepolia Configuration**: Ensure your `.env` has:
   ```bash
   SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_KEY
   SEPOLIA_PRIVATE_KEY=your_private_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

## Alternative: Using Hardhat's Built-in Verify Command

You can also use Hardhat's direct verify command:

```bash
# PaymentToken
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "Token Name" "SYMBOL"

# Lock
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <UNLOCK_TIMESTAMP>
```

## Troubleshooting

- **"Contract not found"**: Make sure the contract was deployed to the specified network
- **"Already verified"**: Contract is already verified, check Etherscan directly
- **"Constructor arguments mismatch"**: Double-check the constructor arguments match exactly
- **"API key invalid"**: Verify your ETHERSCAN_API_KEY is correct in `.env`

