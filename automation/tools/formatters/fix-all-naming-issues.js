#!/usr/bin/env node

/**
 * Fix all naming and placement issues for Google Apps Scripts
 */

const fs = require('fs').promises;
const path = require('path');

// Comprehensive renaming rules based on analysis
const renamingRules = [
  // Calendar folder fixes
  { from: 'calendar-analysis-duration-distance', to: 'analyze-duration-distance' },
  { from: 'calendar-event-assistant', to: 'assist-calendar-events' },
  { from: 'events-date-duration-time-distance', to: 'analyze-events-duration-distance' },
  { from: 'export-calendar-daily', to: 'markdown-export-calendar-daily' },
  { from: 'export-calendar-meetings-obsidian', to: 'markdown-export-calendar-meetings' },
  { from: 'export-calendar-obsidian', to: 'markdown-export-calendar-events' },
  
  // Docs folder fixes
  { from: 'docs-embed-content-block', to: 'embed-content-block' },
  { from: 'docs-formatter-content', to: 'format-content' },
  { from: 'formatt-docs', to: 'format-documents' },
  
  // Drive folder fixes
  { from: 'drive-filetree-maker', to: 'generate-file-tree' },
  { from: 'drive-utility-folder-ids', to: 'list-folder-ids' },
  { from: 'drive-utility-script-21-legacy', to: 'markdown-create-files-from-rows' },
  { from: 'drive-yaml-add-frontmatter-bulk', to: 'markdown-add-yaml-frontmatter-bulk' },
  { from: 'drive-yaml-add-frontmatter-multi', to: 'markdown-add-yaml-frontmatter-multi' },
  { from: 'drive-yaml-dataview-categories', to: 'markdown-generate-yaml-categories' },
  { from: 'drive-yaml-finder', to: 'markdown-find-yaml-files' },
  { from: 'find-drive-docs-by-alias', to: 'find-docs-by-alias' },
  { from: 'folderids', to: 'list-folder-ids' },
  { from: 'generate-drive-notes-weekly', to: 'markdown-generate-weekly-notes' },
  { from: 'index-drive-all-files', to: 'index-all-files' },
  { from: 'index-drive-docs-files', to: 'index-docs-files' },
  { from: 'index-drive-manager-comprehensive', to: 'markdown-index-comprehensive' },
  { from: 'index-drive-tree-v100-legacy', to: 'markdown-index-tree-legacy' },
  { from: 'index-drive-v10-legacy', to: 'index-files-v10-legacy' },
  { from: 'index-drive-v100-legacy', to: 'markdown-index-files-legacy' },
  { from: 'markdown-index-drive-files', to: 'markdown-index-files' },
  { from: 'markdown-process-drive-blank-links', to: 'markdown-process-blank-links' },
  { from: 'markdown-update-drive-move-metadata', to: 'markdown-update-metadata' },
  { from: 'create-drive-notes-weekly-daily-vx-legacy', to: 'markdown-create-weekly-daily-notes-legacy' },
  { from: 'create-drive-notes-weekly-daily', to: 'markdown-create-weekly-daily-notes' },
  { from: 'convert-drive-shortcuts', to: 'convert-shortcuts' },
  { from: 'code-v1', to: 'index-drive-files' },
  
  // Gmail folder fixes
  { from: 'gmail-analysis-label-statistics', to: 'analyze-label-statistics' },
  { from: 'gmail-analysis-label-stats', to: 'analyze-label-stats' },
  { from: 'gmail-analysis-labels-data', to: 'analyze-labels-data' },
  { from: 'gmail-code', to: 'process-emails' },
  { from: 'gmail-label-maker', to: 'create-labels' },
  { from: 'gmail-labels-analysis', to: 'analyze-labels' },
  { from: 'gmail-labels-count', to: 'count-labels' },
  { from: 'gmail-labels-date-processor-v1', to: 'process-labels-by-date' },
  { from: 'gmail-labels-labeled-not-labeled', to: 'analyze-labeled-unlabeled' },
  { from: 'gmail-labels-statistics-v1', to: 'analyze-labels-statistics-v1' },
  { from: 'gmail-labels-statistics', to: 'analyze-labels-statistics' },
  { from: 'gmail-labels-unread-count', to: 'count-unread-labels' },
  { from: 'gmail-labels-unread-emails-count', to: 'count-unread-emails' },
  { from: 'gmail-mark-all-read', to: 'mark-all-read' },
  { from: 'gmail-meta-24months-misc', to: 'analyze-metadata-24months' },
  { from: 'gmail-metadata-tools', to: 'analyze-metadata' },
  { from: 'gmail-utility-header-cleaner', to: 'clean-email-headers' },
  { from: 'gmail-utility-mark-read', to: 'mark-emails-read' },
  { from: 'gmailstatsanalyzer', to: 'analyze-email-stats' },
  { from: 'delete-gmail-labels-all', to: 'delete-all-labels' },
  { from: 'delete-gmail-utility-all-labels', to: 'delete-all-labels-utility' },
  { from: 'email-data-24months', to: 'analyze-emails-24months' },
  { from: 'email-labels-data', to: 'export-labels-data' },
  { from: 'hyperlinks-to-albums', to: 'create-album-hyperlinks' },
  { from: 'insert-sheets-row-url-to-toc', to: 'insert-row-url-to-toc' },
  { from: 'rename-sheets-tabs', to: 'rename-tabs' },
  { from: 'export-email-md', to: 'markdown-export-emails' },
  { from: 'export-email-pdf-md-sheets', to: 'markdown-export-emails-pdf-sheets' },
  { from: 'export-gmail-advanced-sheets', to: 'markdown-export-advanced-sheets' },
  { from: 'export-gmail-basic-sheets', to: 'markdown-export-basic-sheets' },
  { from: 'export-gmail-docs-pdf', to: 'markdown-export-docs-pdf' },
  { from: 'export-gmail-pdf-only', to: 'markdown-export-pdf' },
  { from: 'lint-gmail-utility-md', to: 'markdown-lint-files' },
  { from: 'markdown-gmail-utility-fixer', to: 'markdown-fix-formatting' },
  { from: 'export-from:*lyft*-or-*uber*', to: 'export-lyft-uber-emails' },
  
  // Sheets folder fixes
  { from: 'sheets-csv-combiner', to: 'combine-csv-files' },
  { from: 'sheets-date-automation-checkbox-rx', to: 'automate-date-checkboxes' },
  { from: 'sheets-index-folders-files', to: 'markdown-index-folders-files' },
  { from: 'date-received-append', to: 'append-date-received' },
  { from: 'time-received-append', to: 'append-time-received' },
  { from: 'markdown-create-sheets', to: 'markdown-create-from-sheets' },
  { from: 'markdown-export-sheets-files', to: 'markdown-export-files' },
  { from: 'markdown-generator-sheets', to: 'markdown-generate-from-sheets' },
  
  // Tasks folder fixes
  { from: 'tasks-md-obsidian-folder', to: 'markdown-export-tasks-obsidian' },
  { from: 'tasks-to-todos-md-folder', to: 'markdown-export-todos' },
  { from: 'tasklistids', to: 'list-task-ids' },
  { from: 'export-tasks-obsidian', to: 'markdown-export-tasks-obsidian' },
  { from: 'export-tasks-tasklist-md-yaml', to: 'markdown-export-tasklist-yaml' },
  
  // Utility folder fixes
  { from: 'utility-api-key-checker', to: 'check-api-key' },
  { from: 'linter-md-lines-spacing', to: 'markdown-lint-line-spacing' },
  { from: 'yaml-finder', to: 'markdown-find-yaml' },
  { from: 'yaml-folder-category', to: 'markdown-categorize-yaml-folders' },
  { from: 'zzz-yaml-add-yaml', to: 'add-yaml-frontmatter' },
  { from: 'zzz-yaml', to: 'markdown-process-yaml' },
  { from: 'updat-obsidian-vault-config', to: 'update-obsidian-vault-config' }
];

