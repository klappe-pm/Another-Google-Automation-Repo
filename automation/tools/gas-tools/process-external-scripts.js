#!/usr/bin/env node

/**
 * Process and migrate external scripts to appropriate service directories
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function processExternalScripts() {
  console.log('🔄 Processing external scripts...\n');
  
  const tempDir = path.join(__dirname, '../../temp/external-projects');
  const appsDir = path.join(__dirname, '../../apps');
  
  // Map of script patterns to service directories
  const serviceMapping = {
    gmail: /gmail|email|label/i,
    drive: /drive|folder|file.*tree/i,
    sheets: /sheet|tab|style.*sheet|sort.*sheet/i,
    calendar: /calendar|event|cal.*export/i,
    photos: /photo|album/i,
    tasks: /task|todo/i,
  };
  
  const projects = await fs.readdir(tempDir);
  const migrationLog = [];
  
  for (const project of projects) {
    const projectPath = path.join(tempDir, project);
    const stat = await fs.stat(projectPath);
    
    if (!stat.isDirectory()) continue;
    
    console.log(`\n📁 Processing ${project}...`);
    const files = await fs.readdir(projectPath);
    
    for (const file of files) {
      if (!file.endsWith('.js') || file === 'appsscript.json') continue;
      
      const filePath = path.join(projectPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Determine service based on filename and content
      let service = 'utility'; // default
      const fileName = file.toLowerCase();
      
      for (const [serviceName, pattern] of Object.entries(serviceMapping)) {
        if (pattern.test(fileName) || pattern.test(content.slice(0, 1000))) {
          service = serviceName;
          break;
        }
      }
      
      // Generate proper filename
      let newFileName = file
        .replace(/\.js$/, '.gs')
        .replace(/^v\d+[\.-]*/i, '') // Remove version prefixes
        .replace(/\s+/g, '-')
        .replace(/[()]/g, '')
        .toLowerCase();
      
      // Ensure unique filename
      const destPath = path.join(appsDir, service, 'src', newFileName);
      let finalPath = destPath;
      let counter = 1;
      
      while (await fileExists(finalPath)) {
        const baseName = newFileName.replace('.gs', '');
        finalPath = path.join(appsDir, service, 'src', `${baseName}-v${counter}.gs`);
        counter++;
      }
      
      // Copy and rename file
      await fs.copyFile(filePath, finalPath);
      
      migrationLog.push({
        original: file,
        project: project,
        service: service,
        newPath: finalPath.replace(path.join(__dirname, '../../'), ''),
        newName: path.basename(finalPath)
      });
      
      console.log(`  ✅ ${file} → ${service}/src/${path.basename(finalPath)}`);
    }
  }
  
  // Apply smart formatting to all migrated scripts
  console.log('\n🤖 Applying smart formatting to all scripts...');
  const allScripts = migrationLog.map(m => m.newPath).join(' ');
  
  try {
    execSync(`node automation/dev-tools/gas-formatter-smart.js ${allScripts}`, {
      cwd: path.join(__dirname, '../../'),
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Error formatting scripts:', error.message);
  }
  
  // Generate migration report
  const report = generateMigrationReport(migrationLog);
  await fs.writeFile(
    path.join(__dirname, '../../docs/EXTERNAL_SCRIPTS_MIGRATION.md'),
    report
  );
  
  console.log('\n✅ Migration complete!');
  console.log(`📄 Report saved to: docs/EXTERNAL_SCRIPTS_MIGRATION.md`);
  
  return migrationLog;
}

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

function generateMigrationReport(log) {
  let report = '# External Scripts Migration Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total scripts migrated: ${log.length}\n\n`;
  
  // Group by service
  const byService = {};
  log.forEach(entry => {
    if (!byService[entry.service]) {
      byService[entry.service] = [];
    }
    byService[entry.service].push(entry);
  });
  
  report += '## Scripts by Service\n\n';
  
  for (const [service, scripts] of Object.entries(byService)) {
    report += `### ${service.charAt(0).toUpperCase() + service.slice(1)} (${scripts.length} scripts)\n\n`;
    report += '| Original File | Project | New Location |\n';
    report += '|---------------|---------|-------------|\n';
    
    scripts.forEach(s => {
      report += `| ${s.original} | ${s.project} | ${s.newPath} |\n`;
    });
    
    report += '\n';
  }
  
  return report;
}

// Run if called directly
if (require.main === module) {
  processExternalScripts().catch(console.error);
}

module.exports = { processExternalScripts };