#!/usr/bin/env node

/**
 * Version Management Script - AGAR Repository Versioning
 * 
 * Title: Repository Version and Release Management Tool
 * Purpose: Manage repository versions, releases, and changelog generation
 * Created: 2025-07-19
 * Updated: 2025-07-19
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VersionManager {
  constructor() {
    this.rootDir = process.cwd();
    this.packagePath = path.join(this.rootDir, 'package.json');
    this.changelogPath = path.join(this.rootDir, 'CHANGELOG.md');
    this.versionHistoryPath = path.join(this.rootDir, 'reports', 'version-history.json');
    
    // Ensure reports directory exists
    const reportsDir = path.join(this.rootDir, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
  }

  async getCurrentVersion() {
    try {
      if (fs.existsSync(this.packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
        return packageData.version || '1.0.0';
      }
      return '1.0.0';
    } catch (error) {
      console.error('Error reading package.json:', error.message);
      return '1.0.0';
    }
  }

  async bumpVersion(type = 'patch') {
    const currentVersion = await this.getCurrentVersion();
    const newVersion = this.calculateNewVersion(currentVersion, type);
    
    console.log(`🔄 Bumping version from ${currentVersion} to ${newVersion} (${type})`);
    
    // Update package.json
    await this.updatePackageVersion(newVersion);
    
    // Record version change
    await this.recordVersionChange(currentVersion, newVersion, type);
    
    // Update changelog
    await this.updateChangelog(newVersion);
    
    // Create git tag if in git repository
    await this.createGitTag(newVersion);
    
    console.log(`✅ Version successfully bumped to ${newVersion}`);
    return newVersion;
  }

  calculateNewVersion(currentVersion, type) {
    const parts = currentVersion.split('.').map(Number);
    
    switch (type) {
      case 'major':
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
      case 'minor':
        parts[1]++;
        parts[2] = 0;
        break;
      case 'patch':
      default:
        parts[2]++;
        break;
    }
    
    return parts.join('.');
  }

  async updatePackageVersion(newVersion) {
    try {
      if (fs.existsSync(this.packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
        packageData.version = newVersion;
        fs.writeFileSync(this.packagePath, JSON.stringify(packageData, null, 2) + '\n');
        console.log('📦 Updated package.json version');
      }
    } catch (error) {
      console.error('Error updating package.json:', error.message);
      throw error;
    }
  }

  async recordVersionChange(oldVersion, newVersion, type) {
    const versionHistory = await this.loadVersionHistory();
    
    const changeRecord = {
      version: newVersion,
      previousVersion: oldVersion,
      type: type,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      changes: await this.detectChanges(),
      stats: await this.generateVersionStats()
    };
    
    versionHistory.versions.unshift(changeRecord);
    versionHistory.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(this.versionHistoryPath, JSON.stringify(versionHistory, null, 2));
    console.log('📊 Recorded version change in history');
  }

  async loadVersionHistory() {
    if (fs.existsSync(this.versionHistoryPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.versionHistoryPath, 'utf8'));
      } catch (error) {
        console.warn('Warning: Could not load version history, creating new one');
      }
    }
    
    return {
      repository: 'workspace-automation',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      versions: []
    };
  }

  async detectChanges() {
    const changes = {
      files: {
        added: 0,
        modified: 0,
        deleted: 0
      },
      scripts: {
        total: 0,
        new: 0
      },
      documentation: {
        updated: false,
        readmeCount: 0
      }
    };

    try {
      // Count current files
      changes.scripts.total = this.findFiles('*.gs').length;
      changes.documentation.readmeCount = this.findFiles('README.md').length;
      
      // Check if main README was updated recently
      const readmePath = path.join(this.rootDir, 'README.md');
      if (fs.existsSync(readmePath)) {
        const stats = fs.statSync(readmePath);
        const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        changes.documentation.updated = daysSinceModified < 1;
      }

      // Try to get git changes
      if (this.isGitRepository()) {
        try {
          const gitStatus = execSync('git status --porcelain 2>/dev/null', {
            encoding: 'utf8',
            cwd: this.rootDir
          });
          
          const lines = gitStatus.trim().split('\n').filter(line => line.trim());
          lines.forEach(line => {
            const status = line.substring(0, 2);
            if (status.includes('A')) changes.files.added++;
            if (status.includes('M')) changes.files.modified++;
            if (status.includes('D')) changes.files.deleted++;
          });
        } catch (error) {
          // Git commands not available or failed
        }
      }
    } catch (error) {
      console.warn('Warning: Could not detect all changes:', error.message);
    }

    return changes;
  }

  async generateVersionStats() {
    const stats = {
      totalFiles: 0,
      totalScripts: 0,
      totalLines: 0,
      services: [],
      lastCommit: null
    };

    try {
      // Count files and scripts
      stats.totalFiles = this.findFiles('*').length;
      stats.totalScripts = this.findFiles('*.gs').length;
      
      // Count lines in main code files
      const codeFiles = this.findFiles('*.js').concat(this.findFiles('*.gs'));
      codeFiles.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          stats.totalLines += content.split('\n').length;
        } catch (error) {
          // Skip files we can't read
        }
      });

      // Count services
      const serviceDirectories = [
        'gmail', 'drive', 'calendar', 'docs', 
        'sheets', 'tasks', 'chat', 'slides'
      ];
      
      serviceDirectories.forEach(service => {
        const servicePath = path.join(this.rootDir, 'scripts', service);
        if (fs.existsSync(servicePath)) {
          const fileCount = this.countFilesInDirectory(servicePath);
          stats.services.push({
            name: service,
            files: fileCount,
            hasReadme: fs.existsSync(path.join(servicePath, 'README.md'))
          });
        }
      });

      // Get last commit info
      if (this.isGitRepository()) {
        try {
          stats.lastCommit = execSync('git log -1 --format="%H %ci %s" 2>/dev/null', {
            encoding: 'utf8',
            cwd: this.rootDir
          }).trim();
        } catch (error) {
          // Git command failed
        }
      }
    } catch (error) {
      console.warn('Warning: Could not generate complete stats:', error.message);
    }

    return stats;
  }

  async updateChangelog(newVersion) {
    const changelogEntry = await this.generateChangelogEntry(newVersion);
    
    if (fs.existsSync(this.changelogPath)) {
      // Read existing changelog and prepend new entry
      const existingChangelog = fs.readFileSync(this.changelogPath, 'utf8');
      const lines = existingChangelog.split('\n');
      
      // Find insertion point (after title and before first version)
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('## [') || lines[i].startsWith('## Version')) {
          insertIndex = i;
          break;
        }
      }
      
      // Insert new entry
      lines.splice(insertIndex, 0, '', changelogEntry, '');
      fs.writeFileSync(this.changelogPath, lines.join('\n'));
    } else {
      // Create new changelog
      const changelogContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

${changelogEntry}
`;
      fs.writeFileSync(this.changelogPath, changelogContent);
    }
    
    console.log('📝 Updated CHANGELOG.md');
  }

  async generateChangelogEntry(version) {
    const date = new Date().toISOString().split('T')[0];
    const changes = await this.detectChanges();
    
    let entry = `## [${version}] - ${date}`;
    
    // Add sections based on detected changes
    const sections = [];
    
    if (changes.files.added > 0) {
      sections.push('### Added');
      sections.push(`- ${changes.files.added} new files`);
      if (changes.scripts.new > 0) {
        sections.push(`- ${changes.scripts.new} new automation scripts`);
      }
    }
    
    if (changes.files.modified > 0) {
      sections.push('### Changed');
      sections.push(`- Updated ${changes.files.modified} files`);
      if (changes.documentation.updated) {
        sections.push('- Updated documentation and README files');
      }
    }
    
    if (changes.files.deleted > 0) {
      sections.push('### Removed');
      sections.push(`- Removed ${changes.files.deleted} files`);
    }
    
    // Add generic improvements section
    sections.push('### Improved');
    sections.push('- General code quality and documentation improvements');
    sections.push('- Enhanced repository organization and structure');
    
    if (sections.length > 0) {
      entry += '\n\n' + sections.join('\n');
    }
    
    return entry;
  }

  async createGitTag(version) {
    if (!this.isGitRepository()) {
      console.log('⚠️ Not a git repository, skipping tag creation');
      return;
    }

    try {
      // Check if tag already exists
      const existingTags = execSync('git tag -l', { encoding: 'utf8', cwd: this.rootDir });
      if (existingTags.includes(`v${version}`)) {
        console.log(`⚠️ Tag v${version} already exists, skipping tag creation`);
        return;
      }

      // Create annotated tag
      execSync(`git tag -a v${version} -m "Release version ${version}"`, {
        cwd: this.rootDir
      });
      console.log(`🏷️ Created git tag v${version}`);
    } catch (error) {
      console.warn('Warning: Could not create git tag:', error.message);
    }
  }

  async showVersionHistory() {
    const versionHistory = await this.loadVersionHistory();
    
    console.log('📈 VERSION HISTORY');
    console.log('='.repeat(50));
    console.log(`Repository: ${versionHistory.repository}`);
    console.log(`Last Updated: ${new Date(versionHistory.lastUpdated).toLocaleString()}\n`);

    if (versionHistory.versions.length === 0) {
      console.log('No version history found.');
      return;
    }

    versionHistory.versions.slice(0, 10).forEach((version, index) => {
      console.log(`${index + 1}. Version ${version.version} (${version.type})`);
      console.log(`   Date: ${version.date}`);
      console.log(`   From: ${version.previousVersion} → ${version.version}`);
      
      if (version.stats) {
        console.log(`   Files: ${version.stats.totalFiles}, Scripts: ${version.stats.totalScripts}`);
        console.log(`   Services: ${version.stats.services.length}`);
      }
      
      if (version.changes) {
        const { files } = version.changes;
        console.log(`   Changes: +${files.added} ~${files.modified} -${files.deleted}`);
      }
      
      console.log('');
    });

    if (versionHistory.versions.length > 10) {
      console.log(`... and ${versionHistory.versions.length - 10} more versions`);
    }
  }

  async generateReleaseNotes(version) {
    const versionHistory = await this.loadVersionHistory();
    const versionInfo = versionHistory.versions.find(v => v.version === version);
    
    if (!versionInfo) {
      console.error(`Version ${version} not found in history`);
      return null;
    }

    const releaseNotes = `# Release Notes - Version ${version}

**Release Date**: ${versionInfo.date}
**Release Type**: ${versionInfo.type.toUpperCase()}

## 📊 Release Statistics

- **Total Files**: ${versionInfo.stats.totalFiles}
- **Total Scripts**: ${versionInfo.stats.totalScripts}
- **Lines of Code**: ${versionInfo.stats.totalLines}
- **Services**: ${versionInfo.stats.services.length}

### Service Breakdown
${versionInfo.stats.services.map(s => 
  `- **${s.name}**: ${s.files} files ${s.hasReadme ? '📖' : ''}`
).join('\n')}

## 🔄 Changes in This Release

### Files Modified
- **Added**: ${versionInfo.changes.files.added} files
- **Modified**: ${versionInfo.changes.files.modified} files  
- **Deleted**: ${versionInfo.changes.files.deleted} files

### Documentation
- **README files**: ${versionInfo.changes.documentation.readmeCount}
- **Documentation updated**: ${versionInfo.changes.documentation.updated ? 'Yes' : 'No'}

## 🚀 What's New

This release focuses on improving repository organization, documentation quality, and code standardization. 

### Key Improvements
- Enhanced documentation across all service folders
- Improved security and code quality measures
- Better repository structure and organization
- Updated automation scripts and tools

## 📥 Installation

1. Clone or download the repository
2. Copy desired scripts to your Google Apps Script projects
3. Follow the README instructions for each service
4. Enable required APIs and permissions

## 🔗 Resources

- **Repository**: https://github.com/kevinlappe/workspace-automation
- **Documentation**: See individual service README files
- **License**: MIT License
- **Support**: kevin@averageintelligence.ai

---

**Previous Version**: ${versionInfo.previousVersion}  
**Generated**: ${new Date().toLocaleString()}
`;

    // Save release notes
    const releaseNotesPath = path.join(this.rootDir, 'reports', `release-notes-${version}.md`);
    fs.writeFileSync(releaseNotesPath, releaseNotes);
    console.log(`📄 Release notes saved to: ${releaseNotesPath}`);

    return releaseNotes;
  }

  async prepareRelease(version, type = 'patch') {
    console.log(`🚀 Preparing release ${version || 'auto'} (${type})`);
    
    // Auto-generate version if not provided
    if (!version) {
      version = await this.bumpVersion(type);
    } else {
      await this.updatePackageVersion(version);
      await this.recordVersionChange(await this.getCurrentVersion(), version, type);
    }

    // Generate release notes
    await this.generateReleaseNotes(version);
    
    // Update changelog
    await this.updateChangelog(version);
    
    // Create git tag
    await this.createGitTag(version);
    
    console.log(`✅ Release ${version} prepared successfully`);
    console.log('\nNext steps:');
    console.log('1. Review the generated release notes');
    console.log('2. Commit all changes');
    console.log('3. Push tags: git push --tags');
    console.log('4. Create GitHub release (if applicable)');
    
    return version;
  }

  // Utility methods

  isGitRepository() {
    return fs.existsSync(path.join(this.rootDir, '.git'));
  }

  findFiles(pattern) {
    const results = [];
    
    const searchDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && !item.includes('node_modules')) {
            searchDir(fullPath);
          } else if (stat.isFile()) {
            if (pattern.includes('*')) {
              const regex = new RegExp(pattern.replace(/\*/g, '.*'));
              if (regex.test(item)) {
                results.push(fullPath);
              }
            } else if (item === pattern) {
              results.push(fullPath);
            }
          }
        });
      } catch (error) {
        // Skip directories we can't read
      }
    };

    searchDir(this.rootDir);
    return results;
  }

  countFilesInDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      return items.filter(item => {
        const fullPath = path.join(dir, item);
        return fs.statSync(fullPath).isFile();
      }).length;
    } catch (error) {
      return 0;
    }
  }
}

