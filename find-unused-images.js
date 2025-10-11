/**
 * Unused Image Analyzer
 * 
 * This script analyzes your uploads directory to find images that are not referenced
 * in your database or configuration files.
 */

const fs = require('fs-extra');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findUnusedImages() {
  try {
    console.log('🔍 Starting unused image analysis...\n');

    // 1. Get all image files from uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    console.log('📁 Scanning uploads directory:', uploadsDir);
    
    const allImageFiles = await getAllImageFiles(uploadsDir);
    console.log(`Found ${allImageFiles.length} total image files\n`);

    // 2. Get all referenced images from database
    console.log('🗄️ Checking database for referenced images...');
    const referencedImages = await getReferencedImages();
    console.log(`Found ${referencedImages.size} referenced images in database\n`);

    // 3. Get images referenced in config files
    console.log('⚙️ Checking configuration files...');
    const configImages = await getConfigReferencedImages();
    console.log(`Found ${configImages.size} referenced images in config files\n`);

    // 4. Combine all referenced images
    const allReferencedImages = new Set([...referencedImages, ...configImages]);
    console.log(`Total unique referenced images: ${allReferencedImages.size}\n`);

    // 5. Find unused images
    const unusedImages = allImageFiles.filter(imagePath => {
      const relativePath = imagePath.replace(process.cwd(), '').replace(/\\/g, '/');
      return !allReferencedImages.has(relativePath);
    });

    // 6. Display results
    console.log('═'.repeat(60));
    console.log('📊 ANALYSIS RESULTS');
    console.log('═'.repeat(60));
    console.log(`Total images found: ${allImageFiles.length}`);
    console.log(`Referenced images: ${allReferencedImages.size}`);
    console.log(`Unused images: ${unusedImages.length}`);
    console.log();

    if (unusedImages.length > 0) {
      console.log('🗑️ UNUSED IMAGES TO DELETE:');
      console.log('─'.repeat(60));
      
      let totalSize = 0;
      unusedImages.forEach((imagePath, index) => {
        const stats = fs.statSync(imagePath);
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += stats.size;
        
        console.log(`${index + 1}. ${imagePath}`);
        console.log(`   Size: ${sizeKB} KB`);
        console.log();
      });
      
      const totalSizeMB = Math.round(totalSize / (1024 * 1024));
      console.log(`Total space to be freed: ${totalSizeMB} MB`);
      console.log();
      
      // Write paths to a file for easy deletion
      const pathsFile = path.join(process.cwd(), 'unused-images-paths.txt');
      await fs.writeFile(pathsFile, unusedImages.join('\n'));
      console.log(`📝 Unused image paths saved to: ${pathsFile}`);
      
    } else {
      console.log('✅ No unused images found! Your uploads directory is clean.');
    }

  } catch (error) {
    console.error('❌ Error analyzing images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getAllImageFiles(dir) {
  const imageFiles = [];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  
  async function scanDirectory(currentDir) {
    const items = await fs.readdir(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        await scanDirectory(fullPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (imageExtensions.includes(ext)) {
          imageFiles.push(fullPath);
        }
      }
    }
  }
  
  await scanDirectory(dir);
  return imageFiles;
}

async function getReferencedImages() {
  const referencedImages = new Set();
  
  try {
    // Get all recipes
    const recipes = await prisma.recipe.findMany({
      select: {
        img: true,
        heroImage: true,
        images: true,
        author: true
      }
    });
    
    for (const recipe of recipes) {
      // Main image
      if (recipe.img) {
        referencedImages.add(recipe.img);
      }
      
      // Hero image
      if (recipe.heroImage) {
        referencedImages.add(recipe.heroImage);
      }
      
      // Additional images array
      if (recipe.images && Array.isArray(recipe.images)) {
        recipe.images.forEach(img => {
          if (img) referencedImages.add(img);
        });
      }
      
      // Author image (stored in JSON)
      if (recipe.author && typeof recipe.author === 'object') {
        const author = recipe.author;
        if (author.img) {
          referencedImages.add(author.img);
        }
        if (author.avatar) {
          referencedImages.add(author.avatar);
        }
      }
    }
    
  } catch (error) {
    console.error('Error querying database:', error);
  }
  
  return referencedImages;
}

async function getConfigReferencedImages() {
  const referencedImages = new Set();
  
  try {
    // Check site.json
    const siteConfigPath = path.join(process.cwd(), 'uploads', 'content', 'site.json');
    if (await fs.pathExists(siteConfigPath)) {
      const siteConfig = await fs.readJson(siteConfigPath);
      if (siteConfig.logoImage) referencedImages.add(siteConfig.logoImage);
      if (siteConfig.favicon) referencedImages.add(siteConfig.favicon);
    }
    
    // Check home.json
    const homeConfigPath = path.join(process.cwd(), 'uploads', 'content', 'home.json');
    if (await fs.pathExists(homeConfigPath)) {
      const homeConfig = await fs.readJson(homeConfigPath);
      if (homeConfig.heroBackgroundImage) referencedImages.add(homeConfig.heroBackgroundImage);
      if (homeConfig.logoImage) referencedImages.add(homeConfig.logoImage);
      if (homeConfig.favicon) referencedImages.add(homeConfig.favicon);
    }
    
    // Check other content files
    const contentDir = path.join(process.cwd(), 'uploads', 'content');
    if (await fs.pathExists(contentDir)) {
      const contentFiles = await fs.readdir(contentDir);
      
      for (const file of contentFiles) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(contentDir, file);
            const content = await fs.readJson(filePath);
            
            // Look for image references in the content
            const contentStr = JSON.stringify(content);
            const imageMatches = contentStr.match(/\/uploads\/[^"'\s]+\.(webp|jpg|jpeg|png|gif|svg)/g);
            
            if (imageMatches) {
              imageMatches.forEach(match => referencedImages.add(match));
            }
          } catch (error) {
            console.warn(`Could not parse ${file}:`, error.message);
          }
        }
      }
    }
    
    // Check data files for hardcoded image references
    const dataDir = path.join(process.cwd(), 'data');
    if (await fs.pathExists(dataDir)) {
      const dataFiles = await fs.readdir(dataDir);
      
      for (const file of dataFiles) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          try {
            const filePath = path.join(dataDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            
            // Look for image references
            const imageMatches = content.match(/\/uploads\/[^"'\s]+\.(webp|jpg|jpeg|png|gif|svg)/g);
            
            if (imageMatches) {
              imageMatches.forEach(match => referencedImages.add(match));
            }
          } catch (error) {
            console.warn(`Could not read ${file}:`, error.message);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking config files:', error);
  }
  
  return referencedImages;
}

// Run the analysis
findUnusedImages();