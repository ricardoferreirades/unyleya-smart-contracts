# NFT Contract Capabilities Guide

This document explains everything you can do with your NFT contract.

---

## 🎯 Core Features

### ✅ ERC-721 Standard Compliance
Your NFT contract is fully ERC-721 compliant, which means:
- ✅ Works with all major NFT marketplaces (OpenSea, Rarible, etc.)
- ✅ Compatible with all NFT wallets (MetaMask, Trust Wallet, etc.)
- ✅ Supports standard NFT operations (transfer, approve, etc.)
- ✅ Can be viewed on Etherscan and other block explorers

### ✅ Payment-Based Minting
- Users must pay in PAY tokens to mint NFTs
- Payment goes directly to contract owner
- Even the owner must pay to mint (no free mints)

### ✅ Metadata Support
- Supports token URIs for metadata
- Can set base URI for all tokens
- Can set individual token URIs
- Compatible with OpenSea metadata standard

---

## 👥 What Users Can Do

### 1. **Mint NFTs** 🎨

#### Mint to Self
```javascript
// User approves tokens first
await paymentToken.approve(nftAddress, price);

// Then mints NFT to themselves
await nft.mint();
```

#### Mint to Another Address
```javascript
// User approves tokens
await paymentToken.approve(nftAddress, price);

// Mints NFT to someone else
await nft.mintTo(recipientAddress);
```

**Requirements:**
- Must have enough PAY tokens
- Must approve NFT contract to spend tokens
- Must pay the current price

### 2. **Transfer NFTs** 🔄

#### Standard Transfer
```javascript
// Transfer NFT to another address
await nft.transferFrom(fromAddress, toAddress, tokenId);
```

#### Approve and Transfer
```javascript
// Approve someone to transfer your NFT
await nft.approve(approvedAddress, tokenId);

// Approved address can now transfer
await nft.connect(approved).transferFrom(owner, recipient, tokenId);
```

#### Set Approval for All
```javascript
// Approve an operator to manage all your NFTs
await nft.setApprovalForAll(operatorAddress, true);
```

### 3. **View NFT Information** 👀

#### Check Ownership
```javascript
const owner = await nft.ownerOf(tokenId);
```

#### Check Balance
```javascript
const balance = await nft.balanceOf(address);
```

#### Get Token URI
```javascript
const uri = await nft.tokenURI(tokenId);
```

#### Check Approval
```javascript
const approved = await nft.getApproved(tokenId);
```

#### Check Operator Approval
```javascript
const isApproved = await nft.isApprovedForAll(owner, operator);
```

### 4. **Query Contract State** 📊

#### Get Current Price
```javascript
const currentPrice = await nft.price();
```

#### Get Total Supply
```javascript
const supply = await nft.totalSupply();
```

#### Get Next Token ID
```javascript
const nextId = await nft.nextTokenId();
```

#### Get Collection Info
```javascript
const name = await nft.name();
const symbol = await nft.symbol();
const owner = await nft.owner();
```

---

## 👑 What the Owner Can Do

### 1. **Update Price** 💰

```javascript
// Change the minting price
await nft.setPrice(newPrice);
```

**Use Cases:**
- Adjust price based on demand
- Set promotional pricing
- Increase price for rarity

### 2. **Set Base URI** 🌐

```javascript
// Set base URI for all tokens
await nft.setBaseURI("ipfs://QmYourHash/");
```

**Use Cases:**
- Point all tokens to IPFS metadata folder
- Update metadata location
- Switch between testnet and mainnet metadata

### 3. **Set Individual Token URI** 🎯

```javascript
// Set specific token's metadata URI
await nft.setTokenURI(tokenId, "ipfs://QmHash/1.json");
```

**Use Cases:**
- Update specific NFT metadata
- Reveal metadata after minting
- Fix incorrect metadata

---

## 🛒 Marketplace Integration

### OpenSea / Rarible / Other Marketplaces

Your NFTs will automatically appear on marketplaces because:
- ✅ Contract is ERC-721 compliant
- ✅ Supports `tokenURI()` function
- ✅ Metadata follows OpenSea standard
- ✅ Transfer functions work correctly

**What works:**
- List NFTs for sale
- Buy/sell NFTs
- View NFT images and metadata
- See ownership history
- View traits and attributes

---

## 📱 Frontend Integration

### Connect Wallet
```javascript
// Using ethers.js
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const nft = new ethers.Contract(nftAddress, abi, signer);
```

### Mint NFT
```javascript
// 1. Approve tokens
await paymentToken.approve(nftAddress, price);

// 2. Mint
const tx = await nft.mint();
await tx.wait();
```

### Display NFTs
```javascript
// Get user's NFTs
const balance = await nft.balanceOf(userAddress);
for (let i = 0; i < balance; i++) {
  const tokenId = await nft.tokenOfOwnerByIndex(userAddress, i);
  const uri = await nft.tokenURI(tokenId);
  // Fetch and display metadata
}
```

---

## 🔧 Available Functions

### Public Functions (Anyone)

