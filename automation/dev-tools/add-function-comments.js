#!/usr/bin/env node

/**
 * Add inline function comments to all Google Apps Script files
 */

const fs = require('fs').promises;
const path = require('path');

async function addFunctionComments() {
  console.log('💬 Adding inline function comments to all Google Apps Script files...\n');
  
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
      
      // Extract function information from header
      const functionInfo = extractFunctionInfo(content);
      
      // Add comments to functions
      const commentedContent = addCommentsToFunctions(content, functionInfo);
      
      // Only write if changed
      if (content !== commentedContent) {
        await fs.writeFile(filePath, commentedContent);
        processedCount++;
        console.log(`✅ ${path.basename(filePath)} - comments added`);
        
        reports.push({
          file: filePath.replace(path.join(__dirname, '../../'), ''),
          functionsCommented: Object.keys(functionInfo).length
        });
      } else {
        console.log(`⏭️  ${path.basename(filePath)} - no changes needed`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error processing ${path.basename(filePath)}: ${error.message}`);
    }
  }
  
  // Generate report
  const report = generateCommentReport(reports, processedCount, errorCount);
  await fs.writeFile(
    path.join(__dirname, '../../docs/FUNCTION_COMMENTS_REPORT.md'),
    report
  );
  
  console.log(`\n✅ Function commenting complete: ${processedCount} files processed, ${errorCount} errors`);
  console.log('📄 Report saved to: docs/FUNCTION_COMMENTS_REPORT.md');
}

function extractFunctionInfo(content) {
  const functionInfo = {};
  
  // Extract from header comment
  const headerMatch = content.match(/\/\*\*[\s\S]*?\*\//);
  if (!headerMatch) return functionInfo;
  
  const header = headerMatch[0];
  const lines = header.split('\n');
  
  let inFunctions = false;
  let inHelperFunctions = false;
  
  lines.forEach(line => {
    if (line.includes('Script Functions:')) {
      inFunctions = true;
      inHelperFunctions = false;
    } else if (line.includes('Script Helper Functions:')) {
      inFunctions = false;
      inHelperFunctions = true;
    } else if (line.includes('Script Dependencies:') || line.includes('Google Services:')) {
      inFunctions = false;
      inHelperFunctions = false;
    } else if ((inFunctions || inHelperFunctions) && line.includes(' - ')) {
      const match = line.match(/\s*\*\s*-\s*(\w+)\(\):\s*(.+)/);
      if (match) {
        functionInfo[match[1]] = {
          description: match[2].trim(),
          isHelper: inHelperFunctions
        };
      }
    }
  });
  
  return functionInfo;
}

function addCommentsToFunctions(content, functionInfo) {
  let result = content;
  
  // Process each function
  Object.entries(functionInfo).forEach(([funcName, info]) => {
    const functionRegex = new RegExp(`(^|\\n)(\\s*)(function\\s+${funcName}\\s*\\([^)]*\\)\\s*{)`, 'gm');
    
    result = result.replace(functionRegex, (match, prefix, indent, funcDecl) => {
      // Check if there's already a comment
      const beforeMatch = result.substring(0, result.indexOf(match));
      const lines = beforeMatch.split('\n');
      const lastLine = lines[lines.length - 1] || '';
      const secondLastLine = lines[lines.length - 2] || '';
      
      // Skip if already has a comment
      if (lastLine.includes('/**') || secondLastLine.includes('*/')) {
        return match;
      }
      
      // Generate appropriate comment based on function analysis
      const comment = generateFunctionComment(funcName, info, funcDecl, result);
      
      return `${prefix}${indent}/**\n${indent} * ${comment}\n${indent} */\n${indent}${funcDecl}`;
    });
  });
  
  // Also add comments to functions not in the header
  const functionRegex = /^(\s*)(function\s+(\w+)\s*\([^)]*\)\s*{)/gm;
  let match;
  
  while ((match = functionRegex.exec(result)) !== null) {
    const [fullMatch, indent, funcDecl, funcName] = match;
    
    // Skip if already processed or has comment
    if (functionInfo[funcName]) continue;
    
    const beforeMatch = result.substring(0, match.index);
    const lines = beforeMatch.split('\n');
    const lastLine = lines[lines.length - 1] || '';
    const secondLastLine = lines[lines.length - 2] || '';
    
    if (lastLine.includes('/**') || lastLine.includes('//') || secondLastLine.includes('*/')) {
      continue;
    }
    
    // Analyze function to generate comment
    const funcBody = extractFunctionBody(result, match.index);
    const comment = inferFunctionComment(funcName, funcBody, funcDecl);
    
    const replacement = `${indent}/**\n${indent} * ${comment}\n${indent} */\n${fullMatch}`;
    result = result.substring(0, match.index) + replacement + result.substring(match.index + fullMatch.length);
    
    // Update regex lastIndex due to content change
    functionRegex.lastIndex = match.index + replacement.length;
  }
  
  return result;
}

function generateFunctionComment(funcName, info, funcDecl, content) {
  let comment = info.description;
  
  // Extract parameters from function declaration
  const paramsMatch = funcDecl.match(/\(([^)]*)\)/);
  if (paramsMatch && paramsMatch[1].trim()) {
    const params = paramsMatch[1].split(',').map(p => p.trim());
    
    // Add parameter descriptions
    if (params.length > 0 && params[0] !== '') {
      comment += '\n' + info.description.match(/^\s*/) + ' * @param';
      params.forEach(param => {
        const paramName = param.split('=')[0].trim();
        const paramType = inferParamType(paramName, funcName, content);
        const paramDesc = inferParamDescription(paramName, funcName);
        comment += `\n * @param {${paramType}} ${paramName} - ${paramDesc}`;
      });
    }
  }
  
  // Add return type if applicable
  const returnType = inferReturnType(funcName, content);
  if (returnType !== 'void') {
    comment += `\n * @returns {${returnType}} ${inferReturnDescription(funcName, returnType)}`;
  }
  
  return comment;
}

function inferFunctionComment(funcName, funcBody, funcDecl) {
  // Basic function purpose based on name and body
  let comment = inferFunctionPurpose(funcName, funcBody);
  
  // Extract parameters
  const paramsMatch = funcDecl.match(/\(([^)]*)\)/);
  if (paramsMatch && paramsMatch[1].trim()) {
    const params = paramsMatch[1].split(',').map(p => p.trim());
    
    if (params.length > 0 && params[0] !== '') {
      params.forEach(param => {
        const paramName = param.split('=')[0].trim();
        const paramType = inferParamType(paramName, funcName, funcBody);
        const paramDesc = inferParamDescription(paramName, funcName);
        comment += `\n * @param {${paramType}} ${paramName} - ${paramDesc}`;
      });
    }
  }
  
  // Infer return type
  const returnType = inferReturnType(funcName, funcBody);
  if (returnType !== 'void') {
    comment += `\n * @returns {${returnType}} ${inferReturnDescription(funcName, returnType)}`;
  }
  
  return comment;
}

function inferFunctionPurpose(name, body) {
  // Common patterns for function purposes
  const patterns = {
    'get': 'Retrieves',
    'set': 'Sets',
    'create': 'Creates',
    'update': 'Updates',
    'delete': 'Deletes',
    'remove': 'Removes',
    'add': 'Adds',
    'process': 'Processes',
    'analyze': 'Analyzes',
    'calculate': 'Calculates',
    'generate': 'Generates',
    'build': 'Builds',
    'parse': 'Parses',
    'extract': 'Extracts',
    'transform': 'Transforms',
    'format': 'Formats',
    'validate': 'Validates',
    'sanitize': 'Sanitizes',
    'normalize': 'Normalizes',
    'convert': 'Converts',
    'merge': 'Merges',
    'sort': 'Sorts',
    'filter': 'Filters',
    'search': 'Searches for',
    'find': 'Finds',
    'check': 'Checks',
    'verify': 'Verifies',
    'is': 'Determines if',
    'has': 'Checks if has',
    'export': 'Exports',
    'import': 'Imports',
    'fetch': 'Fetches',
    'load': 'Loads',
    'save': 'Saves',
    'write': 'Writes',
    'read': 'Reads',
    'send': 'Sends',
    'init': 'Initializes',
    'setup': 'Sets up',
    'run': 'Runs',
    'execute': 'Executes',
    'handle': 'Handles',
    'trigger': 'Triggers',
    'log': 'Logs',
    'append': 'Appends',
    'insert': 'Inserts',
    'list': 'Lists',
    'count': 'Counts',
    'assist': 'Assists with'
  };
  
  // Find matching pattern
  for (const [pattern, verb] of Object.entries(patterns)) {
    if (name.toLowerCase().startsWith(pattern)) {
      const subject = name.substring(pattern.length)
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim();
      
      if (subject) {
        return `${verb} ${subject}`;
      } else {
        return `${verb} data`;
      }
    }
  }
  
  // Analyze body for clues
  if (body.includes('return')) {
    if (body.includes('new ')) return 'Creates and returns a new instance';
    if (body.includes('true') || body.includes('false')) return 'Checks a condition';
    return 'Processes and returns data';
  }
  
  if (body.includes('forEach') || body.includes('for ')) {
    return 'Iterates through and processes items';
  }
  
  if (body.includes('Logger.log') || body.includes('console.log')) {
    return 'Logs information for debugging';
  }
  
  return 'Performs a specific operation';
}

function inferParamType(paramName, funcName, content) {
  // Common parameter name patterns
  const typePatterns = {
    'id': 'string',
    'name': 'string',
    'message': 'string',
    'text': 'string',
    'url': 'string',
    'path': 'string',
    'email': 'string',
    'subject': 'string',
    'body': 'string',
    'content': 'string',
    'query': 'string',
    'key': 'string',
    'value': 'string|any',
    'count': 'number',
    'index': 'number',
    'length': 'number',
    'size': 'number',
    'amount': 'number',
    'total': 'number',
    'max': 'number',
    'min': 'number',
    'limit': 'number',
    'offset': 'number',
    'page': 'number',
    'enabled': 'boolean',
    'active': 'boolean',
    'visible': 'boolean',
    'done': 'boolean',
    'success': 'boolean',
    'isValid': 'boolean',
    'hasData': 'boolean',
    'data': 'Object',
    'options': 'Object',
    'config': 'Object',
    'settings': 'Object',
    'params': 'Object',
    'props': 'Object',
    'items': 'Array',
    'list': 'Array',
    'array': 'Array',
    'values': 'Array',
    'results': 'Array',
    'rows': 'Array',
    'columns': 'Array',
    'callback': 'Function',
    'handler': 'Function',
    'fn': 'Function',
    'func': 'Function'
  };
  
  // Check exact matches
  if (typePatterns[paramName]) {
    return typePatterns[paramName];
  }
  
  // Check partial matches
  for (const [pattern, type] of Object.entries(typePatterns)) {
    if (paramName.toLowerCase().includes(pattern)) {
      return type;
    }
  }
  
  // Check for specific Google Apps Script types
  if (paramName.includes('sheet') || paramName.includes('Sheet')) {
    return 'Sheet';
  }
  if (paramName.includes('range') || paramName.includes('Range')) {
    return 'Range';
  }
  if (paramName.includes('folder') || paramName.includes('Folder')) {
    return 'Folder';
  }
  if (paramName.includes('file') || paramName.includes('File')) {
    return 'File';
  }
  if (paramName.includes('event') || paramName.includes('Event')) {
    return 'CalendarEvent';
  }
  if (paramName.includes('thread') || paramName.includes('Thread')) {
    return 'GmailThread';
  }
  if (paramName.includes('message') || paramName.includes('Message')) {
    return 'GmailMessage';
  }
  if (paramName.includes('label') || paramName.includes('Label')) {
    return 'GmailLabel';
  }
  
  // Default to any
  return 'any';
}

function inferParamDescription(paramName, funcName) {
  // Common parameter descriptions
  const descriptions = {
    'id': 'The unique identifier',
    'name': 'The name to use',
    'message': 'The message content',
    'text': 'The text content',
    'url': 'The URL to access',
    'path': 'The file path',
    'email': 'The email address',
    'subject': 'The subject line',
    'body': 'The body content',
    'content': 'The content to process',
    'query': 'The search query',
    'key': 'The key to look up',
    'value': 'The value to set',
    'count': 'The number of items',
    'index': 'The position index',
    'length': 'The length or size',
    'size': 'The size limit',
    'amount': 'The amount to process',
    'total': 'The total count',
    'max': 'The maximum value',
    'min': 'The minimum value',
    'limit': 'The maximum number of results',
    'offset': 'The starting position',
    'page': 'The page number',
    'enabled': 'Whether enabled or not',
    'active': 'Whether active or not',
    'visible': 'Whether visible or not',
    'done': 'Whether completed or not',
    'success': 'Whether successful or not',
    'data': 'The data object to process',
    'options': 'Configuration options',
    'config': 'Configuration settings',
    'settings': 'Settings to apply',
    'params': 'Parameters for the operation',
    'props': 'Properties to set',
    'items': 'Array of items to process',
    'list': 'List of values',
    'array': 'Array of elements',
    'values': 'Array of values',
    'results': 'Array of results',
    'rows': 'Array of row data',
    'columns': 'Array of column data',
    'callback': 'Function to call',
    'handler': 'Handler function',
    'fn': 'Function to execute',
    'func': 'Function to run'
  };
  
  // Check exact match
  if (descriptions[paramName]) {
    return descriptions[paramName];
  }
  
  // Generate based on function context
  if (funcName.includes('get') || funcName.includes('Get')) {
    return `The ${paramName} to retrieve`;
  }
  if (funcName.includes('set') || funcName.includes('Set')) {
    return `The ${paramName} to set`;
  }
  if (funcName.includes('create') || funcName.includes('Create')) {
    return `The ${paramName} for creation`;
  }
  if (funcName.includes('update') || funcName.includes('Update')) {
    return `The ${paramName} to update`;
  }
  if (funcName.includes('delete') || funcName.includes('Delete')) {
    return `The ${paramName} to delete`;
  }
  
  // Default
  return `The ${paramName} parameter`;
}

function inferReturnType(funcName, body) {
  // Check explicit return statements
  const returnMatch = body.match(/return\s+([^;]+);/);
  if (!returnMatch) return 'void';
  
  const returnValue = returnMatch[1].trim();
  
  // Boolean returns
  if (returnValue === 'true' || returnValue === 'false' || 
      returnValue.includes('===') || returnValue.includes('!==') ||
      returnValue.includes('>') || returnValue.includes('<')) {
    return 'boolean';
  }
  
  // Number returns
  if (/^\d+$/.test(returnValue) || returnValue.includes('.length') || 
      returnValue.includes('count') || returnValue.includes('Count')) {
    return 'number';
  }
  
  // String returns
  if (returnValue.includes('"') || returnValue.includes("'") || 
      returnValue.includes('`') || returnValue.includes('.toString()')) {
    return 'string';
  }
  
  // Array returns
  if (returnValue.includes('[') || returnValue.includes('.map') || 
      returnValue.includes('.filter') || returnValue.includes('.slice')) {
    return 'Array';
  }
  
  // Object returns
  if (returnValue.includes('{') || returnValue.includes('new ')) {
    return 'Object';
  }
  
  // Google Apps Script specific types
  if (returnValue.includes('SpreadsheetApp') || returnValue.includes('getActive')) {
    if (returnValue.includes('getActiveSheet')) return 'Sheet';
    if (returnValue.includes('getActiveSpreadsheet')) return 'Spreadsheet';
    if (returnValue.includes('getRange')) return 'Range';
  }
  
  if (returnValue.includes('DriveApp')) {
    if (returnValue.includes('getFileById')) return 'File';
    if (returnValue.includes('getFolderById')) return 'Folder';
  }
  
  if (returnValue.includes('GmailApp')) {
    if (returnValue.includes('getThread')) return 'GmailThread';
    if (returnValue.includes('getMessage')) return 'GmailMessage';
  }
  
  // Default to any for complex returns
  return 'any';
}

function inferReturnDescription(funcName, returnType) {
  const baseDescriptions = {
    'boolean': 'True if successful, false otherwise',
    'number': 'The calculated value',
    'string': 'The formatted string',
    'Array': 'Array of results',
    'Object': 'The result object',
    'void': '',
    'any': 'The result'
  };
  
  // Customize based on function name
  if (funcName.includes('get') || funcName.includes('Get')) {
    return returnType === 'boolean' ? 'True if found, false otherwise' : 'The requested ' + returnType.toLowerCase();
  }
  if (funcName.includes('create') || funcName.includes('Create')) {
    return 'The newly created ' + returnType.toLowerCase();
  }
  if (funcName.includes('count') || funcName.includes('Count')) {
    return 'The total count';
  }
  if (funcName.includes('is') || funcName.includes('has')) {
    return 'True if condition is met, false otherwise';
  }
  
  return baseDescriptions[returnType] || 'The result';
}

function extractFunctionBody(content, startIndex) {
  let braceCount = 0;
  let i = startIndex;
  
  // Find opening brace
  while (i < content.length && content[i] !== '{') {
    i++;
  }
  
  if (i >= content.length) return '';
  
  const bodyStart = i;
  
  // Extract function body
  for (; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    else if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        return content.substring(bodyStart, i + 1);
      }
    }
  }
  
  return content.substring(bodyStart);
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

function generateCommentReport(reports, processedCount, errorCount) {
  let report = '# Function Comments Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total files processed: ${processedCount}\n`;
  report += `- Files with errors: ${errorCount}\n`;
  report += `- Total functions commented: ${reports.reduce((sum, r) => sum + r.functionsCommented, 0)}\n\n`;
  
  if (reports.length === 0) {
    report += '✅ **All functions already have comments!**\n';
    return report;
  }
  
  report += '## Files Updated\n\n';
  report += '| File | Functions Commented |\n';
  report += '|------|--------------------|\n';
  
  reports.forEach(r => {
    report += `| ${r.file} | ${r.functionsCommented} |\n`;
  });
  
  report += '\n## Comment Format Applied\n\n';
  report += '```javascript\n';
  report += '/**\n';
  report += ' * Brief description of what the function does\n';
  report += ' * @param {Type} paramName - Description of the parameter\n';
  report += ' * @returns {Type} Description of the return value\n';
  report += ' */\n';
  report += 'function functionName(paramName) {\n';
  report += '  // Implementation\n';
  report += '}\n';
  report += '```\n';
  
  return report;
}

// Run if called directly
if (require.main === module) {
  addFunctionComments().catch(console.error);
}

module.exports = { addFunctionComments };