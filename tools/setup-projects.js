#!/usr/bin/env node

/**
 * Project Setup and Template Generator
 * Automates creation of new Google Apps Script projects using standardized templates
 * 
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * Created: 2025-07-20
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const CONFIG = {
  TEMPLATES_DIR: path.join(__dirname, 'templates'),
  SCRIPTS_DIR: path.join(__dirname, '../scripts'),
  CONFIG_DIR: path.join(__dirname, 'config'),
  SUPPORTED_SERVICES: ['calendar', 'gmail', 'drive', 'sheets', 'docs', 'tasks', 'chat', 'slides'],
  DEFAULT_SCOPES: {
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
    slides: [
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/drive.file'
    ]
  }
};

/**
 * Main setup orchestrator
 */
async function main() {
  try {
    console.log('🚀 Google Apps Script Project Setup Tool');
    console.log('=========================================\n');
    
    const projectInfo = await gatherProjectInfo();
    
    if (!projectInfo) {
      console.log('Setup cancelled.');
      return;
    }
    
    console.log('\n📁 Creating project structure...');
    await createProjectStructure(projectInfo);
    
    console.log('📝 Generating configuration files...');
    await generateConfigFiles(projectInfo);
    
    console.log('📋 Creating script template...');
    await generateScriptTemplate(projectInfo);
    
    console.log('📊 Updating deployment status...');
    await updateDeploymentStatus(projectInfo);
    
    console.log('\n✅ Project setup completed successfully!');
    console.log(`\n📂 Project created at: ${projectInfo.projectPath}`);
    console.log('\nNext steps:');
    console.log('1. Review generated files');
    console.log('2. Customize script functionality');
    console.log('3. Test script execution');
    console.log('4. Deploy using clasp');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Gather project information from user input
 */
async function gatherProjectInfo() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise(resolve => rl.question(query, resolve));
  
  try {
    console.log('Please provide the following information:\n');
    
    const projectName = await question('Project name (e.g., calendar-export-events): ');
    if (!projectName.trim()) {
      console.log('Project name is required.');
      rl.close();
      return null;
    }
    
    console.log(`\nSupported services: ${CONFIG.SUPPORTED_SERVICES.join(', ')}`);
    const service = await question('Google service (e.g., calendar, gmail, drive): ');
    if (!CONFIG.SUPPORTED_SERVICES.includes(service.toLowerCase())) {
      console.log('Invalid service. Please choose from supported services.');
      rl.close();
      return null;
    }
    
    const functionType = await question('Function type (e.g., export, import, analysis, create): ');
    const description = await question('Brief description: ');
    const complexity = await question('Complexity level (basic, intermediate, advanced) [basic]: ') || 'basic';
    
    const createClasp = await question('Create clasp configuration? (y/n) [y]: ');
    const initGit = await question('Initialize git repository? (y/n) [y]: ');
    
    rl.close();
    
    const fileName = `${projectName}.gs`;
    const projectPath = path.join(CONFIG.SCRIPTS_DIR, service.toLowerCase());
    
    return {
      projectName: projectName.trim(),
      service: service.toLowerCase(),
      functionType: functionType.trim(),
      description: description.trim(),
      complexity: complexity.toLowerCase(),
      fileName,
      projectPath,
      fullPath: path.join(projectPath, fileName),
      createClasp: createClasp.toLowerCase() !== 'n',
      initGit: initGit.toLowerCase() !== 'n',
      timestamp: new Date().toISOString(),
      scopes: CONFIG.DEFAULT_SCOPES[service.toLowerCase()] || []
    };
    
  } catch (error) {
    rl.close();
    throw error;
  }
}

/**
 * Create project directory structure
 */
async function createProjectStructure(projectInfo) {
  // Ensure service directory exists
  if (!fs.existsSync(projectInfo.projectPath)) {
    fs.mkdirSync(projectInfo.projectPath, { recursive: true });
    console.log(`Created directory: ${projectInfo.projectPath}`);
  }
  
  // Create additional directories if needed
  const directories = ['test', 'docs', 'examples'];
  for (const dir of directories) {
    const dirPath = path.join(projectInfo.projectPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

/**
 * Generate configuration files from templates
 */
async function generateConfigFiles(projectInfo) {
  // Generate project config
  await generateFromTemplate('project-config.template.json', projectInfo, 'project-config.json');
  
  // Generate Apps Script manifest
  await generateFromTemplate('appsscript.template.json', projectInfo, 'appsscript.json');
  
  // Generate clasp config if requested
  if (projectInfo.createClasp) {
    await generateFromTemplate('clasp.template.json', projectInfo, '.clasp.json');
  }
}

/**
 * Generate script file from template
 */
async function generateScriptTemplate(projectInfo) {
  const templatePath = path.join(CONFIG.TEMPLATES_DIR, 'script-header.template.js');
  const outputPath = projectInfo.fullPath;
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  
  let content = fs.readFileSync(templatePath, 'utf8');
  
  // Replace template variables
  const replacements = {
    '{{SCRIPT_TITLE}}': capitalizeWords(projectInfo.projectName.replace(/-/g, ' ')),
    '{{GOOGLE_SERVICE}}': capitalizeWords(projectInfo.service),
    '{{SCRIPT_PURPOSE}}': projectInfo.description,
    '{{CREATION_DATE}}': new Date().toISOString().split('T')[0],
    '{{LAST_UPDATED}}': new Date().toISOString().split('T')[0],
    '{{VERSION}}': '1.0.0',
    '{{DETAILED_PURPOSE}}': projectInfo.description,
    '{{SCRIPT_DESCRIPTION}}': `${capitalizeWords(projectInfo.functionType)} functionality for ${projectInfo.service}`,
    '{{PROBLEM_SOLVED}}': `Automates ${projectInfo.functionType} operations for Google ${capitalizeWords(projectInfo.service)}`,
    '{{SUCCESS_CRITERIA}}': `Successfully ${projectInfo.functionType}s data without errors`,
    '{{PREREQUISITES}}': `Google ${capitalizeWords(projectInfo.service)} access, appropriate permissions`,
    '{{DEPENDENCIES}}': projectInfo.scopes.join(', '),
    '{{OUTPUT_FORMAT}}': 'JSON object with success status and results',
    '{{EXPECTED_RUNTIME}}': 'Under 5 minutes for typical operations',
    '{{REQUIRED_SCOPES}}': projectInfo.scopes.join(', '),
    '{{CHANGE_DESCRIPTION}}': 'Initial implementation',
    '{{MAIN_FUNCTION_NAME}}': camelCase(`${projectInfo.functionType}_${projectInfo.service}_data`),
    '{{MAIN_PARAM_NAME}}': 'options',
    '{{MAIN_PARAM_TYPE}}': 'Object',
    '{{MAIN_PARAM_DESCRIPTION}}': 'Configuration options for the operation',
    '{{RETURN_TYPE}}': 'Object',
    '{{RETURN_DESCRIPTION}}': 'Result object with success status and data'
  };
  
  // Apply replacements
  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  
  fs.writeFileSync(outputPath, content);
  console.log(`Generated script: ${outputPath}`);
}

/**
 * Generate file from template with variable replacement
 */
async function generateFromTemplate(templateName, projectInfo, outputName) {
  const templatePath = path.join(CONFIG.TEMPLATES_DIR, templateName);
  const outputPath = path.join(projectInfo.projectPath, outputName);
  
  if (!fs.existsSync(templatePath)) {
    console.log(`⚠️  Template not found: ${templateName}`);
    return;
  }
  
  let content = fs.readFileSync(templatePath, 'utf8');
  
  // Standard replacements
  const replacements = {
    '{{PROJECT_NAME}}': projectInfo.projectName,
    '{{SERVICE_NAME}}': projectInfo.service,
    '{{PROJECT_DESCRIPTION}}': projectInfo.description,
    '{{CREATION_DATE}}': projectInfo.timestamp,
    '{{MODIFICATION_DATE}}': projectInfo.timestamp,
    '{{REQUIRED_SCOPES}}': projectInfo.scopes.join('", "'),
    '{{OAUTH_SCOPES}}': projectInfo.scopes.join('", "'),
    '{{TAGS}}': `${projectInfo.service}, ${projectInfo.functionType}, ${projectInfo.complexity}`,
    '{{CATEGORY}}': projectInfo.service,
    '{{COMPLEXITY}}': projectInfo.complexity,
    '{{SERVICE_SYMBOL}}': capitalizeWords(projectInfo.service),
    '{{SERVICE_ID}}': getServiceId(projectInfo.service),
    '{{SERVICE_VERSION}}': 'v1',
    '{{ALLOWED_DOMAINS}}': '',
    '{{MENU_NAME}}': capitalizeWords(projectInfo.projectName.replace(/-/g, ' ')),
    '{{FUNCTION_NAME}}': camelCase(projectInfo.projectName),
    '{{SCRIPT_ID}}': 'REPLACE_WITH_ACTUAL_SCRIPT_ID',
    '{{PARENT_ID}}': '',
    '{{ROOT_DIR}}': '.',
    '{{PROJECT_ID}}': '',
    '{{MAIN_FILE}}': projectInfo.projectName,
    '{{DEPLOYMENT_DESCRIPTION}}': `${projectInfo.description} - v1.0.0`,
    '{{VERSION_NUMBER}}': '1'
  };
  
  // Apply replacements
  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  
  fs.writeFileSync(outputPath, content);
  console.log(`Generated: ${outputName}`);
}

/**
 * Update deployment status tracking
 */
async function updateDeploymentStatus(projectInfo) {
  const statusFile = path.join(CONFIG.CONFIG_DIR, 'deployment-status.json');
  
  if (!fs.existsSync(statusFile)) {
    console.log('⚠️  Deployment status file not found');
    return;
  }
  
  const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
  
  // Add new script to tracking
  if (!status.scripts[projectInfo.service]) {
    status.scripts[projectInfo.service] = {};
  }
  
  status.scripts[projectInfo.service][projectInfo.fileName] = {
    status: 'draft',
    lastModified: projectInfo.timestamp,
    version: '1.0.0',
    notes: 'Newly created project'
  };
  
  // Update statistics
  status.statistics.lastScan = projectInfo.timestamp;
  
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
  console.log('Updated deployment status tracking');
}

/**
 * Utility functions
 */
function capitalizeWords(str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

function camelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function getServiceId(service) {
  const serviceIds = {
    calendar: 'calendar',
    gmail: 'gmail',
    drive: 'drive',
    sheets: 'sheets',
    docs: 'docs',
    tasks: 'tasks',
    chat: 'chat',
    slides: 'slides'
  };
  return serviceIds[service] || service;
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  gatherProjectInfo,
  createProjectStructure,
  generateConfigFiles,
  generateScriptTemplate,
  updateDeploymentStatus
};