#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images/optimized');

console.log('🔍 Checking available images in:', IMAGES_DIR);
console.log('=' .repeat(60));

// Get all files
const files = fs.readdirSync(IMAGES_DIR);

// Categorize files
const categories = {
  desktop: {
    jpg: [],
    webp: []
  },
  mobile: {
    jpg: [],
    webp: []
  },
  tablet: {
    jpg: [],
    webp: []
  }
};

files.forEach(file => {
  if (file.includes('-mobile')) {
    if (file.endsWith('.jpg')) categories.mobile.jpg.push(file);
    if (file.endsWith('.webp')) categories.mobile.webp.push(file);
  } else if (file.includes('-tablet')) {
    if (file.endsWith('.jpg')) categories.tablet.jpg.push(file);
    if (file.endsWith('.webp')) categories.tablet.webp.push(file);
  } else if (!file.includes('Dow Jones')) {
    if (file.endsWith('.jpg')) categories.desktop.jpg.push(file);
    if (file.endsWith('.webp')) categories.desktop.webp.push(file);
  }
});

// Report findings
console.log('📱 MOBILE IMAGES:');
console.log(`  JPG files: ${categories.mobile.jpg.length}`);
console.log(`  WebP files: ${categories.mobile.webp.length}`);
if (categories.mobile.webp.length === 0) {
  console.log('  ⚠️  No WebP versions for mobile images!');
}

console.log('\n💻 TABLET IMAGES:');
console.log(`  JPG files: ${categories.tablet.jpg.length}`);
console.log(`  WebP files: ${categories.tablet.webp.length}`);
if (categories.tablet.webp.length === 0) {
  console.log('  ⚠️  No WebP versions for tablet images!');
}

console.log('\n🖥️  DESKTOP IMAGES:');
console.log(`  JPG files: ${categories.desktop.jpg.length}`);
console.log(`  WebP files: ${categories.desktop.webp.length}`);

// Check for missing WebP versions
console.log('\n' + '=' .repeat(60));
console.log('📊 SUMMARY:');

const totalJpg = categories.desktop.jpg.length + categories.mobile.jpg.length + categories.tablet.jpg.length;
const totalWebp = categories.desktop.webp.length + categories.mobile.webp.length + categories.tablet.webp.length;

console.log(`Total JPG files: ${totalJpg}`);
console.log(`Total WebP files: ${totalWebp}`);

if (categories.mobile.webp.length === 0 && categories.tablet.webp.length === 0) {
  console.log('\n⚠️  IMPORTANT: WebP versions only exist for desktop images.');
  console.log('The smart loader has been configured to only use WebP for desktop images.');
  console.log('Mobile and tablet will use optimized JPG versions.');
}

// File size comparison
console.log('\n📦 FILE SIZES (sample):');
const sampleFiles = [
  'A Moving Mountain #1.jpg',
  'A Moving Mountain #1.webp',
  'A Moving Mountain #1-mobile.jpg',
  'A Moving Mountain #1-tablet.jpg'
];

sampleFiles.forEach(file => {
  const filePath = path.join(IMAGES_DIR, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeInKB = (stats.size / 1024).toFixed(1);
    const type = file.includes('-mobile') ? '📱' : file.includes('-tablet') ? '💻' : file.endsWith('.webp') ? '🎯' : '🖥️';
    console.log(`  ${type} ${file}: ${sizeInKB} KB`);
  }
});

console.log('\n✅ Image check complete!');