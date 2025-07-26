#!/usr/bin/env node

/**
 * Process batch of Google Apps Script projects
 */

const { downloadAndClean } = require('./gas-download-and-clean.js');
const fs = require('fs').promises;
const path = require('path');

const projectUrls = [
  'https://script.google.com/home/projects/1oqdWQ_2UvPaq-fYrnPFNCd7lz-VM2fS6wI2-H91g3YvZWd9JAHKzujT7/edit',
  'https://script.google.com/home/projects/1d0FudXyh59XpeOxytVUQ3awK4yySswcJ0yVTVX9aBq0fxdFAkxlBSmG_/edit',
  'https://script.google.com/home/projects/1AiOkIR3LNScciHDlQ18rCok0cqNCu8mNrth2diparO01HTZClUIH8Pdm/edit',
  'https://script.google.com/home/projects/1BoAil5sbBFK3hUynzIY17RlqD8coO9-dtz7jOd_G219l0uvcgJqEengG/edit',
  'https://script.google.com/home/projects/1vhMY3mU3sDIIeN76Kg9s6KqJ8rtg67-1s0sH1DJvXE1DulWaSAxZgelA/edit',
  'https://script.google.com/home/projects/1a20kP1ZHd4e4EYnd6-66MnlvLBqCQ0YomidFIk5-k5ldylJcwArU1eUO/edit',
  'https://script.google.com/home/projects/1d_m-Aerq19OmxkNpgmfxYr6laSLXMYYy2UwAhQBVRVW52XNK07XFpfqH/edit',
  'https://script.google.com/home/projects/1ZjEYnds0du2Rq2tDheL4aql_rOUNtw2NwdSzj_PKHEopbjCBrQzTAFLz/edit',
  'https://script.google.com/home/projects/1vVmQZZJ5hubSNgI8wHQuswc4yxv7NY2DdeSxYcdEcqTfoARlj0Tf8KnO/edit',
  'https://script.google.com/home/projects/1ge5XHAxDsN27d0cXd1_euTyhTkVQwJFn7av5LBNIi8sMzSYY1BjijVkI/edit',
  'https://script.google.com/home/projects/1yl49IHvRrL6Y0rrdLe0xkodEHWSFceOMpe4GSq6K32IO3JV7wD54Xyy5/edit',
  'https://script.google.com/home/projects/1XBl8K4uzUz-Rz-13GAJhbmKodGXFPnZB4PXKfvlc68xpZh2psnTMvtcp/edit',
  'https://script.google.com/home/projects/1J-KGmuR5tvGGiZCnTG5mfMdxtqdl6cAGZHXnDYdvWIxgh1po8zJ62u3l/edit',
  'https://script.google.com/home/projects/17oV0EiF1WPaTUwGuvg-prwLZjiGh7lPmzhw7B_o2ZNjN0UG0uu2BJdO-/edit',
  'https://script.google.com/home/projects/13n-CWW-Y2BKd7xWjOVd4sqgXDubXGWM8y0hgO_0gRsuUDJZFoJxx64Bz/edit',
  'https://script.google.com/home/projects/1Ivn4NljC6HZ0VTR-AiZahS9FbErXAo9EpIm70y2oN51GhrSugYHcqBp1/edit',
  'https://script.google.com/home/projects/1WgYt9mAjkDF6jixxf6C4nRSfRLt9uGYzp33HEpL_L3t99JUQ15jrq8qb/edit',
  'https://script.google.com/home/projects/16wYW45QQx5BTBx3qohPGxiiK2nNqfs4nOyoBztu70JTDo5_UIN1Uk4e1/edit'
];

async function processBatch() {
  console.log(`\n🚀 Processing ${projectUrls.length} Google Apps Script projects\n`);
  
  const results = {
    processed: [],
    empty: [],
    errors: [],
    withContent: []
  };
  
  for (let i = 0; i < projectUrls.length; i++) {
    const url = projectUrls[i];
    const scriptIdMatch = url.match(/projects\/([^\/]+)/);
    
    if (!scriptIdMatch) {
      console.log(`❌ Could not extract script ID from: ${url}`);
      results.errors.push({ url, error: 'Invalid URL format' });
      continue;
    }
    
    const scriptId = scriptIdMatch[1];
    const projectName = `External-Project-${i + 1}`;
    
    console.log(`\n[${i + 1}/${projectUrls.length}] Processing ${projectName}...`);
    
    const result = await downloadAndClean(scriptId, projectName);
    
    if (result.status === 'empty') {
      results.empty.push({ scriptId, projectName, url });
    } else if (result.status === 'kept') {
      results.withContent.push({ scriptId, projectName, path: result.path, url });
    } else {
      results.errors.push({ scriptId, projectName, error: result.error, url });
    }
    
    results.processed.push({ scriptId, projectName, ...result });
  }
  
  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📊 BATCH PROCESSING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total processed: ${results.processed.length}`);
  console.log(`📁 Projects with content: ${results.withContent.length}`);
  console.log(`🗑️  Empty projects: ${results.empty.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  
  // Save detailed report
  const reportPath = path.join(__dirname, '../../docs/BATCH_PROJECTS_REPORT.md');
  let report = '# Batch External Projects Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total projects: ${projectUrls.length}\n`;
  report += `- Projects with content: ${results.withContent.length}\n`;
  report += `- Empty projects: ${results.empty.length}\n`;
  report += `- Errors: ${results.errors.length}\n\n`;
  
  if (results.withContent.length > 0) {
    report += `## Projects with Content\n\n`;
    results.withContent.forEach((p, i) => {
      report += `### ${i + 1}. ${p.projectName}\n`;
      report += `- Script ID: ${p.scriptId}\n`;
      report += `- Path: ${p.path}\n`;
      report += `- URL: ${p.url}\n\n`;
    });
  }
  
  if (results.empty.length > 0) {
    report += `## Empty Projects (To Delete)\n\n`;
    results.empty.forEach((p, i) => {
      report += `### ${i + 1}. ${p.projectName}\n`;
      report += `- Script ID: ${p.scriptId}\n`;
      report += `- Delete URL: https://script.google.com/d/${p.scriptId}/edit\n`;
      report += `- Original: ${p.url}\n\n`;
    });
  }
  
  if (results.errors.length > 0) {
    report += `## Errors\n\n`;
    results.errors.forEach((p, i) => {
      report += `### ${i + 1}. ${p.projectName || 'Unknown'}\n`;
      report += `- Error: ${p.error}\n`;
      report += `- URL: ${p.url}\n\n`;
    });
  }
  
  await fs.writeFile(reportPath, report);
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return results;
}

// Run if called directly
if (require.main === module) {
  processBatch().catch(console.error);
}

module.exports = { processBatch };