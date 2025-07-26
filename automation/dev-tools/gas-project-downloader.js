#!/usr/bin/env node

/**
 * Google Apps Script Project Downloader
 * Downloads external GAS projects for migration
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class GASProjectDownloader {
  constructor() {
    this.repoRoot = path.join(__dirname, '../..');
    this.tempDir = path.join(this.repoRoot, 'temp', 'external-projects');
    this.backupDir = path.join(this.repoRoot, 'backup', `gas-projects-${this.getTimestamp()}`);
  }

  getTimestamp() {
    return new Date().toISOString().split('T')[0].replace(/-/g, '');
  }

  async downloadProject(scriptId, projectName) {
    console.log(`\n📥 Downloading project: ${projectName} (${scriptId})`);
    
    // Sanitize project name for directory
    const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const projectDir = path.join(this.tempDir, safeName);
    
    try {
      // Create directories
      await fs.mkdir(projectDir, { recursive: true });
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Create temporary .clasp.json
      const tempClaspPath = path.join(projectDir, '.clasp.json');
      await fs.writeFile(tempClaspPath, JSON.stringify({
        scriptId: scriptId,
        rootDir: "."
      }, null, 2));
      
      // Clone the project
      console.log('  ⏳ Cloning project files...');
      execSync(`cd "${projectDir}" && clasp pull`, { stdio: 'inherit' });
      
      // Read and analyze files
      const files = await fs.readdir(projectDir);
      const projectInfo = {
        scriptId,
        name: projectName,
        safeName,
        downloadedAt: new Date().toISOString(),
        files: [],
        manifest: null
      };
      
      for (const file of files) {
        if (file === '.clasp.json') continue;
        
        const filePath = path.join(projectDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          projectInfo.files.push({
            name: file,
            size: stats.size,
            type: this.getFileType(file)
          });
          
          if (file === 'appsscript.json') {
            projectInfo.manifest = JSON.parse(await fs.readFile(filePath, 'utf8'));
          }
        }
      }
      
      // Save project info
      await fs.writeFile(
        path.join(projectDir, 'project-info.json'),
        JSON.stringify(projectInfo, null, 2)
      );
      
      // Create backup
      console.log('  💾 Creating backup...');
      const backupPath = path.join(this.backupDir, `${safeName}.tar`);
      execSync(`cd "${this.tempDir}" && tar -cf "${backupPath}" "${safeName}"`);
      
      console.log(`  ✅ Downloaded successfully to: ${projectDir}`);
      
      return projectInfo;
      
    } catch (error) {
      console.error(`  ❌ Error downloading project: ${error.message}`);
      throw error;
    }
  }

  async downloadMultiple(projects) {
    console.log(`\n🚀 Downloading ${projects.length} projects...\n`);
    
    const results = {
      successful: [],
      failed: []
    };
    
    for (const project of projects) {
      try {
        const info = await this.downloadProject(project.scriptId, project.name);
        results.successful.push(info);
      } catch (error) {
        results.failed.push({
          ...project,
          error: error.message
        });
      }
    }
    
    // Generate summary
    await this.generateDownloadSummary(results);
    
    return results;
  }

  async downloadAll() {
    // Read inventory from discovery phase
    const inventoryPath = path.join(this.repoRoot, 'temp', 'external-projects-inventory.json');
    
    try {
      const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf8'));
      return await this.downloadMultiple(inventory.externalProjects);
    } catch (error) {
      console.error('❌ No inventory found. Run discovery first: npm run gas:discover');
      process.exit(1);
    }
  }

  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
      '.gs': 'Google Script',
      '.html': 'HTML',
      '.json': 'JSON',
      '.css': 'CSS',
      '.js': 'JavaScript'
    };
    return types[ext] || 'Other';
  }

  async generateDownloadSummary(results) {
    const summaryPath = path.join(this.tempDir, 'download-summary.json');
    
    const summary = {
      timestamp: new Date().toISOString(),
      successful: results.successful.length,
      failed: results.failed.length,
      backupLocation: this.backupDir,
      projects: results
    };
    
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n📊 Download Summary:');
    console.log(`  ✅ Successful: ${results.successful.length}`);
    console.log(`  ❌ Failed: ${results.failed.length}`);
    console.log(`  💾 Backup: ${this.backupDir}`);
    console.log(`  📄 Summary: ${summaryPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const downloader = new GASProjectDownloader();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--all') {
    // Download all external projects
    downloader.downloadAll().catch(console.error);
  } else if (args.length === 2) {
    // Download specific project: npm run gas:download SCRIPT_ID "Project Name"
    downloader.downloadProject(args[0], args[1]).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  Download all: npm run gas:download:all');
    console.log('  Download one: npm run gas:download SCRIPT_ID "Project Name"');
  }
}

module.exports = GASProjectDownloader;