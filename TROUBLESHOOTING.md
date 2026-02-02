# Troubleshooting: mintAndTransfer Not Working on Etherscan

## Common Issues and Solutions

### Issue 1: "Write" Button Does Nothing / No MetaMask Popup

**Possible Causes:**
1. **Not connected with owner wallet** - Most common issue!
2. **MetaMask not connected to Etherscan**
3. **Browser blocking MetaMask popup**
4. **Amount format incorrect**

**Solutions:**

#### ✅ Check 1: Verify You're Using Owner Wallet
1. On Etherscan, check the "Read Contract" tab
2. Find the `owner()` function
3. Click "Query" - this shows the owner address
4. **Make sure your MetaMask is connected with THIS exact address**

#### ✅ Check 2: Reconnect MetaMask
1. Click "Connect to Web3" on Etherscan
2. Select your MetaMask wallet
3. Make sure it's the owner address
4. Try again

#### ✅ Check 3: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to "Console" tab
3. Try clicking "Write" again
4. Look for any error messages
5. Common errors:
   - "User rejected request" - You clicked reject in MetaMask
   - "Insufficient funds" - Not enough ETH for gas
   - "OwnableUnauthorizedAccount" - Wrong wallet connected

#### ✅ Check 4: Amount Format
The `amount` parameter must be in **wei** (smallest unit), not tokens!

**Wrong:** `100` (this is 100 wei = 0.0000000000000001 tokens)
**Correct:** `1000000000000000000` (this is 1 token with 18 decimals)

**Easy conversion:**
- 1 token = 1000000000000000000 wei
- 10 tokens = 10000000000000000000 wei
- 100 tokens = 100000000000000000000 wei

**Use Etherscan's unit converter:**
- Etherscan has a unit dropdown - select "Ether" and enter your amount
- It will automatically convert to wei

### Issue 2: Transaction Fails Silently

**Check Transaction Status:**
1. After clicking "Write", check MetaMask
2. If transaction appears, check its status:
   - Pending = Still processing
   - Failed = Check error message
   - Success = Check events tab

3. Go to Etherscan → Your contract → "Events" tab
4. Look for recent `MintAndTransfer` events

### Issue 3: "OwnableUnauthorizedAccount" Error

**This means:** You're not using the owner wallet

**Solution:**
1. Check who the owner is (Read Contract → `owner()`)
2. Switch MetaMask to that account
3. Reconnect on Etherscan
4. Try again

### Issue 4: Insufficient Gas / Funds

**Symptoms:**
- Transaction fails immediately
- Error: "insufficient funds for gas"

**Solution:**
1. Get more Sepolia ETH from faucet
2. You need ETH to pay for gas (even though tokens are free)
3. Typical gas cost: ~50,000 - 100,000 gas units

## Step-by-Step Debugging Process

### Step 1: Verify Contract Owner
```bash
# Using Hardhat console
npx hardhat console --network sepolia
```
Then:
```javascript
const PaymentToken = await ethers.getContractFactory("PaymentToken");
const token = PaymentToken.attach("YOUR_CONTRACT_ADDRESS");
const owner = await token.owner();
console.log("Owner:", owner);
```

### Step 2: Check Your Wallet Address
In MetaMask, verify your current address matches the owner address.

### Step 3: Test with Hardhat Script
Use the test script to verify the function works:
```bash
npx hardhat run scripts/test-mint.js --network sepolia
```

### Step 4: Check Contract on Etherscan
1. Go to your contract on Etherscan
2. Click "Read Contract"
3. Verify:
   - `owner()` = Your MetaMask address
   - `totalSupply()` = Current supply
   - `balanceOf(YOUR_ADDRESS)` = Your token balance

### Step 5: Try Writing Again
1. Clear browser cache
2. Disconnect and reconnect MetaMask
3. Make sure amount is in wei format
4. Click "Write" and watch MetaMask popup

## Alternative: Use Hardhat Console

If Etherscan continues to have issues, use Hardhat console:

```bash
npx hardhat console --network sepolia
```

Then:
```javascript
// Load contract
const PaymentToken = await ethers.getContractFactory("PaymentToken");
const token = PaymentToken.attach("YOUR_CONTRACT_ADDRESS");

// Get signers
const [owner, recipient] = await ethers.getSigners();

// Check owner
console.log("Contract owner:", await token.owner());
console.log("Your address:", owner.address);

// Mint and transfer 100 tokens
const amount = ethers.parseEther("100"); // 100 tokens
const tx = await token.mintAndTransfer(recipient.address, amount);
console.log("Transaction hash:", tx.hash);

// Wait for confirmation
await tx.wait();
console.log("✅ Transaction confirmed!");

// Check balances
console.log("Recipient balance:", ethers.formatEther(await token.balanceOf(recipient.address)));
console.log("Total supply:", ethers.formatEther(await token.totalSupply()));
```

## Quick Checklist

Before trying again, verify:
- [ ] MetaMask is connected to Sepolia network
- [ ] Connected wallet address matches contract owner
- [ ] You have Sepolia ETH for gas fees
- [ ] Amount is in wei format (use Etherscan's unit converter)
- [ ] Recipient address is valid (not zero address)
- [ ] Browser console shows no errors
- [ ] MetaMask popup appears when clicking "Write"

## Still Not Working?

1. **Check transaction on Etherscan:**
   - Go to your wallet address on Etherscan
   - Check "Internal Txns" and "ERC-20 Token Txns" tabs
   - See if transaction was attempted

2. **Verify contract is verified:**
   - If contract code is not verified, Etherscan might not show the function correctly
   - Verify using: `npx hardhat verify --network sepolia <ADDRESS> "Payment Token" "PAY"`

3. **Try different browser:**
   - Sometimes browser extensions interfere
   - Try Chrome/Firefox in incognito mode

4. **Check MetaMask logs:**
   - MetaMask → Settings → Advanced → Show transaction details
   - Look for error messages

