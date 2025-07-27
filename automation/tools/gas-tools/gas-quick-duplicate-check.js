#!/usr/bin/env node

/**
 * Quick duplicate check focusing on exact matches
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

async function quickDuplicateCheck() {
  console.log('🔍 Quick duplicate check...\n');
  
  const repoRoot = path.join(__dirname, '../..');
  const scripts = [];
  
  // Collect scripts
  console.log('Collecting scripts...');
  
  // From apps
  const appsDir = path.join(repoRoot, 'apps');
  const services = await fs.readdir(appsDir);
  
  for (const service of services) {
    const srcDir = path.join(appsDir, service, 'src');
    const files = await fs.readdir(srcDir).catch(() => []);
    
    for (const file of files) {
      if (file.endsWith('.gs')) {
        const filePath = path.join(srcDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const hash = crypto.createHash('md5').update(content).digest('hex');
        
        scripts.push({
          path: path.relative(repoRoot, filePath),
          filename: file,
          service,
          hash,
          size: content.length,
          source: 'repository'
        });
      }
    }
  }
  
  // From txt files
  const txtDir = path.join(repoRoot, 'txt to convert');
  const txtFiles = await fs.readdir(txtDir).catch(() => []);
  
  for (const file of txtFiles) {
    if (file.endsWith('.txt')) {
      const filePath = path.join(txtDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const hash = crypto.createHash('md5').update(content).digest('hex');
      
      scripts.push({
        path: path.relative(repoRoot, filePath),
        filename: file,
        service: 'unknown',
        hash,
        size: content.length,
        source: 'txt'
      });
    }
  }
  
  console.log(`Found ${scripts.length} scripts\n`);
  
  // Find exact duplicates
  const hashMap = {};
  
  for (const script of scripts) {
    if (!hashMap[script.hash]) {
      hashMap[script.hash] = [];
    }
    hashMap[script.hash].push(script);
  }
  
  // Report duplicates
  console.log('EXACT DUPLICATES:\n');
  
  let duplicateCount = 0;
  let totalDuplicateSize = 0;
  
  for (const [hash, files] of Object.entries(hashMap)) {
    if (files.length > 1) {
      duplicateCount++;
      console.log(`Hash: ${hash.substring(0, 8)}`);
      
      for (const file of files) {
        console.log(`  - ${file.path} (${file.source}, ${file.size} bytes)`);
        if (files.indexOf(file) > 0) {
          totalDuplicateSize += file.size;
        }
      }
      console.log('');
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`- Total scripts: ${scripts.length}`);
  console.log(`- Duplicate sets: ${duplicateCount}`);
  console.log(`- Space wasted: ${(totalDuplicateSize / 1024).toFixed(1)} KB`);
  
  // Show name-based duplicates
  console.log('\n\nNAME-BASED DUPLICATES:\n');
  
  const nameGroups = {};
  for (const script of scripts) {
    const baseName = script.filename.replace(/\.(gs|txt)$/, '').toLowerCase();
    if (!nameGroups[baseName]) {
      nameGroups[baseName] = [];
    }
    nameGroups[baseName].push(script);
  }
  
  for (const [name, files] of Object.entries(nameGroups)) {
    if (files.length > 1) {
      console.log(`${name}:`);
      for (const file of files) {
        console.log(`  - ${file.path} (${file.source})`);
      }
    }
  }
}

quickDuplicateCheck().catch(console.error);