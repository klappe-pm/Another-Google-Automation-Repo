#!/usr/bin/env node

/**
 * Google Apps Script Project Discovery Tool
 * Discovers all GAS projects in the account and identifies which ones need migration
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class GASProjectDiscovery {
  constructor() {
    this.repoRoot = path.join(__dirname, '../..');
    this.appsDir = path.join(this.repoRoot, 'apps');
    this.knownProjects = new Set();
    this.externalProjects = [];
  }

  async discover() {
    console.log('🔍 Discovering Google Apps Script projects...\n');
    
    // Load known projects
    await this.loadKnownProjects();
    
    // Get all projects from clasp
    const allProjects = this.getAllProjects();
    
    // Identify external projects
    this.identifyExternalProjects(allProjects);
    
    // Generate report
    await this.generateReport();
    
    // Save inventory
    await this.saveInventory();
  }

  async loadKnownProjects() {
    console.log('📂 Loading known projects from repository...');
    
    // Read all .clasp.json files in apps directory
    const services = await fs.readdir(this.appsDir);
    
    for (const service of services) {
      const claspPath = path.join(this.appsDir, service, '.clasp.json');
      try {
        const claspContent = await fs.readFile(claspPath, 'utf8');
        const claspData = JSON.parse(claspContent);
        if (claspData.scriptId) {
          this.knownProjects.add(claspData.scriptId);
        }
      } catch (error) {
        // Ignore if .clasp.json doesn't exist
      }
    }
    
    console.log(`✅ Found ${this.knownProjects.size} projects in repository\n`);
  }

  getAllProjects() {
    console.log('🌐 Fetching all projects from Google Apps Script...');
    
    try {
      // Run clasp list command
      const output = execSync('clasp list', { encoding: 'utf8' });
      const lines = output.split('\n').filter(line => line.trim());
      
      const projects = [];
      
      // Parse clasp list output
      // Format: "scriptId – name"
      for (const line of lines) {
        const match = line.match(/^(.+?)\s+–\s+(.+)$/);
        if (match) {
          projects.push({
            scriptId: match[1].trim(),
            name: match[2].trim()
          });
        }
      }
      
      console.log(`✅ Found ${projects.length} total projects\n`);
      return projects;
      
    } catch (error) {
      console.error('❌ Error running clasp list:', error.message);
      console.log('\nMake sure you are logged in with: clasp login');
      process.exit(1);
    }
  }

  identifyExternalProjects(allProjects) {
    console.log('🔎 Identifying external projects...\n');
    
    for (const project of allProjects) {
      if (!this.knownProjects.has(project.scriptId)) {
        this.externalProjects.push(project);
        console.log(`  📌 ${project.name} (${project.scriptId})`);
      }
    }
    
    console.log(`\n✅ Found ${this.externalProjects.length} external projects\n`);
  }

  async generateReport() {
    const reportPath = path.join(this.repoRoot, 'docs', 'EXTERNAL_PROJECTS_REPORT.md');
    
    const report = `# External Google Apps Script Projects Report

Generated: ${new Date().toISOString()}

## Summary
- Total Projects in Account: ${this.knownProjects.size + this.externalProjects.length}
- Projects in Repository: ${this.knownProjects.size}
- External Projects: ${this.externalProjects.length}

## External Projects Requiring Migration

| Project Name | Script ID | Action Required |
|--------------|-----------|-----------------|
${this.externalProjects.map(p => 
  `| ${p.name} | ${p.scriptId} | Review & Migrate |`
).join('\n')}

## Next Steps

1. Review each external project
2. Run \`npm run gas:download PROJECT_ID\` to download
3. Analyze and categorize projects
4. Migrate using \`npm run gas:migrate PROJECT_ID\`

## Known Projects (Already in Repository)

| Service | Script ID |
|---------|-----------|
${Array.from(this.knownProjects).map(id => 
  `| ${this.findServiceForProject(id)} | ${id} |`
).join('\n')}
`;

    await fs.writeFile(reportPath, report);
    console.log(`📄 Report saved to: ${reportPath}`);
  }

  findServiceForProject(scriptId) {
    // This is a simplified version - in reality, you'd read the .clasp.json files
    return 'Unknown';
  }

  async saveInventory() {
    const inventoryPath = path.join(this.repoRoot, 'temp', 'external-projects-inventory.json');
    
    await fs.mkdir(path.dirname(inventoryPath), { recursive: true });
    
    const inventory = {
      timestamp: new Date().toISOString(),
      knownProjects: Array.from(this.knownProjects),
      externalProjects: this.externalProjects,
      summary: {
        totalProjects: this.knownProjects.size + this.externalProjects.length,
        inRepository: this.knownProjects.size,
        external: this.externalProjects.length
      }
    };
    
    await fs.writeFile(inventoryPath, JSON.stringify(inventory, null, 2));
    console.log(`💾 Inventory saved to: ${inventoryPath}`);
  }
}

// Run discovery
if (require.main === module) {
  const discovery = new GASProjectDiscovery();
  discovery.discover().catch(console.error);
}

module.exports = GASProjectDiscovery;