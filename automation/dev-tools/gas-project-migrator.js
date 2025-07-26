#!/usr/bin/env node

/**
 * Google Apps Script Project Migrator
 * Migrates downloaded GAS projects into the repository structure
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class GASProjectMigrator {
  constructor() {
    this.repoRoot = path.join(__dirname, '../..');
    this.tempDir = path.join(this.repoRoot, 'temp', 'external-projects');
    this.appsDir = path.join(this.repoRoot, 'apps');
    this.migratedProjects = [];
  }

  async migrateProject(projectName, options = {}) {
    console.log(`\n🚀 Migrating project: ${projectName}`);
    
    const projectDir = path.join(this.tempDir, projectName);
    
    try {
      // Load project info
      const projectInfo = await this.loadProjectInfo(projectDir);
      
      // Analyze project to determine service
      const analysis = await this.analyzeProject(projectDir);
      const targetService = options.service || analysis.primaryService || 'utility';
      
      console.log(`  📊 Analysis complete: Primary service is ${targetService}`);
      
      // Process files
      const processedFiles = await this.processFiles(projectDir, projectInfo);
      
      // Migrate to target location
      const migrationResult = await this.migrateToService(
        processedFiles,
        targetService,
        projectInfo
      );
      
      // Update configurations
      await this.updateConfigurations(targetService, projectInfo);
      
      // Generate migration report
      await this.generateMigrationReport(projectInfo, analysis, migrationResult);
      
      console.log(`  ✅ Migration complete!`);
      
      this.migratedProjects.push(migrationResult);
      
      return migrationResult;
      
    } catch (error) {
      console.error(`  ❌ Migration failed: ${error.message}`);
      throw error;
    }
  }

  async loadProjectInfo(projectDir) {
    const infoPath = path.join(projectDir, 'project-info.json');
    return JSON.parse(await fs.readFile(infoPath, 'utf8'));
  }

  async analyzeProject(projectDir) {
    console.log('  🔍 Analyzing project...');
    
    const analysis = {
      primaryService: null,
      services: {},
      complexity: 'low',
      hasUI: false,
      hasTriggers: false,
      functions: [],
      quality: null
    };
    
    // Service detection patterns
    const servicePatterns = {
      gmail: /GmailApp\.|Gmail\./g,
      drive: /DriveApp\.|Drive\./g,
      sheets: /SpreadsheetApp\.|Sheets\./g,
      calendar: /CalendarApp\.|Calendar\./g,
      docs: /DocumentApp\.|Docs\./g,
      slides: /SlidesApp\.|Slides\./g,
      tasks: /Tasks\./g,
      chat: /Chat\./g,
      photos: /Photos\./g
    };
    
    // Read all .gs files
    const files = await fs.readdir(projectDir);
    const gsFiles = files.filter(f => f.endsWith('.gs'));
    
    for (const file of gsFiles) {
      const content = await fs.readFile(path.join(projectDir, file), 'utf8');
      
      // Count service usage
      for (const [service, pattern] of Object.entries(servicePatterns)) {
        const matches = content.match(pattern);
        if (matches) {
          analysis.services[service] = (analysis.services[service] || 0) + matches.length;
        }
      }
      
      // Check for UI
      if (content.includes('HtmlService') || content.includes('UiApp')) {
        analysis.hasUI = true;
      }
      
      // Check for triggers
      if (content.includes('ScriptApp.newTrigger')) {
        analysis.hasTriggers = true;
      }
      
      // Extract functions
      const functionMatches = content.match(/function\s+(\w+)\s*\(/g);
      if (functionMatches) {
        analysis.functions.push(...functionMatches.map(f => f.match(/function\s+(\w+)/)[1]));
      }
    }
    
    // Determine primary service
    if (Object.keys(analysis.services).length > 0) {
      analysis.primaryService = Object.entries(analysis.services)
        .sort(([,a], [,b]) => b - a)[0][0];
    }
    
    // Calculate complexity
    const lineCount = gsFiles.length * 100; // Rough estimate
    if (lineCount > 1000 || analysis.functions.length > 20) {
      analysis.complexity = 'high';
    } else if (lineCount > 300 || analysis.functions.length > 10) {
      analysis.complexity = 'medium';
    }
    
    return analysis;
  }

  async processFiles(projectDir, projectInfo) {
    console.log('  📝 Processing files...');
    
    const processedFiles = [];
    const files = await fs.readdir(projectDir);
    
    for (const file of files) {
      if (file.endsWith('.gs')) {
        const filePath = path.join(projectDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Standardize filename
        const standardName = this.standardizeFileName(file, projectInfo.name);
        
        // Apply smart formatting
        console.log(`    📄 Processing ${file} → ${standardName}`);
        const tempPath = path.join(projectDir, `temp_${file}`);
        await fs.writeFile(tempPath, content);
        
        try {
          execSync(`node "${path.join(__dirname, 'gas-formatter-smart.js')}" "${tempPath}"`, {
            stdio: 'pipe'
          });
        } catch (error) {
          console.log(`    ⚠️  Formatting failed, using original`);
        }
        
        processedFiles.push({
          originalName: file,
          standardName: standardName,
          content: await fs.readFile(tempPath, 'utf8').catch(() => content),
          type: 'script'
        });
        
        // Clean up temp file
        await fs.unlink(tempPath).catch(() => {});
        
      } else if (['.html', '.json', '.css', '.js'].some(ext => file.endsWith(ext))) {
        processedFiles.push({
          originalName: file,
          standardName: file,
          content: await fs.readFile(path.join(projectDir, file), 'utf8'),
          type: 'resource'
        });
      }
    }
    
    return processedFiles;
  }

  standardizeFileName(originalName, projectName) {
    // Remove .gs extension for processing
    let baseName = originalName.replace('.gs', '');
    
    // If it's a generic name, use project name
    if (['Code', 'Main', 'Script'].includes(baseName)) {
      baseName = projectName;
    }
    
    // Convert to kebab case
    const kebab = baseName
      .replace(/([A-Z])/g, '-$1')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    
    // Remove duplicated service names
    const services = ['gmail', 'drive', 'calendar', 'docs', 'sheets', 'tasks', 'chat', 'photos', 'slides'];
    for (const service of services) {
      if (kebab.startsWith(`${service}-${service}`)) {
        return kebab.replace(`${service}-${service}`, service) + '.gs';
      }
    }
    
    return kebab + '.gs';
  }

  async migrateToService(processedFiles, service, projectInfo) {
    console.log(`  📦 Migrating to ${service} service...`);
    
    const targetDir = path.join(this.appsDir, service, 'src');
    await fs.mkdir(targetDir, { recursive: true });
    
    const migrationResult = {
      service,
      projectName: projectInfo.name,
      scriptId: projectInfo.scriptId,
      migratedFiles: [],
      timestamp: new Date().toISOString()
    };
    
    for (const file of processedFiles) {
      const targetPath = path.join(targetDir, file.standardName);
      
      // Check if file already exists
      let finalName = file.standardName;
      if (await fs.access(targetPath).then(() => true).catch(() => false)) {
        // Add suffix to avoid overwriting
        const base = path.basename(finalName, path.extname(finalName));
        const ext = path.extname(finalName);
        finalName = `${base}-migrated${ext}`;
        console.log(`    ⚠️  File exists, renaming to ${finalName}`);
      }
      
      const finalPath = path.join(targetDir, finalName);
      await fs.writeFile(finalPath, file.content);
      
      migrationResult.migratedFiles.push({
        original: file.originalName,
        migrated: finalName,
        path: path.relative(this.repoRoot, finalPath)
      });
      
      console.log(`    ✅ ${file.originalName} → ${finalName}`);
    }
    
    return migrationResult;
  }

  async updateConfigurations(service, projectInfo) {
    console.log('  🔧 Updating configurations...');
    
    // Update or create .clasp.json if needed
    const claspPath = path.join(this.appsDir, service, '.clasp.json');
    
    // For now, we'll keep the original script ID
    // In production, you might want to create a new project
    
    console.log('    ℹ️  Configuration update skipped (manual review required)');
  }

  async generateMigrationReport(projectInfo, analysis, migrationResult) {
    const reportDir = path.join(this.repoRoot, 'docs', 'migration-reports');
    await fs.mkdir(reportDir, { recursive: true });
    
    const reportPath = path.join(
      reportDir,
      `${projectInfo.safeName}-migration-${Date.now()}.md`
    );
    
    const report = `# Migration Report: ${projectInfo.name}

## Summary
- **Original Script ID**: ${projectInfo.scriptId}
- **Migration Date**: ${new Date().toISOString()}
- **Target Service**: ${migrationResult.service}
- **Files Migrated**: ${migrationResult.migratedFiles.length}

## Analysis Results
- **Primary Service**: ${analysis.primaryService}
- **Complexity**: ${analysis.complexity}
- **Has UI**: ${analysis.hasUI ? 'Yes' : 'No'}
- **Has Triggers**: ${analysis.hasTriggers ? 'Yes' : 'No'}
- **Functions Found**: ${analysis.functions.length}

### Service Usage
${Object.entries(analysis.services)
  .map(([service, count]) => `- ${service}: ${count} references`)
  .join('\n')}

## Migrated Files
${migrationResult.migratedFiles
  .map(f => `- \`${f.original}\` → \`${f.migrated}\``)
  .join('\n')}

## Next Steps
1. Review migrated files in \`${path.join('apps', migrationResult.service, 'src')}\`
2. Test functionality
3. Update .clasp.json if creating new project
4. Run linting: \`npm run lint:gas ${migrationResult.migratedFiles[0]?.path}\`
5. Update catalog: \`npm run catalog\`

## Notes
- Original project backup available in \`backup/\` directory
- Consider consolidating with existing scripts if duplicate functionality exists
`;

    await fs.writeFile(reportPath, report);
    console.log(`  📄 Migration report: ${reportPath}`);
  }

  async migrateAll() {
    console.log('🚀 Starting batch migration...\n');
    
    // Get all downloaded projects
    const projects = await fs.readdir(this.tempDir);
    const projectDirs = [];
    
    for (const project of projects) {
      const stat = await fs.stat(path.join(this.tempDir, project));
      if (stat.isDirectory() && !project.startsWith('.')) {
        projectDirs.push(project);
      }
    }
    
    // Also check for converted scripts
    const convertedDir = path.join(this.repoRoot, 'temp', 'converted-scripts');
    if (await fs.access(convertedDir).then(() => true).catch(() => false)) {
      projectDirs.push('converted-scripts');
    }
    
    console.log(`Found ${projectDirs.length} projects to migrate\n`);
    
    for (const project of projectDirs) {
      try {
        await this.migrateProject(project);
      } catch (error) {
        console.error(`Failed to migrate ${project}: ${error.message}`);
      }
    }
    
    // Generate summary
    await this.generateBatchSummary();
  }

  async generateBatchSummary() {
    const summaryPath = path.join(this.repoRoot, 'docs', 'MIGRATION_SUMMARY.md');
    
    const summary = `# Batch Migration Summary

Generated: ${new Date().toISOString()}

## Results
- **Total Projects**: ${this.migratedProjects.length}
- **Successful**: ${this.migratedProjects.length}

## Migrated Projects

${this.migratedProjects.map(p => `### ${p.projectName}
- Service: ${p.service}
- Files: ${p.migratedFiles.length}
- Script ID: ${p.scriptId}
`).join('\n')}

## Next Steps
1. Review all migrated files
2. Run comprehensive testing
3. Update documentation
4. Delete original projects from Google Apps Script
`;

    await fs.writeFile(summaryPath, summary);
    console.log(`\n📊 Batch summary saved to: ${summaryPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const migrator = new GASProjectMigrator();
  const args = process.argv.slice(2);
  
  if (args[0] === '--all') {
    migrator.migrateAll().catch(console.error);
  } else if (args.length >= 1) {
    const projectName = args[0];
    const service = args[1] ? { service: args[1] } : {};
    migrator.migrateProject(projectName, service).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  Migrate all: npm run gas:migrate --all');
    console.log('  Migrate one: npm run gas:migrate PROJECT_NAME [SERVICE]');
  }
}

module.exports = GASProjectMigrator;