| Function | Description | Returns |
|----------|-------------|---------|
| `mint()` | Mint NFT to caller | `uint256 tokenId` |
| `mintTo(address)` | Mint NFT to specific address | `uint256 tokenId` |
| `transferFrom(from, to, tokenId)` | Transfer NFT | - |
| `approve(to, tokenId)` | Approve address to transfer | - |
| `setApprovalForAll(operator, approved)` | Approve operator for all | - |
| `tokenURI(tokenId)` | Get token metadata URI | `string` |
| `ownerOf(tokenId)` | Get NFT owner | `address` |
| `balanceOf(address)` | Get NFT balance | `uint256` |
| `getApproved(tokenId)` | Get approved address | `address` |
| `isApprovedForAll(owner, operator)` | Check operator approval | `bool` |
| `price()` | Get current minting price | `uint256` |
| `totalSupply()` | Get total minted count | `uint256` |
| `nextTokenId()` | Get next token ID | `uint256` |
| `name()` | Get collection name | `string` |
| `symbol()` | Get collection symbol | `string` |
| `paymentToken()` | Get payment token address | `address` |

### Owner-Only Functions

| Function | Description |
|----------|-------------|
| `setPrice(uint256)` | Update minting price |
| `setBaseURI(string)` | Set base URI for metadata |
| `setTokenURI(uint256, string)` | Set individual token URI |
| `owner()` | Get contract owner |
| `transferOwnership(address)` | Transfer ownership (from Ownable) |
| `renounceOwnership()` | Renounce ownership (from Ownable) |

---

## 📋 Complete Workflow Examples

### Workflow 1: User Mints NFT

```javascript
// 1. User gets PAY tokens
await paymentToken.mintAndTransfer(userAddress, ethers.parseEther("100"));

// 2. User approves NFT contract
await paymentToken.connect(user).approve(nftAddress, price);

// 3. User mints NFT
const tx = await nft.connect(user).mint();
const receipt = await tx.wait();

// 4. Get token ID from event
const event = receipt.logs.find(log => {
  const parsed = nft.interface.parseLog(log);
  return parsed && parsed.name === "Minted";
});
const tokenId = event.args.tokenId;

// 5. View NFT
const uri = await nft.tokenURI(tokenId);
const owner = await nft.ownerOf(tokenId);
```

### Workflow 2: Owner Updates Metadata

```javascript
// 1. Upload metadata to IPFS
// Result: ipfs://QmHash/1.json

// 2. Set base URI
await nft.setBaseURI("ipfs://QmHash/");

// Or set individual URI
await nft.setTokenURI(1, "ipfs://QmHash/1.json");
```

### Workflow 3: User Sells NFT on Marketplace

```javascript
// 1. User approves marketplace
await nft.approve(marketplaceAddress, tokenId);

// 2. Marketplace handles the sale
// (Marketplace contract logic)

// 3. NFT transfers to buyer
// (Handled by marketplace)
```

---

## 🎨 Use Cases

### 1. **Digital Art Collection**
- Artists mint unique artworks
- Collectors buy with PAY tokens
- Art displayed on OpenSea

### 2. **Gaming Items**
- Players mint in-game items
- Items tradeable on marketplaces
- Metadata includes game stats

### 3. **Membership Tokens**
- Exclusive access NFTs
- Transferable memberships
- Metadata shows benefits

### 4. **Collectibles**
- Limited edition collectibles
- Rarity-based pricing
- Community-driven collection

### 5. **Certificates / Achievements**
- Proof of completion
- Verifiable credentials
- Transferable achievements

---

## 🚀 What You Can Build

### Frontend Applications
- ✅ Minting interface
- ✅ NFT gallery/viewer
- ✅ Marketplace integration
- ✅ Wallet connection
- ✅ Price display
- ✅ Collection stats

### Backend Services
- ✅ Metadata API
- ✅ Image hosting
- ✅ Analytics tracking
- ✅ Event monitoring
- ✅ Price history

### Smart Contract Extensions
- ✅ Royalty system (add royalty contract)
- ✅ Staking (add staking contract)
- ✅ Airdrops (create airdrop contract)
- ✅ Burn mechanism (add burn function)

---

## 📊 Contract Statistics

You can track:
- Total supply: `totalSupply()`
- Current price: `price()`
- Next token ID: `nextTokenId()`
- Payment token: `paymentToken()`
- Owner: `owner()`

---

## ⚠️ Limitations

### What You CANNOT Do (Without Modifications)

- ❌ Free mints (even owner must pay)
- ❌ Batch minting (mint one at a time)
- ❌ Presale/whitelist (all users can mint)
- ❌ Maximum supply limit (unlimited minting)
- ❌ Royalty fees (not built-in, can add)
- ❌ Burn function (not included)
- ❌ Pause functionality (not included)

### What You CAN Add

All of the above can be added by modifying the contract or creating additional contracts.

---

## 🎯 Quick Reference

### For Users:
```bash
# Mint NFT
npm run test-nft-mint

# Check image uniqueness
npm run check:images
```

### For Owner:
```bash
# Deploy NFT
npm run deploy:nft

# Update price (via script or frontend)
# Set metadata URIs (via script or frontend)
```

---

## 📚 Next Steps

1. **Deploy PaymentToken** (if not already deployed)
2. **Deploy NFT Contract**
3. **Upload images to IPFS**
4. **Create metadata JSON files**
5. **Upload metadata to IPFS**
6. **Set base URI in contract**
7. **Start minting!**

---

## 🔗 Integration Resources

- **OpenSea**: https://docs.opensea.io/
- **MetaMask**: https://docs.metamask.io/
- **Ethers.js**: https://docs.ethers.org/
- **IPFS**: https://docs.ipfs.io/
- **ERC-721 Standard**: https://eips.ethereum.org/EIPS/eip-721

---

Your NFT contract is production-ready and can be used immediately for:
- ✅ Creating NFT collections
- ✅ Selling NFTs on marketplaces
- ✅ Building NFT applications
- ✅ Integrating with wallets
- ✅ Displaying on OpenSea

