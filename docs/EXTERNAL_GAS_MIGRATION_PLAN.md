# External Google Apps Script Projects Migration Plan

## Overview
This plan outlines the process for discovering, downloading, processing, and migrating external Google Apps Script projects into the Workspace Automation repository, then safely removing them from Google Apps Script.

## Phase 1: Discovery and Inventory

### 1.1 List All Projects
```bash
# Use clasp to list all projects associated with the account
clasp list

# Alternative: Use Google Apps Script API
# This will show projects not in the current repository
```

### 1.2 Create Inventory
Create a spreadsheet tracking:
- Project Name
- Script ID
- Last Modified Date
- Number of Files
- Primary Service (Gmail, Drive, etc.)
- Migration Status
- Notes

### 1.3 Identify Projects to Migrate
- Exclude projects already in `/apps/` directory
- Flag test/experimental projects
- Identify abandoned projects
- Group by service type

## Phase 2: Download and Backup

### 2.1 Create Download Script
```javascript
// automation/dev-tools/gas-project-downloader.js
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class GASProjectDownloader {
  constructor() {
    this.script = google.script('v1');
    this.tempDir = './temp/external-projects';
  }

  async downloadProject(scriptId, projectName) {
    // Create project directory
    const projectDir = path.join(this.tempDir, projectName);
    await fs.mkdir(projectDir, { recursive: true });
    
    // Get project content
    const response = await this.script.projects.getContent({
      scriptId: scriptId
    });
    
    // Save each file
    for (const file of response.data.files) {
      const fileName = file.name + this.getExtension(file.type);
      const filePath = path.join(projectDir, fileName);
      await fs.writeFile(filePath, file.source);
    }
    
    // Save manifest
    await fs.writeFile(
      path.join(projectDir, 'appsscript.json'),
      JSON.stringify(response.data.manifest, null, 2)
    );
    
    return projectDir;
  }
  
  getExtension(type) {
    const extensions = {
      'SERVER_JS': '.gs',
      'HTML': '.html',
      'JSON': '.json'
    };
    return extensions[type] || '.txt';
  }
}
```

### 2.2 Backup Process
1. Create backup directory: `backup/external-gas-projects-YYYYMMDD/`
2. Download all projects using the script
3. Create ZIP archive of all downloaded projects
4. Store backup in cloud storage

## Phase 3: Analysis and Categorization

### 3.1 Analyze Script Content
```javascript
// automation/dev-tools/gas-project-analyzer.js
class GASProjectAnalyzer {
  analyzeProject(projectPath) {
    return {
      service: this.detectPrimaryService(projectPath),
      complexity: this.calculateComplexity(projectPath),
      dependencies: this.findDependencies(projectPath),
      quality: this.assessQuality(projectPath),
      duplicates: this.findDuplicates(projectPath)
    };
  }
  
  detectPrimaryService(projectPath) {
    // Scan for service usage patterns
    const services = {
      gmail: /GmailApp\.|Gmail\./,
      drive: /DriveApp\.|Drive\./,
      sheets: /SpreadsheetApp\.|Sheets\./,
      calendar: /CalendarApp\.|Calendar\./,
      docs: /DocumentApp\.|Docs\./,
      slides: /SlidesApp\.|Slides\./,
      tasks: /Tasks\./,
      chat: /Chat\./
    };
    // Return primary service based on usage
  }
}
```

### 3.2 Categorization Rules
1. **By Service**: Group into appropriate `/apps/{service}/` directory
2. **By Quality**: 
   - High: Migrate with minimal changes
   - Medium: Needs refactoring
   - Low: Consider archiving instead
3. **By Usage**:
   - Active: Used in last 30 days
   - Dormant: Not used in 30-180 days
   - Abandoned: Not used in 180+ days

## Phase 4: Processing and Standardization

### 4.1 Automated Processing Pipeline
```bash
# Process each downloaded project
for project in temp/external-projects/*; do
  # 1. Analyze project
  npm run analyze:project "$project"
  
  # 2. Determine target location
  SERVICE=$(npm run detect:service "$project" --silent)
  
  # 3. Apply smart formatting
  npm run format:smart "$project"/*.gs
  
  # 4. Fix linting issues
  npm run lint:fix "$project"/*.gs
  
  # 5. Generate documentation
  npm run document:generate "$project"
done
```

### 4.2 Manual Review Checklist
- [ ] Verify service detection is correct
- [ ] Check for sensitive data (API keys, passwords)
- [ ] Ensure no duplicate functionality exists
- [ ] Validate setup instructions
- [ ] Test core functionality
- [ ] Review security implications

### 4.3 Naming Standardization
```javascript
// Rename files to match convention
function standardizeFileName(originalName, service) {
  // Convert "MyEmailScript" to "gmail-email-processor"
  const kebabCase = originalName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  
  return `${service}-${kebabCase}.gs`;
}
```

## Phase 5: Migration and Integration

