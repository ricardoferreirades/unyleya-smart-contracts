const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

/**
 * Script to check for duplicate images in the images directory
 * 
 * Usage:
 *   node scripts/check-image-uniqueness.js
 */

function getImageHash(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(imageBuffer).digest('hex');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function checkImageUniqueness() {
  const imagesDir = path.join(__dirname, '..', 'images');
  
  // Check if images directory exists
  if (!fs.existsSync(imagesDir)) {
    console.log('❌ Images directory not found:', imagesDir);
    console.log('   Create the directory and add your images first.');
    process.exit(1);
  }

  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => 
    file.toLowerCase().endsWith('.png') || 
    file.toLowerCase().endsWith('.jpg') || 
    file.toLowerCase().endsWith('.jpeg') ||
    file.toLowerCase().endsWith('.gif') ||
    file.toLowerCase().endsWith('.webp')
  );

  if (imageFiles.length === 0) {
    console.log('⚠️  No image files found in images directory');
    process.exit(0);
  }

  console.log(`\n🔍 Checking ${imageFiles.length} images for duplicates...\n`);

  const hashes = new Map(); // hash -> array of filenames
  const duplicates = [];

  // Calculate hashes for all images
  imageFiles.forEach(file => {
    const filePath = path.join(imagesDir, file);
    const hash = getImageHash(filePath);
    
    if (hash) {
      if (hashes.has(hash)) {
        // Duplicate found
        const existingFiles = hashes.get(hash);
        existingFiles.push(file);
        duplicates.push({
          hash,
          files: existingFiles
        });
      } else {
        hashes.set(hash, [file]);
      }
    }
  });

  // Report results
  const uniqueImages = hashes.size;
  const duplicateCount = duplicates.length;

  console.log('📊 Results:');
  console.log(`   Total images: ${imageFiles.length}`);
  console.log(`   Unique images: ${uniqueImages}`);
  console.log(`   Duplicate groups: ${duplicateCount}`);
  console.log('');

  if (duplicates.length > 0) {
    console.log('❌ Duplicates found:\n');
    duplicates.forEach((dup, index) => {
      console.log(`   Group ${index + 1}:`);
      dup.files.forEach(file => {
        console.log(`     - ${file}`);
      });
      console.log(`     Hash: ${dup.hash.substring(0, 16)}...`);
      console.log('');
    });
    console.log('⚠️  Warning: These images are identical!');
    console.log('   Consider using different images for each NFT.\n');
    process.exit(1);
  } else {
    console.log('✅ All images are unique!');
    console.log('   No duplicates detected.\n');
    
    // Show file list
    console.log('📁 Image files:');
    imageFiles.forEach((file, index) => {
      const filePath = path.join(imagesDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${file} (${sizeKB} KB)`);
    });
    console.log('');
    process.exit(0);
  }
}

// Run the check
checkImageUniqueness();

