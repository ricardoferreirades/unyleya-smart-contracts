# How to Verify Contracts on Etherscan

## ⚠️ Important: Local Network Contracts Cannot Be Verified

The address `0x5FbDB2315678afecb367f032d93F642f64180aa3` is from the **Hardhat local network**. Contracts deployed to local networks (hardhat/localhost) **cannot be verified on Etherscan** because they don't exist on public blockchains.

## To Verify a Contract, You Must:

1. **Deploy to a Public Network** (Sepolia, Mainnet, etc.)
2. **Have the Constructor Arguments** used during deployment
3. **Have an Etherscan API Key** configured

---

## Step-by-Step Verification Guide

### Step 1: Deploy to Sepolia Testnet

First, deploy your contract to Sepolia:

#### PaymentToken:
```bash
TOKEN_NAME="My Token" TOKEN_SYMBOL="MTK" DEPLOY_NETWORK=sepolia npm run deploy:payment-token
```

#### NFT:
```bash
PAYMENT_TOKEN_ADDRESS=<address> NFT_PRICE="10" NFT_NAME="My NFT" NFT_SYMBOL="MNFT" DEPLOY_NETWORK=sepolia npm run deploy:nft
```

**Save the contract address** from the deployment output!

### Step 2: Verify Using the Script

#### PaymentToken Verification:
```bash
npx hardhat run scripts/verify.ts --network sepolia <CONTRACT_ADDRESS> "My Token" "MTK"
```

#### NFT Verification:
```bash
npx hardhat run scripts/verify.ts --network sepolia <CONTRACT_ADDRESS> "<PAYMENT_TOKEN_ADDRESS>" "<PRICE_IN_WEI>" "My NFT" "MNFT"
```

### Step 3: Alternative - Use Hardhat's Built-in Command

You can also use Hardhat's direct verify command:

#### PaymentToken:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "My Token" "MTK"
```

#### NFT:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "<PAYMENT_TOKEN_ADDRESS>" "<PRICE_IN_WEI>" "My NFT" "MNFT"
```

---

## Prerequisites

### 1. Etherscan API Key

Add to your `.env` file:
```bash
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

Get your API key at: https://etherscan.io/apis (free tier works for testnets)

### 2. Network Configuration

Make sure your `.env` has the network configured:
```bash
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_KEY
# Or use public RPC: https://rpc.sepolia.org
SEPOLIA_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

---

## Example: Verifying PaymentToken on Sepolia

1. **Deploy:**
   ```bash
   TOKEN_NAME="MyToken" TOKEN_SYMBOL="MTK" DEPLOY_NETWORK=sepolia npm run deploy:payment-token
   ```
   
   Output shows: `Address: 0x1234567890123456789012345678901234567890`

2. **Verify:**
   ```bash
   npx hardhat verify --network sepolia 0x1234567890123456789012345678901234567890 "MyToken" "MTK"
   ```

3. **View on Etherscan:**
   ```
   https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890
   ```

---

## Example: Verifying NFT on Sepolia

1. **Deploy PaymentToken first:**
   ```bash
   TOKEN_NAME="PaymentToken" TOKEN_SYMBOL="PAY" DEPLOY_NETWORK=sepolia npm run deploy:payment-token
   ```
   Save the address: `0xPAYMENT_TOKEN_ADDRESS`

2. **Deploy NFT:**
   ```bash
   PAYMENT_TOKEN_ADDRESS=0xPAYMENT_TOKEN_ADDRESS NFT_PRICE="10" NFT_NAME="MyNFT" NFT_SYMBOL="MNFT" DEPLOY_NETWORK=sepolia npm run deploy:nft
   ```
   Save the address: `0xNFT_ADDRESS`

3. **Verify NFT:**
   ```bash
   npx hardhat verify --network sepolia 0xNFT_ADDRESS "0xPAYMENT_TOKEN_ADDRESS" "10000000000000000000" "MyNFT" "MNFT"
   ```
   Note: Price must be in wei (10 tokens = 10000000000000000000 wei)

---

## Troubleshooting

### "Cannot verify contracts on local networks"
- ✅ **Solution**: Deploy to Sepolia or another public network first

### "Contract not found"
- ✅ **Solution**: Make sure you're using the correct network and address

### "Constructor arguments mismatch"
- ✅ **Solution**: Double-check constructor arguments match exactly (including quotes for strings)

### "Already verified"
- ✅ **Solution**: Contract is already verified! Check Etherscan directly

### "API key invalid"
- ✅ **Solution**: Verify your `ETHERSCAN_API_KEY` in `.env` is correct

---

## Need Help?

If you deployed to Sepolia and need help verifying, provide:
1. The contract address
2. The network (sepolia, mainnet, etc.)
3. The constructor arguments used during deployment

