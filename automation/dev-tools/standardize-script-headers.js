#!/usr/bin/env node

/**
 * Standardize headers for all Google Apps Script files
 */

const fs = require('fs').promises;
const path = require('path');

async function standardizeScriptHeaders() {
  console.log('📝 Standardizing headers for all Google Apps Script files...\n');
  
  const appsDir = path.join(__dirname, '../../apps');
  let processedCount = 0;
  let errorCount = 0;
  const reports = [];
  
  // Find all .gs files
  const allFiles = await findAllGsFiles(appsDir);
  
  for (const filePath of allFiles) {
    try {
      console.log(`Processing: ${path.basename(filePath)}...`);
      const content = await fs.readFile(filePath, 'utf8');
      const analysis = analyzeScript(content, filePath);
      const newContent = generateStandardizedScript(content, analysis);
      
      await fs.writeFile(filePath, newContent);
      processedCount++;
      
      reports.push({
        file: filePath.replace(path.join(__dirname, '../../'), ''),
        analysis: analysis
      });
      
      console.log(`✅ ${path.basename(filePath)} - header standardized`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error processing ${path.basename(filePath)}: ${error.message}`);
    }
  }
  
  // Generate report
  const report = generateHeaderReport(reports, processedCount, errorCount);
  await fs.writeFile(
    path.join(__dirname, '../../docs/HEADER_STANDARDIZATION_REPORT.md'),
    report
  );
  
  console.log(`\n✅ Header standardization complete: ${processedCount} files processed, ${errorCount} errors`);
  console.log('📄 Report saved to: docs/HEADER_STANDARDIZATION_REPORT.md');
}

function analyzeScript(content, filePath) {
  const analysis = {
    scriptName: path.basename(filePath, '.gs'),
    summary: '',
    purpose: [],
    steps: [],
    functions: [],
    helperFunctions: [],
    dependencies: [],
    googleServices: new Set(),
    hasExistingHeader: false
  };
  
  // Remove existing header comments to analyze clean code
  const cleanContent = removeExistingHeaders(content);
  
  // Detect if there was an existing header
  analysis.hasExistingHeader = content !== cleanContent;
  
  // Extract all functions
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
  let match;
  const functionBodies = {};
  
  while ((match = functionRegex.exec(cleanContent)) !== null) {
    const funcName = match[1];
    const funcStart = match.index;
    const funcBody = extractFunctionBody(cleanContent, funcStart);
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
    'FormApp': ['FormApp']
  };
  
  Object.entries(servicePatterns).forEach(([service, patterns]) => {
    patterns.forEach(pattern => {
      if (cleanContent.includes(pattern)) {
        analysis.googleServices.add(service);
      }
    });
  });
  
  // Infer summary and purpose
  analysis.summary = inferScriptSummary(analysis.scriptName, cleanContent);
  analysis.purpose = inferScriptPurpose(analysis.scriptName, cleanContent, analysis.functions);
  
  // Infer steps
  analysis.steps = inferScriptSteps(cleanContent, analysis.functions);
  
  // Check for dependencies
  analysis.dependencies = inferDependencies(cleanContent);
  
  return analysis;
}

function removeExistingHeaders(content) {
  // Remove block comments at the start
  let cleaned = content.replace(/^\/\*[\s\S]*?\*\/\s*/m, '');
  
  // Remove line comments at the start
  cleaned = cleaned.replace(/^(\/\/.*\n)+/m, '');
  
  return cleaned.trim();
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
  // Helper function patterns
  const helperPatterns = [
    /^_/,                    // Starts with underscore
    /^helper/i,              // Starts with helper
    /^util/i,                // Starts with util
    /^get\w+Config$/,        // Configuration getters
    /^validate/i,            // Validation functions
    /^format/i,              // Formatting functions
    /^parse/i,               // Parsing functions
    /^convert/i,             // Conversion functions
    /^sanitize/i,            // Sanitization functions
    /^normalize/i,           // Normalization functions
    /^is[A-Z]/,              // Boolean checks (isValid, isEmpty)
    /^has[A-Z]/,             // Boolean checks (hasData, hasErrors)
    /Handler$/,              // Event handlers
    /Callback$/              // Callbacks
  ];
  
  // Check if it's a helper based on name
  if (helperPatterns.some(pattern => pattern.test(name))) {
    return true;
  }
  
  // Check if it's only called by other functions (not main)
  const isSmallFunction = body.split('\n').length < 10;
  const hasSimpleReturn = /return\s+[^;]+;/.test(body) && !/if|for|while/.test(body);
  
  return isSmallFunction && hasSimpleReturn;
}

function inferFunctionPurpose(name, body) {
  // Common function patterns
  const patterns = {
    // Data operations
    'export': 'Exports data to external format',
    'import': 'Imports data from external source',
    'fetch': 'Retrieves data from service',
    'get': 'Gets specific data or configuration',
    'set': 'Sets data or configuration values',
    'create': 'Creates new items or resources',
    'update': 'Updates existing data',
    'delete': 'Removes items or data',
    'remove': 'Removes elements from collection',
    
    // Processing
    'process': 'Processes and transforms data',
    'analyze': 'Analyzes data and generates insights',
    'calculate': 'Performs calculations on data',
    'generate': 'Generates new content or reports',
    'build': 'Constructs complex data structures',
    'parse': 'Parses and extracts data',
    'extract': 'Extracts specific information',
    'transform': 'Transforms data format',
    
    // Utilities
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
    
    // I/O operations
    'read': 'Reads data from source',
    'write': 'Writes data to destination',
    'send': 'Sends data or communications',
    'save': 'Saves data persistently',
    'load': 'Loads data from storage',
    
    // Control flow
    'init': 'Initializes resources or configuration',
    'setup': 'Sets up initial state',
    'run': 'Executes main process',
    'execute': 'Executes specific operation',
    'handle': 'Handles events or errors',
    'trigger': 'Triggers actions or events',
    
    // Checks
    'check': 'Checks conditions or status',
    'verify': 'Verifies data or state',
    'is': 'Checks boolean condition',
    'has': 'Checks for existence',
    'can': 'Checks permissions or capability'
  };
  
  // Find matching pattern
  for (const [pattern, description] of Object.entries(patterns)) {
    if (name.toLowerCase().includes(pattern)) {
      // Customize based on function name
      const subject = name.replace(new RegExp(pattern, 'i'), '').replace(/([A-Z])/g, ' $1').trim();
      if (subject) {
        return description.replace(/data|items|elements/, subject.toLowerCase());
      }
      return description;
    }
  }
  
  // Analyze function body for clues
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
  
  // Check for markdown scripts
  if (scriptName.startsWith('markdown-')) {
    const action = scriptName.split('-')[1];
    return `${action.charAt(0).toUpperCase() + action.slice(1)}s markdown content for documentation and note-taking workflows.`;
  }
  
  // Analyze main operations
  const operations = [];
  if (content.includes('export') || content.includes('Export')) operations.push('exports');
  if (content.includes('import') || content.includes('Import')) operations.push('imports');
  if (content.includes('create') || content.includes('Create')) operations.push('creates');
  if (content.includes('analyze') || content.includes('Analyze')) operations.push('analyzes');
  if (content.includes('process') || content.includes('Process')) operations.push('processes');
  
  const mainOp = operations[0] || 'manages';
  
  // Determine target
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
  
  // Analyze script name
  const parts = scriptName.split('-');
  const action = parts[0];
  const target = parts.slice(1).join(' ');
  
  // Base purpose from name
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
  }
  
  // Add specific purposes based on content
  if (content.includes('batch') || content.includes('Batch')) {
    purposes.push('Handle bulk operations efficiently');
  }
  if (content.includes('schedule') || content.includes('Schedule')) {
    purposes.push('Support scheduled automation');
  }
  if (content.includes('filter') || content.includes('Filter')) {
    purposes.push('Filter data based on criteria');
  }
  if (content.includes('merge') || content.includes('Merge')) {
    purposes.push('Combine data from multiple sources');
  }
  
  return purposes.slice(0, 4); // Return top 4 purposes
}

function inferScriptSteps(content, functions) {
  const steps = [];
  
  // Look for main function or entry point
  const mainFunc = functions.find(f => 
    f.name === 'main' || 
    f.name === 'run' || 
    f.name.includes('Export') ||
    f.name.includes('Import') ||
    f.name.includes('Process')
  );
  
  // Common workflow patterns
  if (content.includes('SpreadsheetApp')) {
    steps.push('Initialize spreadsheet connection');
  }
  if (content.includes('GmailApp')) {
    steps.push('Connect to Gmail service');
  }
  if (content.includes('DriveApp')) {
    steps.push('Access Drive file system');
  }
  
  // Data operations
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
  
  // Ensure we have at least 3 steps
  if (steps.length < 3) {
    steps.push('Execute main operation');
    steps.push('Handle errors and edge cases');
    steps.push('Log completion status');
  }
  
  return steps.slice(0, 8); // Return up to 8 steps
}

function inferDependencies(content) {
  const deps = [];
  
  // Check for library references
  if (content.includes('OAuth')) deps.push('OAuth2 library');
  if (content.includes('Moment') || content.includes('moment')) deps.push('Moment.js library');
  if (content.includes('_underscore') || content.includes('_.')) deps.push('Underscore.js library');
  
  // Check for custom script references
  const scriptRefs = content.match(/Script\.run\(['"](\w+)['"]/g);
  if (scriptRefs) {
    scriptRefs.forEach(ref => {
      const scriptName = ref.match(/['"](\w+)['"]/)[1];
      deps.push(`${scriptName} script`);
    });
  }
  
  // Check for external APIs
  if (content.includes('UrlFetchApp')) {
    if (content.includes('api.')) deps.push('External API integration');
    if (content.includes('webhook')) deps.push('Webhook endpoints');
  }
  
  return deps.length > 0 ? deps : ['None (standalone script)'];
}

function generateStandardizedScript(originalContent, analysis) {
  // Remove old headers
  const cleanContent = removeExistingHeaders(originalContent);
  
  // Generate new header
  const header = generateHeader(analysis);
  
  // Reorganize functions alphabetically
  const reorganizedContent = reorganizeFunctions(cleanContent, [...analysis.functions, ...analysis.helperFunctions]);
  
  return header + '\n\n' + reorganizedContent;
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
    'FormApp': 'For form creation and responses'
  };
  
  return descriptions[service] || 'For specialized operations';
}

function reorganizeFunctions(content, functionList) {
  // Extract all functions with their full content
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
  
  // Sort by start position (to remove in reverse order)
  functions.sort((a, b) => b.start - a.start);
  
  // Remove all functions from content
  let baseContent = content;
  functions.forEach(func => {
    baseContent = baseContent.substring(0, func.start) + baseContent.substring(func.end);
  });
  
  // Clean up extra newlines
  baseContent = baseContent.replace(/\n{3,}/g, '\n\n').trim();
  
  // Sort functions alphabetically
  functions.sort((a, b) => a.name.localeCompare(b.name));
  
  // Reconstruct content
  let result = baseContent;
  if (result) result += '\n\n';
  
  // Add main functions first
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
  
  // Find opening brace
  while (i < content.length && content[i] !== '{') {
    i++;
  }
  
  // Count braces
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

function generateHeaderReport(reports, processedCount, errorCount) {
  let report = '# Header Standardization Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total files processed: ${processedCount}\n`;
  report += `- Files with errors: ${errorCount}\n`;
  report += `- Files with existing headers replaced: ${reports.filter(r => r.analysis.hasExistingHeader).length}\n\n`;
  
  report += '## Processed Files\n\n';
  
  reports.forEach(r => {
    report += `### ${r.file}\n`;
    report += `- Functions: ${r.analysis.functions.length}\n`;
    report += `- Helper Functions: ${r.analysis.helperFunctions.length}\n`;
    report += `- Google Services: ${Array.from(r.analysis.googleServices).join(', ') || 'None'}\n`;
    report += `- Dependencies: ${r.analysis.dependencies.join(', ')}\n\n`;
  });
  
  report += '## Header Format Applied\n\n';
  report += '```javascript\n';
  report += '/**\n';
  report += ' * Script Name: [filename without extension]\n';
  report += ' * \n';
  report += ' * Script Summary:\n';
  report += ' * [One-line description of what the script does]\n';
  report += ' * \n';
  report += ' * Script Purpose:\n';
  report += ' * - [Primary purpose]\n';
  report += ' * - [Secondary purpose]\n';
  report += ' * - [Additional purposes...]\n';
  report += ' * \n';
  report += ' * Script Steps:\n';
  report += ' * 1. [First step]\n';
  report += ' * 2. [Second step]\n';
  report += ' * 3. [Additional steps...]\n';
  report += ' * \n';
  report += ' * Script Functions:\n';
  report += ' * - functionName(): [Description]\n';
  report += ' * \n';
  report += ' * Script Helper Functions:\n';
  report += ' * - helperName(): [Description]\n';
  report += ' * \n';
  report += ' * Script Dependencies:\n';
  report += ' * - [External libraries or scripts]\n';
  report += ' * \n';
  report += ' * Google Services:\n';
  report += ' * - ServiceName: [What it\'s used for]\n';
  report += ' */\n';
  report += '```\n';
  
  return report;
}

// Run if called directly
if (require.main === module) {
  standardizeScriptHeaders().catch(console.error);
}

module.exports = { standardizeScriptHeaders };