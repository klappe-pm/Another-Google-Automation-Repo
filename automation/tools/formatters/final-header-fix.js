#!/usr/bin/env node

/**
 * Final comprehensive header fix - remove ALL old headers and fix malformed comments
 */

const fs = require('fs').promises;
const path = require('path');

async function finalHeaderFix() {
  console.log('🔧 Final header fix - comprehensive cleanup...\n');
  
  const appsDir = path.join(__dirname, '../../apps');
  let processedCount = 0;
  let errorCount = 0;
  
  // Find all .gs files
  const allFiles = await findAllGsFiles(appsDir);
  
  for (const filePath of allFiles) {
    try {
      console.log(`Processing: ${path.basename(filePath)}...`);
      let content = await fs.readFile(filePath, 'utf8');
      
      // Step 1: Fix malformed comments FIRST
      content = fixMalformedComments(content);
      
      // Step 2: Remove ALL headers and comments at the start
      content = removeAllHeadersComprehensive(content);
      
      // Step 3: Re-analyze the clean content
      const analysis = analyzeScript(content, filePath);
      
      // Step 4: Generate new header
      const header = generateHeader(analysis);
      
      // Step 5: Reorganize functions
      const reorganizedContent = reorganizeFunctions(content, [...analysis.functions, ...analysis.helperFunctions]);
      
      // Step 6: Combine header and content
      const finalContent = header + '\n\n' + reorganizedContent.trim();
      
      await fs.writeFile(filePath, finalContent);
      processedCount++;
      
      console.log(`✅ ${path.basename(filePath)} - fully fixed`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error processing ${path.basename(filePath)}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Final header fix complete: ${processedCount} files processed, ${errorCount} errors`);
}

function fixMalformedComments(content) {
  // Fix comments with spaces between slashes and stars
  content = content.replace(/\/\s+\*/g, '/*');
  content = content.replace(/\*\s+\//g, '*/');
  content = content.replace(/\/\s+\//g, '//');
  
  // Fix other malformed patterns
  content = content.replace(/=\s+=\s+=/g, '===');
  content = content.replace(/=\s+>/g, '=>');
  content = content.replace(/\+\s+\+/g, '++');
  content = content.replace(/\+\s+=/g, '+=');
  content = content.replace(/-\s+-\s+-/g, '---');
  content = content.replace(/\s+;\s+/g, '; ');
  
  return content;
}

function removeAllHeadersComprehensive(content) {
  // Step 1: Remove any header block at the very start
  let lines = content.split('\n');
  let startIndex = 0;
  let inHeaderBlock = false;
  
  // Find where actual code starts
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if we're in a comment block
    if (trimmed.startsWith('/**') || trimmed.startsWith('/*')) {
      inHeaderBlock = true;
    }
    
    // Check for end of comment block
    if (inHeaderBlock && (trimmed.endsWith('*/') || trimmed === '*/')) {
      startIndex = i + 1;
      inHeaderBlock = false;
      continue;
    }
    
    // Skip single line comments at the start
    if (!inHeaderBlock && (trimmed.startsWith('//') || trimmed === '')) {
      startIndex = i + 1;
      continue;
    }
    
    // If we hit actual code, we're done
    if (!inHeaderBlock && trimmed !== '' && !trimmed.startsWith('//')) {
      break;
    }
  }
  
  // Keep only the code part
  lines = lines.slice(startIndex);
  
  // Step 2: Clean up any remaining header-like content
  lines = lines.filter((line, index) => {
    // Remove lines that look like old headers
    if (line.includes('* Title:') || 
        line.includes('* Description:') || 
        line.includes('* Script Name:') ||
        line.includes('* Functions:') ||
        line.includes('* @') && index < 20) {
      return false;
    }
    return true;
  });
  
  // Join and clean up
  content = lines.join('\n').trim();
  
  // Remove any remaining header patterns
  content = content.replace(/^\/\*[\s\S]*?\*\/\s*/gm, '');
  content = content.replace(/^(\/\/.*\n)+/gm, '');
  
  return content;
}

// Copy the rest of the functions from fix-script-headers.js
function analyzeScript(content, filePath) {
  const analysis = {
    scriptName: path.basename(filePath, '.gs'),
    summary: '',
    purpose: [],
    steps: [],
    functions: [],
    helperFunctions: [],
    dependencies: [],
    googleServices: new Set()
  };
  
  // Extract all functions
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
  let match;
  const functionBodies = {};
  
  while ((match = functionRegex.exec(content)) !== null) {
    const funcName = match[1];
    const funcStart = match.index;
    const funcBody = extractFunctionBody(content, funcStart);
    functionBodies[funcName] = funcBody;
  }
  
  // Categorize functions
  Object.entries(functionBodies).forEach(([name, body]) => {
    const funcInfo = {
      name: name,
      description: inferFunctionPurpose(name, body)
    };
    
    if (isHelperFunction(name, body)) {
      analysis.helperFunctions.push(funcInfo);
    } else {
      analysis.functions.push(funcInfo);
    }
  });
  
  // Sort functions alphabetically
  analysis.functions.sort((a, b) => a.name.localeCompare(b.name));
  analysis.helperFunctions.sort((a, b) => a.name.localeCompare(b.name));
  
  // Detect Google Services
  const servicePatterns = {
    'GmailApp': ['GmailApp', 'Gmail.Users'],
    'DriveApp': ['DriveApp', 'Drive.Files', 'Drive.Folders'],
    'SpreadsheetApp': ['SpreadsheetApp', 'Sheets.Spreadsheets'],
    'DocumentApp': ['DocumentApp', 'Docs.Documents'],
    'CalendarApp': ['CalendarApp', 'Calendar.Events'],
    'Tasks': ['Tasks.Tasklists', 'Tasks.Tasks'],
    'UrlFetchApp': ['UrlFetchApp'],
    'PropertiesService': ['PropertiesService'],
    'ScriptApp': ['ScriptApp'],
    'Utilities': ['Utilities'],
    'HtmlService': ['HtmlService'],
    'FormApp': ['FormApp'],
    'Logger': ['Logger.log']
  };
  
  Object.entries(servicePatterns).forEach(([service, patterns]) => {
    patterns.forEach(pattern => {
      if (content.includes(pattern)) {
        analysis.googleServices.add(service);
      }
    });
  });
  
  // Infer summary and purpose
  analysis.summary = inferScriptSummary(analysis.scriptName, content);
  analysis.purpose = inferScriptPurpose(analysis.scriptName, content, analysis.functions);
  
  // Infer steps
  analysis.steps = inferScriptSteps(content, analysis.functions);
  
  // Check for dependencies
  analysis.dependencies = inferDependencies(content);
  
  return analysis;
}

function extractFunctionBody(content, startIndex) {
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  let i = startIndex;
  
  // Find opening brace
  while (i < content.length && content[i] !== '{') {
    i++;
  }
  
  if (i >= content.length) return '';
  
  const bodyStart = i;
  
  // Extract function body
  for (; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';
    
    // Handle strings
    if (!inString && (char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
    }
    
    // Count braces outside strings
    if (!inString) {
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      
      if (braceCount === 0) {
        return content.substring(bodyStart, i + 1);
      }
    }
  }
  
  return content.substring(bodyStart);
}

function isHelperFunction(name, body) {
  const helperPatterns = [
    /^_/,
    /^helper/i,
    /^util/i,
    /^get\w+Config$/,
    /^validate/i,
    /^format/i,
    /^parse/i,
    /^convert/i,
    /^sanitize/i,
    /^normalize/i,
    /^is[A-Z]/,
    /^has[A-Z]/,
    /Handler$/,
    /Callback$/
  ];
  
  if (helperPatterns.some(pattern => pattern.test(name))) {
    return true;
  }
  
  const isSmallFunction = body.split('\n').length < 10;
  const hasSimpleReturn = /return\s+[^;]+;/.test(body) && !/if|for|while/.test(body);
  
  return isSmallFunction && hasSimpleReturn;
}

function inferFunctionPurpose(name, body) {
  const patterns = {
    'export': 'Exports data to external format',
    'import': 'Imports data from external source',
    'fetch': 'Retrieves data from service',
    'get': 'Gets specific data or configuration',
    'set': 'Sets data or configuration values',
    'create': 'Creates new items or resources',
    'update': 'Updates existing data',
    'delete': 'Removes items or data',
    'remove': 'Removes elements from collection',
    'process': 'Processes and transforms data',
    'analyze': 'Analyzes data and generates insights',
    'calculate': 'Performs calculations on data',
    'generate': 'Generates new content or reports',
    'build': 'Constructs complex data structures',
    'parse': 'Parses and extracts data',
    'extract': 'Extracts specific information',
    'transform': 'Transforms data format',
    'format': 'Formats data for display',
    'validate': 'Validates data integrity',
    'sanitize': 'Cleans and sanitizes input',
    'normalize': 'Normalizes data format',
    'convert': 'Converts between formats',
    'merge': 'Combines multiple data sources',
    'sort': 'Sorts and orders data',
    'filter': 'Filters data by criteria',
    'search': 'Searches for specific items',
    'find': 'Finds matching elements',
    'read': 'Reads data from source',
    'write': 'Writes data to destination',
    'send': 'Sends data or communications',
    'save': 'Saves data persistently',
    'load': 'Loads data from storage',
    'init': 'Initializes resources or configuration',
    'setup': 'Sets up initial state',
    'run': 'Executes main process',
    'execute': 'Executes specific operation',
    'handle': 'Handles events or errors',
    'trigger': 'Triggers actions or events',
    'check': 'Checks conditions or status',
    'verify': 'Verifies data or state',
    'is': 'Checks boolean condition',
    'has': 'Checks for existence',
    'can': 'Checks permissions or capability',
    'log': 'Logs data or messages',
    'append': 'Appends data to existing content',
    'insert': 'Inserts data at specific position',
    'list': 'Lists items or resources',
    'count': 'Counts items or occurrences',
    'assist': 'Provides assistance or support'
  };
  
  for (const [pattern, description] of Object.entries(patterns)) {
    if (name.toLowerCase().includes(pattern)) {
      const subject = name.replace(new RegExp(pattern, 'i'), '').replace(/([A-Z])/g, ' $1').trim();
      if (subject) {
        return description.replace(/data|items|elements/, subject.toLowerCase());
      }
      return description;
    }
  }
  
  if (body.includes('Sheet') || body.includes('Range')) {
    return 'Works with spreadsheet data';
  }
  if (body.includes('Gmail') || body.includes('Thread') || body.includes('Message')) {
    return 'Processes email data';
  }
  if (body.includes('Drive') || body.includes('File') || body.includes('Folder')) {
    return 'Manages files and folders';
  }
  if (body.includes('Calendar') || body.includes('Event')) {
    return 'Handles calendar operations';
  }
  
  return 'Performs specialized operations';
}

function inferScriptSummary(scriptName, content) {
  const name = scriptName.replace(/-/g, ' ');
  
  if (scriptName.startsWith('markdown-')) {
    const action = scriptName.split('-')[1];
    return `${action.charAt(0).toUpperCase() + action.slice(1)}s markdown content for documentation and note-taking workflows.`;
  }
  
  const operations = [];
  if (content.includes('export') || content.includes('Export')) operations.push('exports');
  if (content.includes('import') || content.includes('Import')) operations.push('imports');
  if (content.includes('create') || content.includes('Create')) operations.push('creates');
  if (content.includes('analyze') || content.includes('Analyze')) operations.push('analyzes');
  if (content.includes('process') || content.includes('Process')) operations.push('processes');
  
  const mainOp = operations[0] || 'manages';
  
  let target = 'data';
  if (content.includes('Label')) target = 'Gmail labels';
  else if (content.includes('Sheet')) target = 'spreadsheet data';
  else if (content.includes('Message') || content.includes('Thread')) target = 'email messages';
  else if (content.includes('Event')) target = 'calendar events';
  else if (content.includes('Task')) target = 'tasks';
  else if (content.includes('File')) target = 'files';
  else if (content.includes('Folder')) target = 'folders';
  
  return `${mainOp.charAt(0).toUpperCase() + mainOp.slice(1)} ${target} for automated workflow processing.`;
}

function inferScriptPurpose(scriptName, content, functions) {
  const purposes = [];
  
  const parts = scriptName.split('-');
  const action = parts[0];
  const target = parts.slice(1).join(' ');
  
  switch (action) {
    case 'export':
      purposes.push(`Extract ${target} data from Google services`);
      purposes.push('Convert data to portable formats');
      purposes.push('Generate reports and summaries');
      break;
    case 'import':
      purposes.push(`Import ${target} data into Google services`);
      purposes.push('Parse and validate input data');
      purposes.push('Update existing records');
      break;
    case 'create':
      purposes.push(`Generate new ${target} items`);
      purposes.push('Set up required structure and metadata');
      purposes.push('Apply formatting and organization');
      break;
    case 'analyze':
      purposes.push(`Analyze ${target} patterns and trends`);
      purposes.push('Calculate statistics and metrics');
      purposes.push('Generate insights and recommendations');
      break;
    case 'process':
      purposes.push(`Process ${target} data transformations`);
      purposes.push('Apply business rules and logic');
      purposes.push('Ensure data consistency');
      break;
    case 'format':
      purposes.push(`Apply formatting to ${target}`);
      purposes.push('Standardize appearance and structure');
      purposes.push('Improve readability and organization');
      break;
    case 'markdown':
      purposes.push('Generate markdown documentation');
      purposes.push('Format content for note-taking systems');
      purposes.push('Maintain consistent documentation structure');
      break;
  }
  
  if (content.includes('batch') || content.includes('Batch')) {
    purposes.push('Handle bulk operations efficiently');
  }
  if (content.includes('schedule') || content.includes('Schedule')) {
    purposes.push('Support scheduled automation');
  }
  
  return purposes.slice(0, 4);
}

function inferScriptSteps(content, functions) {
  const steps = [];
  
  if (content.includes('SpreadsheetApp')) {
    steps.push('Initialize spreadsheet connection');
  }
  if (content.includes('GmailApp')) {
    steps.push('Connect to Gmail service');
  }
  if (content.includes('DriveApp')) {
    steps.push('Access Drive file system');
  }
  
  if (content.includes('get') || content.includes('fetch')) {
    steps.push('Fetch source data');
  }
  if (content.includes('validate') || content.includes('check')) {
    steps.push('Validate input data');
  }
  if (content.includes('process') || content.includes('transform')) {
    steps.push('Process and transform data');
  }
  if (content.includes('filter')) {
    steps.push('Apply filters and criteria');
  }
  if (content.includes('sort')) {
    steps.push('Sort data by relevant fields');
  }
  if (content.includes('format')) {
    steps.push('Format output for presentation');
  }
  if (content.includes('write') || content.includes('save')) {
    steps.push('Write results to destination');
  }
  if (content.includes('email') || content.includes('send')) {
    steps.push('Send notifications or reports');
  }
  
  if (steps.length < 3) {
    steps.push('Execute main operation');
    steps.push('Handle errors and edge cases');
    steps.push('Log completion status');
  }
  
  return steps.slice(0, 8);
}

function inferDependencies(content) {
  const deps = [];
  
  if (content.includes('OAuth')) deps.push('OAuth2 library');
  if (content.includes('Moment') || content.includes('moment')) deps.push('Moment.js library');
  if (content.includes('_underscore') || content.includes('_.')) deps.push('Underscore.js library');
  
  const scriptRefs = content.match(/Script\.run\(['"](\w+)['"]/g);
  if (scriptRefs) {
    scriptRefs.forEach(ref => {
      const scriptName = ref.match(/['"](\w+)['"]/)[1];
      deps.push(`${scriptName} script`);
    });
  }
  
  if (content.includes('UrlFetchApp')) {
    if (content.includes('api.')) deps.push('External API integration');
    if (content.includes('webhook')) deps.push('Webhook endpoints');
  }
  
  return deps.length > 0 ? deps : ['None (standalone script)'];
}

function generateHeader(analysis) {
  let header = '/**\n';
  header += ` * Script Name: ${analysis.scriptName}\n`;
  header += ` * \n`;
  header += ` * Script Summary:\n`;
  header += ` * ${analysis.summary}\n`;
  header += ` * \n`;
  header += ` * Script Purpose:\n`;
  analysis.purpose.forEach(purpose => {
    header += ` * - ${purpose}\n`;
  });
  header += ` * \n`;
  header += ` * Script Steps:\n`;
  analysis.steps.forEach((step, index) => {
    header += ` * ${index + 1}. ${step}\n`;
  });
  header += ` * \n`;
  
  if (analysis.functions.length > 0) {
    header += ` * Script Functions:\n`;
    analysis.functions.forEach(func => {
      header += ` * - ${func.name}(): ${func.description}\n`;
    });
    header += ` * \n`;
  }
  
  if (analysis.helperFunctions.length > 0) {
    header += ` * Script Helper Functions:\n`;
    analysis.helperFunctions.forEach(func => {
      header += ` * - ${func.name}(): ${func.description}\n`;
    });
    header += ` * \n`;
  }
  
  header += ` * Script Dependencies:\n`;
  analysis.dependencies.forEach(dep => {
    header += ` * - ${dep}\n`;
  });
  header += ` * \n`;
  
  header += ` * Google Services:\n`;
  if (analysis.googleServices.size > 0) {
    Array.from(analysis.googleServices).sort().forEach(service => {
      header += ` * - ${service}: ${getServiceDescription(service)}\n`;
    });
  } else {
    header += ` * - None\n`;
  }
  
  header += ` */`;
  
  return header;
}

function getServiceDescription(service) {
  const descriptions = {
    'GmailApp': 'For accessing email messages and labels',
    'DriveApp': 'For file and folder management',
    'SpreadsheetApp': 'For spreadsheet operations',
    'DocumentApp': 'For document manipulation',
    'CalendarApp': 'For calendar and event management',
    'Tasks': 'For task list operations',
    'UrlFetchApp': 'For HTTP requests to external services',
    'PropertiesService': 'For storing script properties',
    'ScriptApp': 'For script management and triggers',
    'Utilities': 'For utility functions and encoding',
    'HtmlService': 'For serving HTML content',
    'FormApp': 'For form creation and responses',
    'Logger': 'For logging and debugging'
  };
  
  return descriptions[service] || 'For specialized operations';
}

function reorganizeFunctions(content, functionList) {
  const functions = [];
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
  let match;
  
  while ((match = functionRegex.exec(content)) !== null) {
    const funcName = match[1];
    const funcStart = match.index;
    const funcEnd = findFunctionEnd(content, funcStart);
    
    functions.push({
      name: funcName,
      content: content.substring(funcStart, funcEnd),
      start: funcStart,
      end: funcEnd
    });
  }
  
  functions.sort((a, b) => b.start - a.start);
  
  let baseContent = content;
  functions.forEach(func => {
    baseContent = baseContent.substring(0, func.start) + baseContent.substring(func.end);
  });
  
  baseContent = baseContent.replace(/\n{3,}/g, '\n\n').trim();
  
  functions.sort((a, b) => a.name.localeCompare(b.name));
  
  let result = baseContent;
  if (result) result += '\n\n';
  
  const mainFunctions = functions.filter(f => 
    functionList.find(fl => fl.name === f.name && !isHelperFunction(f.name, f.content))
  );
  
  const helperFunctions = functions.filter(f => 
    functionList.find(fl => fl.name === f.name && isHelperFunction(f.name, f.content))
  );
  
  if (mainFunctions.length > 0) {
    result += '// Main Functions\n\n';
    result += mainFunctions.map(f => f.content).join('\n\n');
  }
  
  if (helperFunctions.length > 0) {
    if (mainFunctions.length > 0) result += '\n\n';
    result += '// Helper Functions\n\n';
    result += helperFunctions.map(f => f.content).join('\n\n');
  }
  
  return result;
}

function findFunctionEnd(content, startIndex) {
  let braceCount = 0;
  let i = startIndex;
  
  while (i < content.length && content[i] !== '{') {
    i++;
  }
  
  for (; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    else if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        return i + 1;
      }
    }
  }
  
  return content.length;
}

async function findAllGsFiles(dir, files = []) {
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      await findAllGsFiles(fullPath, files);
    } else if (item.endsWith('.gs')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Run if called directly
if (require.main === module) {
  finalHeaderFix().catch(console.error);
}

module.exports = { finalHeaderFix };