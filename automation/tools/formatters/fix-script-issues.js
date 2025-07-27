#!/usr/bin/env node

/**
 * Fix script naming and placement issues
 * Generated from analysis report
 */

const fs = require('fs').promises;
const path = require('path');

async function fixScriptIssues() {
  console.log('🔧 Fixing script naming and placement issues...\n');
  
  const renames = [
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/calendar/src/temp-script-2.gs",
    "currentName": "temp-script-2",
    "suggestedName": "export-emails",
    "reason": "export emails"
  },
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/calendar/src/temp-script-3.gs",
    "currentName": "temp-script-3",
    "suggestedName": "export-emails",
    "reason": "export emails"
  },
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/calendar/src/temp-script.gs",
    "currentName": "temp-script",
    "suggestedName": "export-emails",
    "reason": "export emails"
  },
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/sheets/src/temp-script-4.gs",
    "currentName": "temp-script-4",
    "suggestedName": "export-emails",
    "reason": "export emails"
  },
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/sheets/src/temp-script-5.gs",
    "currentName": "temp-script-5",
    "suggestedName": "export-emails",
    "reason": "export emails"
  }
];
  
  const moves = [
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/calendar/src/temp-script-2.gs",
    "currentFolder": "src",
    "suggestedFolder": "drive",
    "reason": "drive"
  },
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/calendar/src/temp-script-3.gs",
    "currentFolder": "src",
    "suggestedFolder": "drive",
    "reason": "drive"
  },
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/calendar/src/temp-script.gs",
    "currentFolder": "src",
    "suggestedFolder": "drive",
    "reason": "drive"
  },
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/sheets/src/temp-script-4.gs",
    "currentFolder": "src",
    "suggestedFolder": "drive",
    "reason": "drive"
  },
  {
    "file": "/Users/kevinlappe/Documents/GitHub/Workspace Automation/apps/sheets/src/temp-script-5.gs",
    "currentFolder": "src",
    "suggestedFolder": "drive",
    "reason": "drive"
  }
];
  
  // Process renames
  for (const rename of renames) {
    const dir = path.dirname(rename.file);
    const newPath = path.join(dir, rename.suggestedName + '.gs');
    
    try {
      await fs.rename(rename.file, newPath);
      console.log(`✅ Renamed: ${rename.currentName}.gs → ${rename.suggestedName}.gs`);
    } catch (error) {
      console.error(`❌ Failed to rename ${rename.currentName}.gs: ${error.message}`);
    }
  }
  
  // Process moves
  for (const move of moves) {
    const filename = path.basename(move.file);
    const newDir = move.file.replace(`/${move.currentFolder}/`, `/${move.suggestedFolder}/`);
    const newPath = path.join(path.dirname(newDir), filename);
    
    try {
      await fs.mkdir(path.dirname(newPath), { recursive: true });
      await fs.rename(move.file, newPath);
      console.log(`✅ Moved: ${filename} from ${move.currentFolder} → ${move.suggestedFolder}`);
    } catch (error) {
      console.error(`❌ Failed to move ${filename}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Fix script completed');
}

// Run if called directly
if (require.main === module) {
  fixScriptIssues().catch(console.error);
}
