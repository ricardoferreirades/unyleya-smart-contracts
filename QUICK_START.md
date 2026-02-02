# Quick Start: Deploy & Test with MetaMask

## 🚀 Quick Steps

### 1. Setup Environment
```bash
# Create .env file
cat > .env << EOF
SEPOLIA_URL=https://rpc.sepolia.org
SEPOLIA_PRIVATE_KEY=your_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_key_optional
EOF
```

### 2. Get Testnet ETH
- **Alchemy Faucet**: https://sepoliafaucet.com (0.5 ETH/day)
- **Infura Faucet**: https://www.infura.io/faucet/sepolia (0.5 ETH/day)
- **Chainlink Faucet**: https://faucets.chain.link/sepolia (0.1 ETH)

### 3. Deploy Contract
```bash
npm run compile
npx hardhat run scripts/deploy.js --network sepolia
```

**Save the contract address from output!**

### 4. Verify on Etherscan (Optional)
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "Payment Token" "PAY"
```

### 5. Interact via Etherscan
1. Go to: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
2. Click "Contract" → "Write Contract"
3. Connect MetaMask
4. Use `mintAndTransfer` function (owner only)

### 6. Add Token to MetaMask
1. MetaMask → "Import tokens"
2. Paste contract address
3. Click "Add Custom Token"

## 📋 Common Commands

```bash
# Compile
npm run compile

# Test locally
npm test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Interact with contract
CONTRACT_ADDRESS=0x... npx hardhat run scripts/interact.js --network sepolia

# Verify contract
npx hardhat verify --network sepolia <ADDRESS> "Payment Token" "PAY"

# Check coverage
npx hardhat coverage
```

## 🔗 Useful Links

- **Sepolia Explorer**: https://sepolia.etherscan.io
- **MetaMask**: https://metamask.io
- **Full Guide**: See `DEPLOYMENT_GUIDE.md`

## ⚠️ Important Notes

- Never share your private key
- Never commit `.env` to git
- Use testnet for testing only
- Start with small amounts

