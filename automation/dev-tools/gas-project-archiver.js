#!/usr/bin/env node

/**
 * Google Apps Script Project Archiver and Deletion Tool
 * Safely archives and removes GAS projects after migration
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

class GASProjectArchiver {
  constructor() {
    this.repoRoot = path.join(__dirname, '../..');
    this.archiveDir = path.join(this.repoRoot, 'archive', 'deleted-projects');
    this.deletionLog = path.join(this.archiveDir, 'deletion-log.json');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async verifyProjectSafety(scriptId, projectName) {
    console.log(`\n🔍 Verifying safety for deletion: ${projectName} (${scriptId})`);
    
    const safety = {
      hasBackup: false,
      isMigrated: false,
      hasBeenTested: false,
      executionHistory: null,
      lastExecuted: null,
      safeToDelete: false
    };
    
    // Check for backup
    console.log('  📁 Checking for backups...');
    const backupDirs = await fs.readdir(path.join(this.repoRoot, 'backup')).catch(() => []);
    for (const dir of backupDirs) {
      if (dir.includes('gas-projects')) {
        const backupPath = path.join(this.repoRoot, 'backup', dir);
        const files = await fs.readdir(backupPath).catch(() => []);
        if (files.some(f => f.includes(projectName.replace(/[^a-zA-Z0-9-_]/g, '_')))) {
          safety.hasBackup = true;
          console.log('    ✅ Backup found');
          break;
        }
      }
    }
    
    if (!safety.hasBackup) {
      console.log('    ❌ No backup found');
    }
    
    // Check if migrated
    console.log('  📂 Checking migration status...');
    const migrationReports = await fs.readdir(
      path.join(this.repoRoot, 'docs', 'migration-reports')
    ).catch(() => []);
    
    for (const report of migrationReports) {
      const content = await fs.readFile(
        path.join(this.repoRoot, 'docs', 'migration-reports', report),
        'utf8'
      );
      if (content.includes(scriptId)) {
        safety.isMigrated = true;
        console.log('    ✅ Migration confirmed');
        break;
      }
    }
    
    if (!safety.isMigrated) {
      console.log('    ❌ No migration record found');
    }
    
    // Manual verification
    console.log('\n  ⚠️  Manual verification required:');
    safety.hasBeenTested = await this.askConfirmation(
      '    Has the migrated version been tested successfully?'
    );
    
    // Calculate safety
    safety.safeToDelete = safety.hasBackup && safety.isMigrated && safety.hasBeenTested;
    
    return safety;
  }

  async askConfirmation(question) {
    return new Promise((resolve) => {
      this.rl.question(`${question} (y/n): `, (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }

  async createFinalArchive(scriptId, projectName) {
    console.log('\n📦 Creating final archive...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `${projectName.replace(/[^a-zA-Z0-9-_]/g, '_')}_${scriptId}_${timestamp}`;
    const projectArchiveDir = path.join(this.archiveDir, archiveName);
    
    await fs.mkdir(projectArchiveDir, { recursive: true });
    
    // Copy from temp if exists
    const tempProjectDir = path.join(
      this.repoRoot,
      'temp',
      'external-projects',
      projectName.replace(/[^a-zA-Z0-9-_]/g, '_')
    );
    
    if (await fs.access(tempProjectDir).then(() => true).catch(() => false)) {
      console.log('  📄 Copying project files...');
      await this.copyDirectory(tempProjectDir, projectArchiveDir);
    }
    
    // Create deletion metadata
    const metadata = {
      scriptId,
      projectName,
      deletionDate: new Date().toISOString(),
      archiveLocation: projectArchiveDir,
      deletedBy: process.env.USER || 'unknown',
      reason: 'Migrated to repository'
    };
    
    await fs.writeFile(
      path.join(projectArchiveDir, 'deletion-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`  ✅ Archive created: ${projectArchiveDir}`);
    
    return metadata;
  }

  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async logDeletion(metadata) {
    console.log('  📝 Logging deletion...');
    
    let log = [];
    try {
      log = JSON.parse(await fs.readFile(this.deletionLog, 'utf8'));
    } catch (error) {
      // File doesn't exist yet
    }
    
    log.push(metadata);
    
    await fs.writeFile(this.deletionLog, JSON.stringify(log, null, 2));
    console.log('  ✅ Deletion logged');
  }

  async generateDeletionInstructions(scriptId, projectName) {
    const instructionsPath = path.join(this.archiveDir, `DELETE_${scriptId}.md`);
    
    const instructions = `# Deletion Instructions for ${projectName}

**Script ID**: ${scriptId}
**Generated**: ${new Date().toISOString()}

## ⚠️ FINAL VERIFICATION CHECKLIST

Before deleting this project from Google Apps Script:

- [ ] Backup verified in \`backup/\` directory
- [ ] Migration completed to \`apps/\` directory  
- [ ] All functionality tested in new location
- [ ] No active triggers or time-based executions
- [ ] No external dependencies on this script ID
- [ ] Team members notified of migration

## 🗑️ Deletion Steps

1. **Open Google Apps Script**
   - Go to: https://script.google.com
   - Sign in with the appropriate account

2. **Locate the Project**
   - Find: "${projectName}"
   - Script ID: ${scriptId}

3. **Check Recent Executions**
   - Click on project
   - Go to "Executions" in left sidebar
   - Verify no recent critical executions

4. **Remove Project**
   - Click the three dots (⋮) menu
   - Select "Remove"
   - Confirm deletion

5. **Alternative: Using URL**
   - Direct link: https://script.google.com/d/${scriptId}/edit
   - Follow steps 3-4 above

## 📋 Post-Deletion

After deletion:
1. Mark this instruction file as completed
2. Update migration documentation
3. Remove from any external references
4. Monitor for any issues for 7 days

## ⚠️ Recovery

If you need to recover this project:
- Check archive at: \`archive/deleted-projects/\`
- Restore from backup if within 30 days
- Contact Google Support if critical

---
**Remember**: This action cannot be easily undone. Ensure all verifications are complete.
`;

    await fs.writeFile(instructionsPath, instructions);
    console.log(`\n📄 Deletion instructions saved to: ${instructionsPath}`);
    
    return instructionsPath;
  }

  async processProjectDeletion(scriptId, projectName) {
    console.log('\n' + '='.repeat(60));
    console.log(`🗑️  PROJECT DELETION PROCESS`);
    console.log('='.repeat(60));
    
    try {
      // Verify safety
      const safety = await this.verifyProjectSafety(scriptId, projectName);
      
      if (!safety.safeToDelete) {
        console.log('\n❌ Project is NOT safe to delete!');
        console.log('   Missing requirements:');
        if (!safety.hasBackup) console.log('   - No backup found');
        if (!safety.isMigrated) console.log('   - Migration not confirmed');
        if (!safety.hasBeenTested) console.log('   - Testing not confirmed');
        
        const override = await this.askConfirmation(
          '\n⚠️  Do you want to continue anyway? (NOT RECOMMENDED)'
        );
        
        if (!override) {
          console.log('\n✅ Deletion cancelled - good choice!');
          this.rl.close();
          return;
        }
      }
      
      // Create final archive
      const metadata = await this.createFinalArchive(scriptId, projectName);
      
      // Log deletion
      await this.logDeletion(metadata);
      
      // Generate instructions
      const instructionsPath = await this.generateDeletionInstructions(scriptId, projectName);
      
      // Final confirmation
      console.log('\n' + '⚠️ '.repeat(10));
      console.log('FINAL CONFIRMATION REQUIRED');
      console.log('⚠️ '.repeat(10));
      
      const finalConfirm = await this.askConfirmation(
        '\nAre you absolutely sure you want to delete this project?'
      );
      
      if (finalConfirm) {
        console.log('\n✅ Deletion approved. Follow the instructions in:');
        console.log(`   ${instructionsPath}`);
        console.log('\n🔗 Direct link to delete:');
        console.log(`   https://script.google.com/d/${scriptId}/edit`);
      } else {
        console.log('\n✅ Deletion cancelled');
      }
      
    } catch (error) {
      console.error('\n❌ Error during deletion process:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async generateDeletionReport() {
    console.log('\n📊 Generating deletion report...');
    
    let log = [];
    try {
      log = JSON.parse(await fs.readFile(this.deletionLog, 'utf8'));
    } catch (error) {
      console.log('No deletions logged yet');
      return;
    }
    
    const reportPath = path.join(this.archiveDir, 'DELETION_REPORT.md');
    
    const report = `# Google Apps Script Deletion Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Deletions**: ${log.length}
- **Archive Location**: \`archive/deleted-projects/\`

## Deleted Projects

| Project Name | Script ID | Deletion Date | Archive Location |
|--------------|-----------|---------------|------------------|
${log.map(entry => 
  `| ${entry.projectName} | ${entry.scriptId} | ${entry.deletionDate} | ${path.basename(entry.archiveLocation)} |`
).join('\n')}

## Recovery Information

All deleted projects are archived with:
- Complete source code
- Project metadata
- Deletion information
- Original manifest files

To recover a project:
1. Locate in \`archive/deleted-projects/\`
2. Create new GAS project
3. Copy source files
4. Update configurations

## Notes
- Archives are retained indefinitely
- Consider periodic cleanup of very old archives
- Always verify backups before deletion
`;

    await fs.writeFile(reportPath, report);
    console.log(`✅ Report saved to: ${reportPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const archiver = new GASProjectArchiver();
  const args = process.argv.slice(2);
  
  if (args[0] === '--report') {
    archiver.generateDeletionReport().catch(console.error);
  } else if (args.length >= 2) {
    const scriptId = args[0];
    const projectName = args.slice(1).join(' ');
    archiver.processProjectDeletion(scriptId, projectName).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  Delete project: npm run gas:delete SCRIPT_ID "Project Name"');
    console.log('  Generate report: npm run gas:delete --report');
  }
}

module.exports = GASProjectArchiver;