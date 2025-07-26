#!/usr/bin/env node

/**
 * Download GAS projects and delete empty ones from Google
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function downloadAndClean(scriptId, projectName) {
  console.log(`\n📥 Processing: ${projectName} (${scriptId})`);
  
  const tempDir = path.join(__dirname, '../../temp/external-projects');
  const projectDir = path.join(tempDir, projectName.toLowerCase().replace(/\s+/g, '-'));
  
  try {
    // Create project directory
    await fs.mkdir(projectDir, { recursive: true });
    
    // Create .clasp.json
    const claspConfig = {
      scriptId: scriptId,
      rootDir: "."
    };
    await fs.writeFile(path.join(projectDir, '.clasp.json'), JSON.stringify(claspConfig, null, 2));
    
    // Pull the project
    console.log('  ⏳ Downloading files...');
    execSync(`cd "${projectDir}" && clasp pull`, { stdio: 'inherit' });
    
    // Check if project is empty
    const files = await fs.readdir(projectDir);
    const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.gs'));
    
    let isEmpty = true;
    for (const file of jsFiles) {
      const content = await fs.readFile(path.join(projectDir, file), 'utf8');
      // Check if file has meaningful content (not just empty function)
      if (content.length > 50 || !content.includes('function myFunction()')) {
        isEmpty = false;
        break;
      }
    }
    
    if (isEmpty) {
      console.log('  🗑️  Project is empty - will be deleted');
      // Remove local copy
      await fs.rm(projectDir, { recursive: true });
      
      // Provide instructions to delete from Google
      console.log(`
  ⚠️  TO DELETE FROM GOOGLE:
  1. Go to: https://script.google.com/d/${scriptId}/edit
  2. Click File → Delete Project → Delete Forever
  3. Or visit: https://script.google.com/home
  4. Find "${projectName}" and click ⋮ → Remove
`);
      return { status: 'empty', deleted: true };
    } else {
      console.log('  ✅ Project has content - kept for migration');
      return { status: 'kept', path: projectDir };
    }
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

async function processAllExternal() {
  // Get list of projects
  console.log('🔍 Getting list of all projects...\n');
  
  try {
    const output = execSync('clasp list', { encoding: 'utf8' });
    const lines = output.split('\n').filter(line => line.trim());
    
    // Known project IDs from repository
    const knownProjects = [
      '1X3W2-mJ5ss_2Xl8zHlQXq8ndwnPHURvUynnp-v5t39xL7j4LdDTEVl1B', // utility
      '1GtzgEyKr39SNn9OuOXMoYLdEigAdGV447GJFutEJFNl1GQHos0XyBA5O', // tasks
      '1HfBP6a8zJ7piAu74Q0iVFnik7wIOj5jsUIkqeNAM5IGlfE2AJwQMz9dZ', // sheets
      '1bkbORqQD2is7LWtlHRr6D_nCtd6uk1PP9t3SsVeCXobOrPgsVnK7yxPx', // photos
      '1MhC1spUX-j1HfITDj6g68G2EobqbiZDiIpJJAxCEQOBAozERJPMoiXuq', // gmail
      '1Y62ucpYOhuhZ7PAQaBSg8ICqd0uPWPQ3aqwhgpbc6fDGwmlqKFjq0lLO', // drive
      '16U33iZkZSoN_h697FSbTsa3Ma5yD0e6p7gGjeWgH1xlTuWzfg6X3NHgz', // docs
      '1j9M60-KeKOMlxdUVKCb0sO3c01OSL-btzmFj3Q77vcE0dY0aqz1ON7F8', // chat
      '1WBzQgskRgRPJkPBLhjf-2CHNVRqYVIh2Io-fBW75Ro_9wOpX8uzUIHUh', // calendar
      '1qWMrnFNy3b_Y1lo54Xjxzlg01t57ZmYMb1FB8N_JWTg_shNe318Zd55h'  // slides
    ];
    
    const externalProjects = [];
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\s+-\s+https:\/\/script\.google\.com\/d\/([^\/]+)/);
      if (match) {
        const name = match[1].trim();
        const scriptId = match[2].trim();
        
        if (!knownProjects.includes(scriptId)) {
          externalProjects.push({ name, scriptId });
        }
      }
    }
    
    console.log(`Found ${externalProjects.length} external projects\n`);
    
    const results = [];
    for (const project of externalProjects) {
      const result = await downloadAndClean(project.scriptId, project.name);
      results.push({ ...project, ...result });
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    
    const kept = results.filter(r => r.status === 'kept');
    const empty = results.filter(r => r.status === 'empty');
    const errors = results.filter(r => r.status === 'error');
    
    console.log(`✅ Projects with content: ${kept.length}`);
    console.log(`🗑️  Empty projects: ${empty.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (kept.length > 0) {
      console.log('\n📁 Projects ready for migration:');
      kept.forEach(p => console.log(`  - ${p.name} → ${p.path}`));
    }
    
    if (empty.length > 0) {
      console.log('\n🗑️  Empty projects to delete from Google:');
      empty.forEach(p => console.log(`  - ${p.name} (${p.scriptId})`));
    }
    
  } catch (error) {
    console.error('Error getting project list:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 2) {
    // Download specific project
    downloadAndClean(args[0], args[1]).catch(console.error);
  } else {
    // Process all external projects
    processAllExternal().catch(console.error);
  }
}

module.exports = { downloadAndClean, processAllExternal };