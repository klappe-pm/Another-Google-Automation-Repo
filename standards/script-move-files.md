
```javascript
const fs = require('fs');
const path = require('path');

// Source directory with current standards
const sourceDir = '/Users/kevinlappe/Documents/GitHub/Workspace Automation/docs';

// Target directory for standards
const targetDir = '/Users/kevinlappe/Documents/GitHub/Standards';

// List of standards files to move
const standardsFiles = [
  'DOCUMENTATION_STANDARDS.md',
  'PERFORMANCE_STANDARDS.md',
  'SECURITY_STANDARDS.md',
  'CODE_ORGANIZATION_STANDARDS.md',
  'ERROR_HANDLING_STANDARDS.md',
  'TESTING_STANDARDS.md'
];

// Function to convert underscores to dashes
function convertUnderscoresToDashes(filename) {
  return filename.replace(/_/g, '-');
}

// Function to move and rename file
function moveAndRenameFile(sourcePath, targetPath) {
  try {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(path.dirname(targetPath))) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    }
    
    // Move and rename file
    fs.renameSync(sourcePath, targetPath);
    console.log(`Moved and renamed: ${sourcePath} -> ${targetPath}`);
    return true;
  } catch (error) {
    console.error(`Error moving ${sourcePath}: ${error.message}`);
    return false;
  }
}

// Main function to process all standards files
function processStandardsFiles() {
  let successCount = 0;
  let errorCount = 0;

  standardsFiles.forEach(filename => {
    const sourcePath = path.join(sourceDir, filename);
    const targetFilename = convertUnderscoresToDashes(filename);
    const targetPath = path.join(targetDir, targetFilename);

    if (moveAndRenameFile(sourcePath, targetPath)) {
      successCount++;
    } else {
      errorCount++;
    }
  });

  console.log(`\nSummary:`);
  console.log(`Successfully moved and renamed: ${successCount} files`);
  console.log(`Failed to move: ${errorCount} files`);
}

// Run the process
processStandardsFiles();

```