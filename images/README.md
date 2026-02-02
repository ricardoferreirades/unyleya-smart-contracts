# NFT Images Directory

This directory is for storing NFT images locally before uploading them to a permanent hosting solution.

## Image Requirements

- **Format**: PNG, JPG, or GIF (PNG recommended for transparency)
- **Recommended Size**: 512x512, 1024x1024, or 2048x2048 pixels
- **File Size**: Keep under 10MB for better performance
- **Naming**: Use token ID (e.g., `1.png`, `2.png`, `3.png`)

## Hosting Options

### 1. IPFS (Recommended for Production) 🌟

**Best for**: Decentralized, permanent storage

**How to use**:
1. Upload images to IPFS using:
   - [Pinata](https://www.pinata.cloud/) (free tier available)
   - [NFT.Storage](https://nft.storage/) (free)
   - [Web3.Storage](https://web3.storage/) (free)
   - Command line: `ipfs add images/1.png`

2. Get the IPFS hash (CID) and use it in metadata:
   ```json
   "image": "ipfs://QmYourHashHere/1.png"
   ```
   Or use a gateway:
   ```json
   "image": "https://ipfs.io/ipfs/QmYourHashHere/1.png"
   ```

**Example**:
```json
{
  "image": "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/1.png"
}
```

### 2. Web Hosting / CDN

**Best for**: Quick testing, centralized control

**How to use**:
1. Upload images to your web server or CDN
2. Use the full URL in metadata:
   ```json
   "image": "https://yourdomain.com/images/1.png"
   ```

**Example**:
```json
{
  "image": "https://example.com/images/1.png"
}
```

### 3. Cloud Storage (AWS S3, Google Cloud, etc.)

**Best for**: Scalable, reliable hosting

**How to use**:
1. Upload to cloud storage bucket
2. Make files publicly accessible
3. Use the public URL in metadata

**Example**:
```json
{
  "image": "https://your-bucket.s3.amazonaws.com/images/1.png"
}
```

### 4. Arweave (Permanent Storage)

**Best for**: Truly permanent, decentralized storage

**How to use**:
1. Upload to Arweave
2. Use Arweave URL in metadata

**Example**:
```json
{
  "image": "https://arweave.net/your-transaction-id"
}
```

## Local Development

For local testing, you can temporarily use:
- Local server (e.g., `http://localhost:8000/images/1.png`)
- GitHub raw URLs (not recommended for production)
- Temporary hosting services

## Important Notes

⚠️ **Never use local file paths** like `file:///` or relative paths - these won't work in production!

✅ **Always use full URLs** (http/https) or IPFS URIs (ipfs://)

✅ **Keep images consistent** - same dimensions and format for all NFTs in a collection

✅ **Optimize images** - Compress images to reduce file size while maintaining quality

## Workflow

1. **Create/Design** your NFT images
2. **Save** them in this `images/` directory
3. **Upload** to IPFS or your chosen hosting solution
4. **Update** metadata JSON files with the correct image URLs
5. **Deploy** metadata to IPFS or hosting
6. **Set** the base URI or individual token URIs in your NFT contract