// CLI Interface
if (require.main === module) {
  const versionManager = new VersionManager();
  
  async function main() {
    const command = process.argv[2];
    const arg1 = process.argv[3];
    const arg2 = process.argv[4];

    try {
      switch (command) {
        case 'current':
          const currentVersion = await versionManager.getCurrentVersion();
          console.log(`Current version: ${currentVersion}`);
          break;
          
        case 'bump':
          const bumpType = arg1 || 'patch';
          if (!['major', 'minor', 'patch'].includes(bumpType)) {
            console.error('Invalid bump type. Use: major, minor, or patch');
            process.exit(1);
          }
          await versionManager.bumpVersion(bumpType);
          break;
          
        case 'history':
          await versionManager.showVersionHistory();
          break;
          
        case 'release':
          const releaseVersion = arg1;
          const releaseType = arg2 || 'patch';
          await versionManager.prepareRelease(releaseVersion, releaseType);
          break;
          
        case 'notes':
          const notesVersion = arg1 || await versionManager.getCurrentVersion();
          await versionManager.generateReleaseNotes(notesVersion);
          break;
          
        case 'changelog':
          const changelogVersion = arg1 || await versionManager.getCurrentVersion();
          await versionManager.updateChangelog(changelogVersion);
          break;
          
        default:
          console.log(`
Usage: node version-manager.js <command> [options]

Commands:
  current                           Show current version
  bump [major|minor|patch]          Bump version (default: patch)
  history                           Show version history
  release [version] [type]          Prepare a release
  notes [version]                   Generate release notes
  changelog [version]               Update changelog

Examples:
  node version-manager.js current
  node version-manager.js bump minor
  node version-manager.js release 2.1.0 minor
  node version-manager.js notes 2.0.0
          `);
      }
    } catch (error) {
      console.error('❌ Version management failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = VersionManager;
