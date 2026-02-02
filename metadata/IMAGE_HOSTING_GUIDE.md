# NFT Image Hosting Guide

## Quick Start

1. **Place your images** in the `images/` directory
2. **Upload to IPFS** (recommended) or your hosting service
3. **Update metadata** with the image URLs
4. **Set token URIs** in your NFT contract

## Recommended: IPFS Setup

### Using Pinata (Easiest)

1. Sign up at [pinata.cloud](https://www.pinata.cloud/)
2. Upload your images folder
3. Get the IPFS hash (CID)
4. Update metadata:

```json
{
  "name": "NFT #1",
  "description": "This is the first NFT in the collection",
  "image": "ipfs://QmYourHashHere/1.png",
  ...
}
```

### Using NFT.Storage (Free)

1. Go to [nft.storage](https://nft.storage/)
2. Upload files via web interface or API
3. Get the IPFS URL
4. Use in metadata

### Using Command Line (IPFS)

```bash
# Install IPFS
# macOS: brew install ipfs
# Or download from https://ipfs.io/

# Start IPFS daemon
ipfs daemon

# In another terminal, add your images
ipfs add -r images/

# You'll get a hash like: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
# Use it in metadata: ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/1.png
```

## Metadata Examples

### IPFS (Recommended)
```json
{
  "image": "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/1.png"
}
```

### IPFS Gateway (Alternative)
```json
{
  "image": "https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/1.png"
}
```

### Web Hosting
```json
{
  "image": "https://yourdomain.com/images/1.png"
}
```

### Arweave
```json
{
  "image": "https://arweave.net/your-transaction-id"
}
```

## Setting Token URIs in Contract

After uploading metadata, set the URIs in your NFT contract:

```javascript
// Set base URI (for all tokens)
await nft.setBaseURI("ipfs://QmYourMetadataHash/");

// Or set individual token URI
await nft.setTokenURI(1, "ipfs://QmYourMetadataHash/1.json");
```

## Best Practices

1. ✅ Use IPFS for permanent, decentralized storage
2. ✅ Keep image dimensions consistent (e.g., all 1024x1024)
3. ✅ Optimize file sizes (compress images)
4. ✅ Use PNG for transparency, JPG for photos
5. ✅ Test image URLs before deploying
6. ✅ Pin your IPFS content to prevent garbage collection