// Files that need to be moved to different folders
const moveRules = [
  // Move misplaced calendar files to appropriate folders
  { file: 'calendar-analysis-duration-distance.gs', from: 'calendar', to: 'sheets' },
  { file: 'events-date-duration-time-distance.gs', from: 'calendar', to: 'sheets' },
  { file: 'export-calendar-after-date.gs', from: 'calendar', to: 'sheets' },
  { file: 'export-calendar-date-range.gs', from: 'calendar', to: 'sheets' },
  { file: 'export-calendar-distance-time.gs', from: 'calendar', to: 'sheets' },
  { file: 'export-event-gcp-distance-time.gs', from: 'calendar', to: 'sheets' },
  { file: 'export-emails.gs', from: 'calendar', to: 'drive' }, // temp scripts renamed
  
  // Move misplaced chat files
  { file: 'export-chat-daily-details.gs', from: 'chat', to: 'sheets' },
  
  // Move misplaced sheets files
  { file: 'export-emails.gs', from: 'sheets', to: 'drive' }, // temp scripts renamed
  { file: 'date-received-append.gs', from: 'sheets', to: 'gmail' },
  { file: 'time-received-append.gs', from: 'sheets', to: 'gmail' },
  { file: 'sort-sheets-columns.gs', from: 'sheets', to: 'gmail' },
  
  // Move markdown files to drive
  { file: 'markdown-export-calendar-daily.gs', from: 'calendar', to: 'drive' },
  { file: 'markdown-export-calendar-meetings.gs', from: 'calendar', to: 'drive' },
  { file: 'markdown-export-calendar-events.gs', from: 'calendar', to: 'drive' },
  { file: 'markdown-lint-files.gs', from: 'gmail', to: 'drive' },
  { file: 'markdown-fix-formatting.gs', from: 'gmail', to: 'drive' },
  { file: 'clean-email-headers.gs', from: 'gmail', to: 'drive' },
  { file: 'markdown-create-from-sheets.gs', from: 'sheets', to: 'drive' },
  { file: 'markdown-export-files.gs', from: 'sheets', to: 'drive' },
  { file: 'markdown-generate-from-sheets.gs', from: 'sheets', to: 'drive' },
  { file: 'index-sheets-folders-files.gs', from: 'sheets', to: 'drive' },
  { file: 'markdown-index-folders-files.gs', from: 'sheets', to: 'drive' },
  { file: 'markdown-export-tasks-obsidian.gs', from: 'tasks', to: 'drive' },
  { file: 'markdown-export-tasklist-yaml.gs', from: 'tasks', to: 'drive' },
  { file: 'markdown-export-tasks-todos.gs', from: 'tasks', to: 'drive' },
  { file: 'markdown-export-tasks-yaml.gs', from: 'tasks', to: 'drive' },
  { file: 'markdown-export-todos.gs', from: 'tasks', to: 'drive' },
  { file: 'markdown-lint-line-spacing.gs', from: 'utility', to: 'drive' },
  { file: 'markdown-find-yaml.gs', from: 'utility', to: 'drive' },
  { file: 'markdown-categorize-yaml-folders.gs', from: 'utility', to: 'drive' },
  { file: 'markdown-process-yaml.gs', from: 'utility', to: 'drive' }
];

