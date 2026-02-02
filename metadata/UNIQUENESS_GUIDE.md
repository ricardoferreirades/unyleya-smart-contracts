# NFT Image Uniqueness Guide

## Understanding NFT Uniqueness

NFTs are unique in **two ways**:

1. **On-Chain Uniqueness** ✅ (Automatic)
   - Each NFT has a unique `tokenId` (1, 2, 3, etc.)
   - This is guaranteed by the ERC-721 contract
   - No two NFTs can have the same tokenId

2. **Image/Content Uniqueness** ⚠️ (Your Responsibility)
   - Each NFT should have a unique image
   - This is NOT automatically enforced
   - You must ensure images are different

---

## How Your Contract Ensures Uniqueness

### Token ID Uniqueness (Automatic)

Your NFT contract automatically ensures each NFT has a unique token ID:

```solidity
// In your NFT.sol contract
uint256 private _tokenIdCounter;

function mint() external returns (uint256) {
    uint256 tokenId = _tokenIdCounter;
    _tokenIdCounter++;  // Each mint gets a unique ID
    _safeMint(to, tokenId);
    return tokenId;
}
```

**This means:**
- Token #1 is unique
- Token #2 is unique
- Token #3 is unique
- etc.

**Even if two NFTs have the same image, they are still unique NFTs** because they have different token IDs.

---

## Ensuring Image Uniqueness

### Option 1: Generate Unique Images Programmatically (Recommended)

Use NFT generation tools to create unique combinations:

#### Tools:
- **HashLips Art Engine** - Generate unique NFT collections
- **NFT Art Generator** - Create variations programmatically
- **Custom Scripts** - Python/JavaScript to combine layers

#### Example Workflow:
```
Layers/
  ├── Background/
  │   ├── Blue.png
  │   ├── Red.png
  │   └── Green.png
  ├── Body/
  │   ├── Type1.png
  │   └── Type2.png
  ├── Eyes/
  │   ├── Happy.png
  │   └── Sad.png
  └── Accessories/
      ├── Hat.png
      └── Glasses.png
```

Generate combinations programmatically to ensure uniqueness.

### Option 2: Create Individual Images Manually

If creating manually:
- ✅ Keep a checklist/spreadsheet of used images
- ✅ Name files with token ID: `1.png`, `2.png`, `3.png`
- ✅ Verify no duplicates before uploading

### Option 3: Use IPFS Content Hashing

IPFS automatically detects duplicate content:

```bash
# If you upload the same image twice, IPFS gives the same hash
ipfs add image1.png  # Returns: QmHash1
ipfs add image1.png  # Returns: QmHash1 (same hash!)

# Different images get different hashes
ipfs add image2.png  # Returns: QmHash2 (different!)
```

**This means:**
- If two NFTs have the same IPFS hash, they have the same image
- You can check for duplicates by comparing IPFS hashes

---

## Verifying Uniqueness

### Method 1: Check IPFS Hashes

```javascript
// Compare IPFS hashes in metadata
const metadata1 = { image: "ipfs://QmHash1/1.png" };
const metadata2 = { image: "ipfs://QmHash2/2.png" };

// If hashes are different, images are different
// If hashes are same, images are same (duplicate!)
```

### Method 2: Image Hash Comparison

Use cryptographic hashing to detect duplicates:

```javascript
// Using Node.js
const crypto = require('crypto');
const fs = require('fs');

function getImageHash(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(imageBuffer).digest('hex');
}

// Compare hashes
const hash1 = getImageHash('images/1.png');
const hash2 = getImageHash('images/2.png');

if (hash1 === hash2) {
  console.log('⚠️ Duplicate images detected!');
}
```

### Method 3: Visual Comparison Script

Create a script to check for duplicates:

```javascript
// check-duplicates.js
const fs = require('fs');
const crypto = require('crypto');

const imagesDir = './images';
const files = fs.readdirSync(imagesDir);
const hashes = new Map();

files.forEach(file => {
  if (file.endsWith('.png') || file.endsWith('.jpg')) {
    const filePath = `${imagesDir}/${file}`;
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    if (hashes.has(hash)) {
      console.log(`❌ DUPLICATE: ${file} is same as ${hashes.get(hash)}`);
    } else {
      hashes.set(hash, file);
      console.log(`✅ Unique: ${file}`);
    }
  }
});
```

---

## Best Practices

### 1. ✅ Use Token ID in Filename
```
images/
  ├── 1.png  (for token #1)
  ├── 2.png  (for token #2)
  └── 3.png  (for token #3)
```

### 2. ✅ Generate Images Programmatically
- Use NFT generation tools
- Ensure algorithm prevents duplicates
- Test before minting

### 3. ✅ Verify Before Deployment
- Run duplicate detection script
- Check IPFS hashes
- Review metadata

### 4. ✅ Store Image Hashes
Keep a record of image hashes to verify uniqueness:

```json
{
  "tokenId": 1,
  "imageHash": "abc123...",
  "ipfsHash": "QmHash1",
  "image": "ipfs://QmHash1/1.png"
}
```

### 5. ✅ Use Metadata Attributes
Even if images are similar, make metadata unique:

```json
{
  "name": "NFT #1",
  "attributes": [
    { "trait_type": "Rarity", "value": "Common" },
    { "trait_type": "Color", "value": "Blue" },
    { "trait_type": "Level", "value": 1 }
  ]
}
```

---

## What Makes an NFT Unique?

An NFT is considered unique if:

1. ✅ **Unique Token ID** (automatic - guaranteed by contract)
2. ✅ **Unique Image** (your responsibility)
3. ✅ **Unique Metadata** (your responsibility)
4. ✅ **Unique Attributes** (optional but recommended)

---

## Common Scenarios

### Scenario 1: Same Image, Different Token IDs
```
Token #1: image = "ipfs://QmHash1/1.png"
Token #2: image = "ipfs://QmHash1/1.png"  (same image!)
```

**Result:** 
- ✅ Still unique NFTs (different token IDs)
- ⚠️ But same image (may not be desired)

### Scenario 2: Different Images, Different Token IDs
```
Token #1: image = "ipfs://QmHash1/1.png"
Token #2: image = "ipfs://QmHash2/2.png"  (different image!)
```

**Result:**
- ✅ Unique NFTs
- ✅ Unique images
- ✅ Best practice!

### Scenario 3: Programmatic Generation
```
Token #1: Blue background + Type1 body + Happy eyes
Token #2: Red background + Type2 body + Sad eyes
Token #3: Blue background + Type1 body + Happy eyes  (duplicate!)
```

**Result:**
- ⚠️ Token #3 is a duplicate of Token #1
- Use generation algorithm that prevents duplicates

---

## Tools for Ensuring Uniqueness

### 1. HashLips Art Engine
- Generates unique NFT combinations
- Prevents duplicates automatically
- Open source

### 2. IPFS
- Detects duplicate content (same hash)
- Decentralized storage
- Content addressing

### 3. Image Hash Scripts
- Custom scripts to check duplicates
- SHA-256 hashing
- Batch processing

### 4. Metadata Validators
- Verify metadata uniqueness
- Check attribute combinations
- Validate JSON structure

---

## Summary

**Your contract automatically ensures:**
- ✅ Each NFT has a unique token ID
- ✅ No two NFTs can have the same token ID

**You must ensure:**
- ✅ Each NFT has a unique image (or intentionally allow duplicates)
- ✅ Metadata reflects uniqueness
- ✅ Use tools to verify before deployment

**Remember:**
- Token ID uniqueness is automatic
- Image uniqueness is your responsibility
- Use IPFS hashes to detect duplicate images
- Generate images programmatically for best results

