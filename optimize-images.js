#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const INPUT_DIR = './public/images';
const OUTPUT_DIR = './public/images/optimized';
const BACKUP_DIR = './public/images/original';

// Optimization settings
const OPTIMIZATION_CONFIGS = {
  // High quality for desktop viewing
  desktop: {
    width: 2400,
    height: 1600,
    quality: 85,
    suffix: ''
  },
  // Medium quality for tablets
  tablet: {
    width: 1200,
    height: 800,
    quality: 80,
    suffix: '-tablet'
  },
  // Lower quality for mobile
  mobile: {
    width: 800,
    height: 533,
    quality: 75,
    suffix: '-mobile'
  }
};

async function ensureDirectories() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

async function backupOriginals() {
  const files = await fs.readdir(INPUT_DIR);
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
  
  for (const file of imageFiles) {
    const srcPath = path.join(INPUT_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    
    try {
      await fs.copyFile(srcPath, backupPath);
      console.log(`✅ Backed up: ${file}`);
    } catch (error) {
      console.error(`❌ Failed to backup ${file}:`, error.message);
    }
  }
}

async function optimizeImage(inputPath, outputPath, config) {
  try {
    const { width, height, quality } = config;
    
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputPath);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
    return false;
  }
}

async function createWebPVersions(inputPath, outputPath) {
  try {
    const config = OPTIMIZATION_CONFIGS.desktop;
    const webpPath = outputPath.replace('.jpg', '.webp');
    
    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: config.quality,
        progressive: true
      })
      .toFile(webpPath);
    
    console.log(`✅ Created WebP: ${path.basename(webpPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create WebP for ${inputPath}:`, error.message);
    return false;
  }
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function optimizeAllImages() {
  console.log('🖼️  Starting image optimization...\n');
  
  await ensureDirectories();
  
  const files = await fs.readdir(INPUT_DIR);
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
  
  if (imageFiles.length === 0) {
    console.log('No images found to optimize.');
    return;
  }
  
  console.log(`Found ${imageFiles.length} images to optimize\n`);
  
  // Backup originals first
  console.log('📦 Backing up original images...');
  await backupOriginals();
  console.log('');
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const file of imageFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const originalSize = await getFileSize(inputPath);
    totalOriginalSize += originalSize;
    
    console.log(`🔧 Optimizing: ${file} (${await formatBytes(originalSize)})`);
    
    // Generate optimized versions
    for (const [configName, config] of Object.entries(OPTIMIZATION_CONFIGS)) {
      const outputFileName = file.replace(/\.(jpg|jpeg|png)$/i, `${config.suffix}.jpg`);
      const outputPath = path.join(OUTPUT_DIR, outputFileName);
      
      const success = await optimizeImage(inputPath, outputPath, config);
      
      if (success) {
        const optimizedSize = await getFileSize(outputPath);
        totalOptimizedSize += optimizedSize;
        
        const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        console.log(`   ✅ ${configName}: ${await formatBytes(optimizedSize)} (-${reduction}%)`);
        
        // Create WebP version for desktop config
        if (configName === 'desktop') {
          await createWebPVersions(inputPath, outputPath);
        }
      }
    }
    
    console.log('');
  }
  
  // Summary
  console.log('📊 Optimization Summary:');
  console.log(`   Original total size: ${await formatBytes(totalOriginalSize)}`);
  console.log(`   Optimized total size: ${await formatBytes(totalOptimizedSize)}`);
  console.log(`   Total reduction: ${((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)}%`);
  console.log(`   Space saved: ${await formatBytes(totalOriginalSize - totalOptimizedSize)}`);
  console.log('');
  console.log('✅ Image optimization complete!');
  console.log('');
  console.log('📁 Files created:');
  console.log('   - Original images backed up to: ./public/images/original/');
  console.log('   - Optimized images saved to: ./public/images/optimized/');
  console.log('');
  console.log('🔄 Next steps:');
  console.log('   1. Review the optimized images');
  console.log('   2. Update your code to use the optimized versions');
  console.log('   3. Consider implementing responsive images');
}

// Run the optimization
optimizeAllImages().catch(console.error);