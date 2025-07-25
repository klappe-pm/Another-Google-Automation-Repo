#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  SCRIPTS_DIR: path.join(__dirname, '../scripts'),
  PROJECTS_DIR: path.join(__dirname, '../apps'),
  SERVICES: ['calendar', 'gmail', 'drive', 'sheets', 'docs', 'tasks', 'chat', 'photos', 'utility']
};

async function main() {
  try {
    console.log('🚀 Google Apps Script Migration Tool');
    console.log('====================================\n');
    
    console.log('📂 Scanning for .gs files...');
    const gsFiles = await findAllGsFiles();
    
    console.log(`📊 Found ${gsFiles.length} .gs files to migrate\n`);
    
    console.log('📁 Migrating files to new structure...');
    await migrateFiles(gsFiles);
    
    console.log('📄 Creating project configuration files...');
    await createProjectConfigs();
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`\n📊 Migration Summary:`);
    console.log(`- Files migrated: ${gsFiles.length}`);
    console.log(`- Projects created: ${CONFIG.SERVICES.length}`);
    console.log('\nNext steps:');
    console.log('1. Review migrated files in /projects/*/src/');
    console.log('2. Update .clasp.json files with actual script IDs');
    console.log('3. Test project deployments');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

async function findAllGsFiles() {
  const gsFiles = [];
  
  function scanDirectory(dir, service = null) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // If this is a service directory, note the service
        const currentService = CONFIG.SERVICES.includes(item) ? item : service;
        scanDirectory(fullPath, currentService);
      } else if (item.endsWith('.gs')) {
        gsFiles.push({
          originalPath: fullPath,
          fileName: item,
          service: service || guessServiceFromPath(fullPath),
          relativePath: path.relative(CONFIG.SCRIPTS_DIR, fullPath)
        });
      }
    }
  }
  
  scanDirectory(CONFIG.SCRIPTS_DIR);
  return gsFiles;
}

function guessServiceFromPath(filePath) {
  const relativePath = path.relative(CONFIG.SCRIPTS_DIR, filePath).toLowerCase();
  
  for (const service of CONFIG.SERVICES) {
    if (relativePath.includes(service)) {
      return service;
    }
  }
  
  // Default to utility if we can't determine
  return 'utility';
}

async function migrateFiles(gsFiles) {
  const migrationStats = {};
  
  for (const file of gsFiles) {
    const { originalPath, fileName, service } = file;
    
    // Ensure project directory exists
    const projectDir = path.join(CONFIG.PROJECTS_DIR, service);
    const srcDir = path.join(projectDir, 'src');
    
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
    
    // Determine destination path
    const destPath = path.join(srcDir, fileName);
    
    // Handle filename conflicts
    let finalDestPath = destPath;
    let counter = 1;
    while (fs.existsSync(finalDestPath)) {
      const basename = path.basename(fileName, '.gs');
      finalDestPath = path.join(srcDir, `${basename}-${counter}.gs`);
      counter++;
    }
    
    // Copy the file
    fs.copyFileSync(originalPath, finalDestPath);
    
    // Track stats
    if (!migrationStats[service]) {
      migrationStats[service] = 0;
    }
    migrationStats[service]++;
    
    console.log(`  ✓ ${service}/${path.basename(finalDestPath)}`);
  }
  
  // Print migration statistics
  console.log('\n📊 Migration Statistics:');
  for (const [service, count] of Object.entries(migrationStats)) {
    console.log(`  ${service}: ${count} files`);
  }
}

async function createProjectConfigs() {
  for (const service of CONFIG.SERVICES) {
    const projectDir = path.join(CONFIG.PROJECTS_DIR, service);
    const configPath = path.join(projectDir, 'project-config.json');
    
    if (!fs.existsSync(projectDir)) continue;
    
    const config = {
      name: `${capitalizeWords(service)} Automation`,
      service: service,
      status: "draft",
      version: "1.0.0",
      description: `Google Apps Script automation tools for ${capitalizeWords(service)}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: [service, "automation", "google-apps-script"],
      complexity: "intermediate",
      requirements: {
        scopes: getDefaultScopes(service),
        dependencies: []
      },
      deployment: {
        environment: "development",
        scriptId: `example-${service}-script-id`,
        lastDeployed: null
      },
      testing: {
        status: "pending",
        lastTested: null,
        testResults: null
      }
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`  ✓ Created ${service}/project-config.json`);
  }
}

function getDefaultScopes(service) {
  const scopes = {
    calendar: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    gmail: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    drive: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ],
    sheets: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ],
    docs: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file'
    ],
    tasks: [
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/tasks.readonly'
    ],
    chat: [
      'https://www.googleapis.com/auth/chat.bot'
    ],
    photos: [
      'https://www.googleapis.com/auth/photoslibrary',
      'https://www.googleapis.com/auth/photoslibrary.readonly'
    ],
    utility: [
      'https://www.googleapis.com/auth/script.external_request'
    ]
  };
  
  return scopes[service] || [];
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  findAllGsFiles,
  migrateFiles,
  createProjectConfigs
};