async function fixAllNamingIssues() {
  console.log('🔧 Fixing all naming and placement issues...\n');
  
  const appsDir = path.join(__dirname, '../../apps');
  let renamedCount = 0;
  let movedCount = 0;
  const errors = [];
  
  // First, rename all files according to rules
  console.log('📝 Renaming files...\n');
  for (const rule of renamingRules) {
    const files = await findFilesByName(appsDir, rule.from + '.gs');
    
    for (const oldPath of files) {
      const dir = path.dirname(oldPath);
      const newPath = path.join(dir, rule.to + '.gs');
      
      try {
        // Check if target already exists
        if (await fileExists(newPath)) {
          console.log(`⚠️  Cannot rename ${rule.from}.gs → ${rule.to}.gs (target exists)`);
          continue;
        }
        
        await fs.rename(oldPath, newPath);
        console.log(`✅ Renamed: ${rule.from}.gs → ${rule.to}.gs`);
        renamedCount++;
      } catch (error) {
        errors.push(`Failed to rename ${rule.from}.gs: ${error.message}`);
      }
    }
  }
  
  // Then move files to correct folders
  console.log('\n📁 Moving files to correct folders...\n');
  for (const move of moveRules) {
    const fromPath = path.join(appsDir, move.from, 'src', move.file);
    const toDir = path.join(appsDir, move.to, 'src');
    const toPath = path.join(toDir, move.file);
    
    try {
      // Check if source exists
      if (!(await fileExists(fromPath))) {
        // Try with renamed version
        const renamedFile = renamingRules.find(r => r.from + '.gs' === move.file);
        if (renamedFile) {
          const renamedPath = path.join(appsDir, move.from, 'src', renamedFile.to + '.gs');
          if (await fileExists(renamedPath)) {
            await fs.mkdir(toDir, { recursive: true });
            await fs.rename(renamedPath, path.join(toDir, renamedFile.to + '.gs'));
            console.log(`✅ Moved: ${renamedFile.to}.gs from ${move.from} → ${move.to}`);
            movedCount++;
          }
        }
        continue;
      }
      
      // Create target directory if needed
      await fs.mkdir(toDir, { recursive: true });
      
      // Check if target already exists
      if (await fileExists(toPath)) {
        console.log(`⚠️  Cannot move ${move.file} (target exists in ${move.to})`);
        continue;
      }
      
      await fs.rename(fromPath, toPath);
      console.log(`✅ Moved: ${move.file} from ${move.from} → ${move.to}`);
      movedCount++;
    } catch (error) {
      errors.push(`Failed to move ${move.file}: ${error.message}`);
    }
  }
  
  // Report results
  console.log('\n📊 Summary:');
  console.log(`- Files renamed: ${renamedCount}`);
  console.log(`- Files moved: ${movedCount}`);
  console.log(`- Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  console.log('\n✅ Fix script completed');
}

async function findFilesByName(dir, filename, files = []) {
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      await findFilesByName(fullPath, filename, files);
    } else if (item === filename) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  fixAllNamingIssues().catch(console.error);
}

module.exports = { fixAllNamingIssues };