# Deployment and Testing Guide with MetaMask

This guide will walk you through deploying the PaymentToken contract to a testnet (Sepolia) and testing it with MetaMask.

## Prerequisites

1. **MetaMask Extension** installed in your browser
2. **Node.js and npm** installed
3. **Testnet ETH** (Sepolia ETH) in your MetaMask wallet
4. **RPC URL** for Sepolia testnet
5. **Etherscan API Key** (optional, for contract verification)

## Step 1: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# Sepolia Testnet Configuration
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
# OR use Alchemy: https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
# OR use public RPC: https://rpc.sepolia.org

SEPOLIA_PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Optional: For contract verification on Etherscan
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Getting an RPC URL:

**Option 1: Infura (Free)**
1. Go to https://infura.io
2. Sign up and create a new project
3. Select "Ethereum" network
4. Copy the Sepolia endpoint URL

**Option 2: Alchemy (Free)**
1. Go to https://www.alchemy.com
2. Sign up and create a new app
3. Select "Ethereum" and "Sepolia" network
4. Copy the HTTPS URL

**Option 3: Public RPC (No signup required)**
- Use: `https://rpc.sepolia.org`

### Getting Your Private Key from MetaMask:

⚠️ **SECURITY WARNING**: Never share your private key or commit it to version control!

1. Open MetaMask
2. Click the account icon (top right)
3. Go to "Account Details"
4. Click "Show Private Key"
5. Enter your password
6. Copy the private key (remove the `0x` prefix if present)

## Step 2: Get Sepolia Testnet ETH

You need testnet ETH to pay for gas fees. Get it from a faucet:

### Sepolia Faucets:

1. **Alchemy Sepolia Faucet** (Recommended)
   - https://sepoliafaucet.com
   - Requires Alchemy account (free)
   - Gives 0.5 ETH per day

2. **Infura Sepolia Faucet**
   - https://www.infura.io/faucet/sepolia
   - Requires Infura account (free)
   - Gives 0.5 ETH per day

3. **Chainlink Faucet**
   - https://faucets.chain.link/sepolia
   - Requires GitHub account
   - Gives 0.1 ETH per request

4. **PoW Faucet** (No signup)
   - https://sepolia-faucet.pk910.de
   - Requires mining (Proof of Work)
   - Variable amounts

### Steps to Get Testnet ETH:

1. Copy your MetaMask wallet address
2. Visit one of the faucets above
3. Paste your address and request testnet ETH
4. Wait a few minutes for the transaction to confirm
5. Check MetaMask - you should see Sepolia ETH in your wallet

## Step 3: Add Sepolia Network to MetaMask

If you haven't added Sepolia to MetaMask:

1. Open MetaMask
2. Click the network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:
   - **Network Name**: Sepolia
   - **RPC URL**: `https://rpc.sepolia.org` (or your Infura/Alchemy URL)
   - **Chain ID**: `11155111`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: `https://sepolia.etherscan.io`
5. Click "Save"

## Step 4: Deploy the Contract

1. **Compile the contract:**
   ```bash
   npm run compile
   ```

2. **Deploy to Sepolia:**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Save the contract address** from the output - you'll need it for testing!

Example output:
```
=== PaymentToken Deployment Successful ===
Contract: PaymentToken
Address: 0x1234567890123456789012345678901234567890
Name: Payment Token
Symbol: PAY
Decimals: 18
Network: sepolia
Owner: 0xYourAddress...
```

## Step 5: Verify Contract on Etherscan (Optional)

1. Get an Etherscan API key from https://etherscan.io/apis
2. Add it to your `.env` file as `ETHERSCAN_API_KEY`
3. Run the verification command (from deployment output):
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "Payment Token" "PAY"
   ```

## Step 6: Interact with Contract via MetaMask

### Method 1: Using Etherscan (Easiest)

1. Go to https://sepolia.etherscan.io
2. Search for your contract address
3. Click "Contract" tab
4. Click "Write Contract"
5. Connect your MetaMask wallet
6. You can now interact with functions like `mintAndTransfer`

### Method 2: Using Hardhat Console

Use the provided interaction script:
```bash
npx hardhat run scripts/interact.js --network sepolia
```

### Method 3: Add Token to MetaMask

1. Open MetaMask
2. Click "Import tokens"
3. Enter your contract address
4. MetaMask will auto-detect symbol and decimals
5. Click "Add Custom Token"
6. You'll now see your PAY tokens in MetaMask!

## Step 7: Test the Contract

### Test 1: Mint and Transfer Tokens (Owner Only)

**Using Etherscan:**
1. Go to your contract on Etherscan
2. Click "Write Contract"
3. Connect MetaMask (must be the owner address)
4. Find `mintAndTransfer` function
5. Enter:
   - `to`: Recipient address
   - `amount`: Amount in wei (e.g., 1000000000000000000 for 1 token)
6. Click "Write" and confirm in MetaMask

**Using Hardhat Console:**
```bash
npx hardhat console --network sepolia
```
Then:
```javascript
const PaymentToken = await ethers.getContractFactory("PaymentToken");
const token = PaymentToken.attach("YOUR_CONTRACT_ADDRESS");
const [owner, recipient] = await ethers.getSigners();

// Mint and transfer 100 tokens
await token.mintAndTransfer(recipient.address, ethers.parseEther("100"));
```

### Test 2: Approve Tokens (DApp Flow)

**Using Etherscan:**
1. Connect recipient's MetaMask wallet
2. Go to contract → "Write Contract"
3. Find `approve` function
4. Enter:
   - `spender`: Address that will spend tokens (e.g., NFT contract)
   - `amount`: Amount to approve
5. Confirm transaction

**Using Hardhat Console:**
```javascript
const recipient = await ethers.getSigner("RECIPIENT_ADDRESS");
const token = PaymentToken.attach("YOUR_CONTRACT_ADDRESS");
await token.connect(recipient).approve("SPENDER_ADDRESS", ethers.parseEther("100"));
```

### Test 3: Check Balances

**Using Etherscan:**
1. Go to contract → "Read Contract"
2. Find `balanceOf` function
3. Enter address and click "Query"

**Using MetaMask:**
- If you added the token, you'll see the balance directly in MetaMask

## Troubleshooting

### "Insufficient funds for gas"
- Get more Sepolia ETH from a faucet
- You need ETH to pay for gas fees

### "OwnableUnauthorizedAccount"
- You're trying to call `mintAndTransfer` from a non-owner address
- Make sure you're using the owner's MetaMask account

### "nonce too high" or "replacement transaction underpriced"
- Reset your MetaMask account nonce
- Or wait for pending transactions to confirm

### Contract not found on Etherscan
- Wait a few minutes for the block explorer to index
- Or verify the contract manually using the verification command

## Security Reminders

- ⚠️ Never share your private key
- ⚠️ Never commit `.env` file to git
- ⚠️ Use testnet for testing only
- ⚠️ Double-check addresses before sending transactions
- ⚠️ Start with small amounts when testing

## Next Steps

After successful deployment and testing:
1. Integrate the contract address into your DApp frontend
2. Use the contract in your NFT marketplace
3. Test the full flow: mint tokens → approve → purchase NFT

## Useful Links

- Sepolia Etherscan: https://sepolia.etherscan.io
- MetaMask: https://metamask.io
- Hardhat Docs: https://hardhat.org/docs
- OpenZeppelin Docs: https://docs.openzeppelin.com/contracts

