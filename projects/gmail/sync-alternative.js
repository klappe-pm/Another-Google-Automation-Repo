#!/usr/bin/env node

// Alternative sync approach using Google Apps Script API directly
// This bypasses clasp authentication issues

const fs = require('fs');
const path = require('path');

const SCRIPT_ID = '1MhC1spUX-j1HfITDj6g68G2EobqbiZDiIpJJAxCEQOBAozERJPMoiXuq';
const SRC_DIR = './src';

// Read all .gs files and prepare for API upload
function prepareFiles() {
    const files = fs.readdirSync(SRC_DIR)
        .filter(file => file.endsWith('.gs') || file === 'appsscript.json')
        .map(file => {
            const filePath = path.join(SRC_DIR, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const name = file.replace('.gs', '').replace('.json', '');
            const type = file.endsWith('.json') ? 'JSON' : 'SERVER_JS';
            
            return {
                name: name,
                type: type,
                source: content
            };
        });
    
    console.log(`Found ${files.length} files to sync:`);
    files.forEach(f => console.log(`  - ${f.name} (${f.type})`));
    
    return files;
}

// Generate curl commands for manual API calls
function generateApiCommands(files) {
    console.log('\n=== Alternative: Manual API Upload Commands ===');
    console.log('If clasp continues to fail, you can use these curl commands:');
    console.log('\n1. First, get an access token:');
    console.log('   gcloud auth print-access-token');
    console.log('\n2. Then run this command with your access token:');
    
    const payload = {
        files: files
    };
    
    console.log(`curl -X PUT \\
  "https://script.googleapis.com/v1/projects/${SCRIPT_ID}/content" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`);
}

// Main execution
console.log('=== Gmail Automation Sync Alternative ===');
const files = prepareFiles();
generateApiCommands(files);

console.log('\n=== Next Steps ===');
console.log('1. Try: clasp push --force (one more time)');
console.log('2. If that fails, use the curl command above');
console.log('3. Or manually copy files to Apps Script editor');
console.log(`4. Project URL: https://script.google.com/home/projects/${SCRIPT_ID}/edit`);
