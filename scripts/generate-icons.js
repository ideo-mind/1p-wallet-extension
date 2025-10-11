#!/usr/bin/env node

/**
 * Icon Generator Script for 1P Wallet Extension
 *
 * This script helps generate the required icon sizes for the Chrome extension
 * from your updated logo.png file.
 *
 * Requirements:
 * - Node.js with sharp package installed
 * - Updated logo.png in the public/ directory
 *
 * Usage:
 * 1. Install sharp: npm install --save-dev sharp
 * 2. Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp package not found. Please install it first:');
  console.error('   npm install --save-dev sharp');
  process.exit(1);
}

const iconSizes = [
  { size: 16, name: 'icon16.png' },
  { size: 48, name: 'icon48.png' },
  { size: 128, name: 'icon128.png' }
];

const logoPath = path.join(__dirname, '../public/logo.png');
const iconsDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('❌ logo.png not found in public/ directory');
      console.error('   Please make sure your updated logo.png is in the public/ folder');
      process.exit(1);
    }

    // Create icons directory if it doesn't exist
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    console.log('🔄 Generating extension icons from logo.png...\n');

    // Generate each icon size
    for (const icon of iconSizes) {
      const outputPath = path.join(iconsDir, icon.name);

      await sharp(logoPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Also generate SVG version
    const svgPath = path.join(iconsDir, 'icon.svg');
    const svgContent = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <image href="../logo.png" width="128" height="128" />
</svg>`;

    fs.writeFileSync(svgPath, svgContent);
    console.log('✅ Generated icon.svg');

    console.log('\n🎉 All icons generated successfully!');
    console.log('\n📁 Generated files:');
    iconSizes.forEach(icon => {
      console.log(`   - public/icons/${icon.name}`);
    });
    console.log('   - public/icons/icon.svg');

    console.log('\n🚀 Your extension is ready with the new icons!');
    console.log('   Run "npm run build" to build the extension with updated icons.');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run the script
generateIcons();