### 5.1 Migration Script
```javascript
// automation/dev-tools/gas-project-migrator.js
class GASProjectMigrator {
  async migrateProject(sourceDir, targetService) {
    const targetDir = `apps/${targetService}/src`;
    
    // 1. Copy files to target directory
    await this.copyFiles(sourceDir, targetDir);
    
    // 2. Update .clasp.json if needed
    await this.updateClaspConfig(targetService);
    
    // 3. Update project-mapping.json
    await this.updateProjectMapping(targetService);
    
    // 4. Run tests
    await this.runTests(targetService);
    
    // 5. Generate catalog entry
    await this.updateCatalog();
  }
}
```

### 5.2 Integration Steps
1. **Pre-migration validation**
   ```bash
   npm run validate:migration PROJECT_NAME
   ```

2. **Migrate project**
   ```bash
   npm run migrate:project PROJECT_NAME --service gmail
   ```

3. **Post-migration testing**
   ```bash
   npm run test:service gmail
   ```

## Phase 6: Verification and Cleanup

### 6.1 Verification Process
1. **Deploy to test environment**
   ```bash
   ./automation/deploy-local.sh SERVICE --test
   ```

2. **Run integration tests**
   ```bash
   npm run test:integration SERVICE
   ```

3. **Compare functionality**
   - Execute key functions in both old and new projects
   - Verify outputs match
   - Check performance metrics

### 6.2 Safe Deletion Process
```javascript
// automation/dev-tools/gas-project-archiver.js
class GASProjectArchiver {
  async archiveAndDelete(scriptId, projectName) {
    // 1. Final backup
    await this.createFinalBackup(scriptId, projectName);
    
    // 2. Export execution history
    await this.exportExecutionHistory(scriptId);
    
    // 3. Document deletion
    await this.logDeletion(scriptId, projectName);
    
    // 4. Remove from Google Apps Script
    // Note: This requires manual confirmation
    console.log(`
      To delete project ${projectName} (${scriptId}):
      1. Go to https://script.google.com/home
      2. Find project: ${projectName}
      3. Click ⋮ menu > Remove
      4. Confirm deletion
    `);
    
    // Alternative: Use API if available
    // await this.script.projects.delete({ scriptId });
  }
}
```

## Phase 7: Documentation and Reporting

### 7.1 Migration Report Template
```markdown
# Migration Report: [Project Name]

## Summary
- Original Script ID: 
- New Location: /apps/{service}/src/{filename}.gs
- Migration Date: 
- Migrated By: 

## Changes Made
- [ ] Applied standard header
- [ ] Fixed formatting issues
- [ ] Added documentation
- [ ] Resolved lint errors
- [ ] Updated function names

## Testing Results
- Unit Tests: ✅ Passed / ❌ Failed
- Integration Tests: ✅ Passed / ❌ Failed
- Manual Testing: ✅ Passed / ❌ Failed

## Notes
[Any special considerations or issues]
```

### 7.2 Final Documentation
- Update README.md with migrated projects
- Add entries to SCRIPT_CATALOG.md
- Document any breaking changes
- Create migration guide for users

## Automation Tools to Create

### 1. Project Discovery Tool
```bash
npm run gas:discover
# Lists all external projects not in repo
```

### 2. Bulk Download Tool
```bash
npm run gas:download:all
# Downloads all external projects
```

### 3. Migration Wizard
```bash
npm run gas:migrate:wizard
# Interactive tool for migration decisions
```

### 4. Deletion Safety Check
```bash
npm run gas:delete:check PROJECT_ID
# Verifies project is safe to delete
```

## Risk Mitigation

### Backup Strategy
1. Local backup before download
2. Cloud backup after download
3. Git commit after migration
4. Archive before deletion
5. 30-day retention of deleted projects

### Rollback Plan
1. Keep original Script IDs documented
2. Maintain backup of original code
3. Test thoroughly before deletion
4. Have restore script ready

### Safety Checks
- Never delete without backup
- Require manual confirmation
- Log all deletions
- Monitor for 7 days post-deletion
- Keep execution history

## Timeline Estimate

### Small Scale (1-10 projects)
- Discovery: 1 hour
- Download & Backup: 2 hours
- Analysis: 2 hours
- Processing: 4 hours
- Migration: 4 hours
- Verification: 2 hours
- **Total: ~2 days**

### Medium Scale (10-50 projects)
- Discovery: 2 hours
- Download & Backup: 4 hours
- Analysis: 8 hours
- Processing: 2-3 days
- Migration: 2-3 days
- Verification: 1 day
- **Total: ~1 week**

### Large Scale (50+ projects)
- Use automated tools extensively
- Process in batches
- Consider keeping some projects external
- **Total: 2-3 weeks**

## Success Criteria

1. ✅ All valuable projects migrated
2. ✅ No functionality lost
3. ✅ All projects follow standards
4. ✅ Documentation complete
5. ✅ Backups verified
6. ✅ Original projects safely removed
7. ✅ Users notified of changes

## Next Steps

1. **Review and approve plan**
2. **Create automation tools**
3. **Run discovery phase**
4. **Begin pilot migration** (1-2 projects)
5. **Refine process**
6. **Execute full migration**