#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fix malformed comments in Google Apps Script files
 * - Replace malformed block comment starts
 * - Replace malformed block comment ends
 * - Replace malformed line comments
 */
function fixCommentSyntax(content) {
  return content
    // Fix block comment starts: '/ *' -> '/*'
    .replace(/\/ \*/g, '/*')
    // Fix block comment ends: '* /' -> '*/'
    .replace(/\* \//g, '*/')
    // Fix line comments: '/ /' -> '//' (including variations with spaces)
    .replace(/\/\s+\//g, '//')
    // Fix any remaining malformed comment patterns
    .replace(/\/\s+\*/g, '/*')
    .replace(/\*\s+\//g, '*/');
}

/**
 * Perform lint check on modified content using vm.Script for basic syntax validation
 */
function lintCheck(content) {
  const vm = require('vm');
  
  try {
    // Create a new script to check for syntax errors
    new vm.Script(content);
    return true;
  } catch (error) {
    console.error(`Syntax error detected: ${error.message}`);
    return false;
  }
}

/**
 * Recursively find all .gs files in a directory
 */
function findGsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findGsFiles(fullPath));
    } else if (item.endsWith('.gs')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Process a single .gs file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixCommentSyntax(content);
    
    if (content !== fixedContent) {
      if (lintCheck(fixedContent)) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`✅ Fixed: ${filePath}`);
        return true;
      } else {
        console.error(`❌ Linting failed for ${filePath}. Changes not applied.`);
        return false;
      }
    } else {
      console.log(`   No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  const appsDir = path.join(__dirname, 'apps');
  
  if (!fs.existsSync(appsDir)) {
    console.error('❌ Apps directory not found!');
    process.exit(1);
  }
  
  console.log('🔧 Fixing comment syntax in Google Apps Script files...\n');
  
  const gsFiles = findGsFiles(appsDir);
  console.log(`Found ${gsFiles.length} .gs files to check`);
  
  let fixedCount = 0;
  
  for (const file of gsFiles) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files checked: ${gsFiles.length}`);
  console.log(`   Files fixed: ${fixedCount}`);
  console.log(`   Files unchanged: ${gsFiles.length - fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 Comment syntax fixes completed successfully!');
    console.log('   You can now retry your Cloud Build deployment.');
  } else {
    console.log('\n✨ All files already have correct comment syntax.');
  }
}

if (require.main === module) {
  main();
}
