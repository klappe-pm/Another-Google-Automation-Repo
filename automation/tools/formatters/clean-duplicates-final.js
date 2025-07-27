#!/usr/bin/env node

/**
 * Final cleanup of duplicate scripts
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

async function cleanDuplicates() {
  console.log('🧹 Final duplicate cleanup...\n');
  
  const appsDir = path.join(__dirname, '../../apps');
  const allFiles = await findAllGsFiles(appsDir);
  
  // Group by content hash
  const contentGroups = new Map();
  
  for (const file of allFiles) {
    const content = await fs.readFile(file, 'utf8');
    const hash = crypto.createHash('md5').update(content).digest('hex');
    
    if (!contentGroups.has(hash)) {
      contentGroups.set(hash, []);
    }
    contentGroups.get(hash).push(file);
  }
  
  // Find and remove duplicates
  const duplicateSets = [];
  let totalRemoved = 0;
  
  for (const [hash, files] of contentGroups.entries()) {
    if (files.length > 1) {
      // Sort by quality - prefer files without version numbers
      files.sort((a, b) => {
        const aHasVersion = /-v\d+\.gs$/.test(a);
        const bHasVersion = /-v\d+\.gs$/.test(b);
        if (aHasVersion && !bHasVersion) return 1;
        if (!aHasVersion && bHasVersion) return -1;
        return a.length - b.length; // Prefer shorter names
      });
      
      const keep = files[0];
      const remove = files.slice(1);
      
      duplicateSets.push({
        keep: keep.replace(path.join(__dirname, '../../'), ''),
        remove: remove.map(f => f.replace(path.join(__dirname, '../../'), ''))
      });
      
      // Remove duplicates
      for (const file of remove) {
        await fs.unlink(file);
        console.log(`  🗑️  Removed: ${path.basename(file)}`);
        totalRemoved++;
      }
    }
  }
  
  console.log(`\n✅ Removed ${totalRemoved} duplicate files`);
  console.log(`📊 Kept ${duplicateSets.length} unique scripts`);
  
  // Update duplicate report
  if (duplicateSets.length > 0) {
    const report = generateDuplicateReport(duplicateSets);
    await fs.writeFile(
      path.join(__dirname, '../../docs/FINAL_DUPLICATE_CLEANUP.md'),
      report
    );
    console.log('📄 Report saved to: docs/FINAL_DUPLICATE_CLEANUP.md');
  }
  
  return { duplicateSets, totalRemoved };
}

async function findAllGsFiles(dir, files = []) {
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      await findAllGsFiles(fullPath, files);
    } else if (item.endsWith('.gs')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function generateDuplicateReport(duplicateSets) {
  let report = '# Final Duplicate Cleanup Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Duplicate sets found: ${duplicateSets.length}\n`;
  report += `- Total files removed: ${duplicateSets.reduce((sum, set) => sum + set.remove.length, 0)}\n\n`;
  
  report += '## Duplicate Sets\n\n';
  
  duplicateSets.forEach((set, i) => {
    report += `### Set ${i + 1}\n`;
    report += `**Kept**: ${set.keep}\n`;
    report += `**Removed**:\n`;
    set.remove.forEach(f => report += `- ${f}\n`);
    report += '\n';
  });
  
  return report;
}

// Run if called directly
if (require.main === module) {
  cleanDuplicates().catch(console.error);
}

module.exports = { cleanDuplicates };