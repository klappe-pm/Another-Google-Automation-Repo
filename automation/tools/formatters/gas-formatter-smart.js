#!/usr/bin/env node

/**
 * Smart Google Apps Script Formatter
 * Automatically formats GAS files and intelligently fills in documentation
 * 
 * Usage: node gas-formatter-smart.js [file-path]
 *        node gas-formatter-smart.js --all
 */

const fs = require('fs');
const path = require('path');

class SmartGASFormatter {
  constructor() {
    this.serviceMapping = {
      'gmail': 'Gmail',
      'drive': 'Google Drive',
      'sheets': 'Google Sheets',
      'docs': 'Google Docs',
      'calendar': 'Google Calendar',
      'tasks': 'Google Tasks',
      'photos': 'Google Photos',
      'chat': 'Google Chat',
      'utility': 'Utility/Multiple Services'
    };
  }

  /**
   * Format a single GAS file with intelligent documentation
   */
  formatFile(filePath) {
    console.log(`🤖 Smart Formatting: ${filePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = this.analyzeScript(content, filePath);
      const formatted = this.applySmartFormatting(content, filePath, analysis);
      
      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Write formatted content
      fs.writeFileSync(filePath, formatted);
      
      console.log(`✅ Smart formatted: ${path.basename(filePath)}`);
      return true;
    } catch (error) {
      console.error(`❌ Error formatting ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Analyze script to extract meaningful information
   */
  analyzeScript(content, filePath) {
    const analysis = {
      mainPurpose: '',
      features: [],
      servicesUsed: new Set(),
      setupSteps: [],
      functions: [],
      hasUI: false,
      hasMenu: false,
      hasDialog: false,
      exportTypes: [],
      dataOperations: [],
      errorHandling: false
    };

    // Analyze services used
    const servicePatterns = {
      'Gmail': /GmailApp\.|Gmail\./,
      'Drive': /DriveApp\.|Drive\./,
      'Sheets': /SpreadsheetApp\.|Sheets\./,
      'Docs': /DocumentApp\.|Docs\./,
      'Calendar': /CalendarApp\.|Calendar\./,
      'Forms': /FormApp\.|Forms\./,
      'Slides': /SlidesApp\.|Slides\./,
      'Tasks': /Tasks\./,
      'UrlFetch': /UrlFetchApp\./,
      'HtmlService': /HtmlService\./
    };

    for (const [service, pattern] of Object.entries(servicePatterns)) {
      if (pattern.test(content)) {
        analysis.servicesUsed.add(service);
      }
    }

    // Analyze UI components
    analysis.hasUI = /SpreadsheetApp\.getUi\(\)|DocumentApp\.getUi\(\)/.test(content);
    analysis.hasMenu = /createMenu\(|addMenu\(/.test(content);
    analysis.hasDialog = /showDialog|showModalDialog|showSidebar/.test(content);

    // Analyze main operations
    if (/search\(|getThreads|getMessages/.test(content)) {
      analysis.features.push('Email searching and filtering');
    }
    if (/createFile|createFolder/.test(content)) {
      analysis.features.push('File/folder creation and management');
    }
    if (/getRange|setValues|appendRow/.test(content)) {
      analysis.features.push('Spreadsheet data manipulation');
    }
    if (/\.pdf|application\/pdf/.test(content)) {
      analysis.features.push('PDF generation and export');
      analysis.exportTypes.push('PDF');
    }
    if (/\.md|text\/markdown/.test(content)) {
      analysis.features.push('Markdown file generation');
      analysis.exportTypes.push('Markdown');
    }
    if (/formatDate|new Date\(/.test(content)) {
      analysis.features.push('Date handling and formatting');
    }
    if (/setSharing|addEditor|addViewer/.test(content)) {
      analysis.features.push('File sharing and permissions management');
    }

    // Extract function information
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)}/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const funcName = match[1];
      const funcBody = match[2];
      
      analysis.functions.push({
        name: funcName,
        purpose: this.inferFunctionPurpose(funcName, funcBody),
        hasParams: match[0].includes('(') && !match[0].includes('()'),
        isEventHandler: ['onOpen', 'onEdit', 'onFormSubmit', 'onInstall'].includes(funcName)
      });
    }

    // Infer main purpose
    analysis.mainPurpose = this.inferMainPurpose(filePath, content, analysis);

    // Generate setup steps
    analysis.setupSteps = this.generateSetupSteps(analysis);

    // Check for error handling
    analysis.errorHandling = /try\s*{|catch\s*\(/.test(content);

    return analysis;
  }

  /**
   * Infer function purpose from name and content
   */
  inferFunctionPurpose(funcName, funcBody) {
    // Common patterns
    const patterns = {
      'onOpen': 'Initialize the application and create custom menus',
      'onEdit': 'Handle spreadsheet edit events',
      'onInstall': 'Set up the add-on when installed',
      'onFormSubmit': 'Process form submissions'
    };

    if (patterns[funcName]) {
      return patterns[funcName];
    }

    // Analyze function name
    if (funcName.startsWith('get')) {
      return `Retrieve ${this.camelToWords(funcName.substring(3))}`;
    }
    if (funcName.startsWith('set')) {
      return `Set or update ${this.camelToWords(funcName.substring(3))}`;
    }
    if (funcName.startsWith('create')) {
      return `Create ${this.camelToWords(funcName.substring(6))}`;
    }
    if (funcName.startsWith('export')) {
      return `Export ${this.camelToWords(funcName.substring(6))}`;
    }
    if (funcName.startsWith('process')) {
      return `Process ${this.camelToWords(funcName.substring(7))}`;
    }
    if (funcName.includes('search') || funcName.includes('Search')) {
      return 'Search and filter data based on criteria';
    }
    if (funcName.includes('format') || funcName.includes('Format')) {
      return 'Format data for display or export';
    }

    // Analyze function body
    if (funcBody.includes('SpreadsheetApp.getUi()')) {
      return 'Display user interface elements';
    }
    if (funcBody.includes('GmailApp.search')) {
      return 'Search Gmail for specific emails';
    }
    if (funcBody.includes('DriveApp.create')) {
      return 'Create files or folders in Google Drive';
    }

    return `Perform ${this.camelToWords(funcName)} operation`;
  }

  /**
   * Convert camelCase to readable words
   */
  camelToWords(str) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase();
  }

  /**
   * Infer main purpose from script analysis
   */
  inferMainPurpose(filePath, content, analysis) {
    const fileName = path.basename(filePath, '.gs').toLowerCase();
    
    // File name based inference
    if (fileName.includes('export')) {
      if (analysis.exportTypes.length > 0) {
        return `Export data to ${analysis.exportTypes.join(' and ')} formats`;
      }
      return 'Export data to various formats';
    }
    
    if (fileName.includes('import')) {
      return 'Import and process external data';
    }
    
    if (fileName.includes('analysis') || fileName.includes('analyze')) {
      return 'Analyze and generate insights from data';
    }
    
    if (fileName.includes('label')) {
      return 'Manage and organize email labels';
    }
    
    if (fileName.includes('index')) {
      return 'Index and catalog files or data';
    }
    
    if (fileName.includes('format')) {
      return 'Format and standardize data or documents';
    }

    // Service-based inference
    if (analysis.servicesUsed.has('Gmail')) {
      if (content.includes('search(')) {
        return 'Search and process Gmail messages';
      }
      if (content.includes('label')) {
        return 'Organize emails with labels';
      }
    }
    
    if (analysis.servicesUsed.has('Drive')) {
      if (content.includes('getFolders')) {
        return 'Navigate and manage Google Drive folders';
      }
      if (content.includes('createFile')) {
        return 'Create and manage files in Google Drive';
      }
    }

    // Feature-based inference
    if (analysis.features.length > 0) {
      return analysis.features[0];
    }

    return 'Automate Google Workspace tasks';
  }

  /**
   * Generate setup steps based on analysis
   */
  generateSetupSteps(analysis) {
    const steps = [];

    // Basic setup
    steps.push('Open Google Apps Script editor (script.google.com)');
    steps.push('Create a new project or open existing one');
    steps.push('Copy this script into the editor');

    // Service-specific setup
    if (analysis.servicesUsed.has('Gmail')) {
      steps.push('Enable Gmail API in Google Cloud Console if using advanced features');
    }
    if (analysis.servicesUsed.has('Drive')) {
      steps.push('Ensure proper Drive API permissions are granted');
    }
    if (analysis.hasUI || analysis.hasMenu) {
      steps.push('Open a Google Sheets/Docs file to see the custom menu');
    }

    // Permission setup
    steps.push('Run the script and authorize required permissions');
    
    // Function-specific setup
    if (analysis.functions.some(f => f.name === 'onOpen')) {
      steps.push('Refresh the document to see custom menus');
    }

    // Testing
    steps.push('Test the script with sample data');
    steps.push('Check logs (View > Logs) for any errors');

    return steps;
  }

  /**
   * Apply smart formatting with intelligent content
   */
  applySmartFormatting(content, filePath, analysis) {
    let formatted = content;
    
    // Check if header exists
    if (!this.hasValidHeader(content)) {
      const header = this.generateSmartHeader(filePath, analysis);
      formatted = header + '\n\n' + formatted;
    }
    
    // Apply formatting rules
    formatted = this.fixIndentation(formatted);
    formatted = this.fixSpacing(formatted);
    formatted = this.addSmartFunctionComments(formatted, analysis);
    formatted = this.organizeSections(formatted);
    
    return formatted;
  }

  /**
   * Generate smart header with actual content
   */
  generateSmartHeader(filePath, analysis) {
    const fileName = path.basename(filePath, '.gs');
    const title = this.generateSmartTitle(fileName);
    const service = this.detectService(filePath);
    const today = new Date().toISOString().split('T')[0];
    
    // Determine problem solved
    const problemSolved = this.inferProblemSolved(fileName, analysis);
    
    // Determine success criteria
    const successCriteria = this.inferSuccessCriteria(analysis);
    
    const header = `/**
 * Title: ${title}
 * Service: ${Array.from(analysis.servicesUsed).join(', ') || service}
 * Purpose: ${analysis.mainPurpose}
 * Created: ${today}
 * Updated: ${today}
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: ${analysis.mainPurpose}
- Description: This script ${this.generateDescription(analysis)}
- Problem Solved: ${problemSolved}
- Successful Execution: ${successCriteria}
- Key Features:
${analysis.features.map(f => `  - ${f}`).join('\n')}
- Services Used: ${Array.from(analysis.servicesUsed).join(', ')}
- Setup:
${analysis.setupSteps.map((step, i) => `  ${i + 1}. ${step}`).join('\n')}
*/`;
    
    return header;
  }

  /**
   * Generate smart title from filename
   */
  generateSmartTitle(fileName) {
    const words = fileName
      .replace(/^(gmail|drive|sheets|docs|calendar|tasks|photos|chat|utility)-/, '')
      .split('-')
      .map(word => {
        // Handle common abbreviations
        const abbreviations = {
          'pdf': 'PDF',
          'md': 'Markdown',
          'api': 'API',
          'ui': 'UI',
          'id': 'ID',
          'url': 'URL'
        };
        return abbreviations[word.toLowerCase()] || 
               (word.charAt(0).toUpperCase() + word.slice(1));
      });
    
    return words.join(' ');
  }

  /**
   * Generate description based on analysis
   */
  generateDescription(analysis) {
    const parts = [];
    
    if (analysis.hasMenu) {
      parts.push('provides a custom menu interface');
    }
    
    if (analysis.features.length > 0) {
      parts.push(`enables ${analysis.features.slice(0, 2).join(' and ')}`);
    }
    
    if (analysis.exportTypes.length > 0) {
      parts.push(`with export capabilities to ${analysis.exportTypes.join(' and ')}`);
    }
    
    if (analysis.errorHandling) {
      parts.push('with comprehensive error handling');
    }
    
    return parts.join(', ') || 'automates workflow tasks';
  }

  /**
   * Infer problem being solved
   */
  inferProblemSolved(fileName, analysis) {
    if (fileName.includes('export')) {
      return 'Manual data extraction and formatting is time-consuming and error-prone';
    }
    if (fileName.includes('analysis')) {
      return 'Manual data analysis lacks consistency and automation';
    }
    if (fileName.includes('label')) {
      return 'Email organization requires manual categorization and maintenance';
    }
    if (fileName.includes('index')) {
      return 'Tracking and cataloging files manually is inefficient';
    }
    if (fileName.includes('format')) {
      return 'Inconsistent formatting across documents reduces productivity';
    }
    
    if (analysis.features.includes('Email searching and filtering')) {
      return 'Finding specific emails and extracting data is difficult with Gmail\'s interface';
    }
    
    return 'Manual processing of Google Workspace data is time-consuming';
  }

  /**
   * Infer success criteria
   */
  inferSuccessCriteria(analysis) {
    const criteria = [];
    
    if (analysis.exportTypes.includes('PDF')) {
      criteria.push('PDF files created in designated folder');
    }
    if (analysis.exportTypes.includes('Markdown')) {
      criteria.push('Markdown files generated with proper formatting');
    }
    if (analysis.features.some(f => f.includes('Spreadsheet'))) {
      criteria.push('Data successfully written to spreadsheet');
    }
    if (analysis.hasMenu) {
      criteria.push('Custom menu appears and functions properly');
    }
    if (analysis.servicesUsed.has('Gmail')) {
      criteria.push('Emails processed according to criteria');
    }
    
    if (criteria.length === 0) {
      criteria.push('Script completes without errors and produces expected output');
    }
    
    return criteria.join(', ');
  }

  /**
   * Add smart function comments
   */
  addSmartFunctionComments(content, analysis) {
    const functionRegex = /^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*{/gm;
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = functionRegex.exec(line);
      
      if (match && i > 0 && !lines[i-1].includes('*/')) {
        const indent = match[1];
        const funcName = match[2];
        const params = match[3];
        
        // Find function info from analysis
        const funcInfo = analysis.functions.find(f => f.name === funcName);
        const purpose = funcInfo ? funcInfo.purpose : this.inferFunctionPurpose(funcName, '');
        
        newLines.push(`${indent}/**`);
        newLines.push(`${indent} * ${purpose}`);
        
        // Add parameter documentation
        if (params.trim()) {
          const paramList = params.split(',').map(p => p.trim());
          paramList.forEach(param => {
            const paramName = param.split('=')[0].trim();
            newLines.push(`${indent} * @param {*} ${paramName} - ${this.inferParamDescription(paramName, funcName)}`);
          });
        }
        
        // Add return documentation if applicable
        if (funcName.startsWith('get') || funcName.startsWith('create')) {
          newLines.push(`${indent} * @return {*} ${this.inferReturnDescription(funcName)}`);
        }
        
        newLines.push(`${indent} */`);
      }
      
      newLines.push(line);
    }
    
    return newLines.join('\n');
  }

  /**
   * Infer parameter description
   */
  inferParamDescription(paramName, funcName) {
    const commonParams = {
      'searchTerm': 'Search query string',
      'query': 'Search query or filter criteria',
      'label': 'Gmail label name',
      'keyword': 'Keyword to search for',
      'startDate': 'Start date for date range filter',
      'endDate': 'End date for date range filter',
      'folder': 'Google Drive folder object or ID',
      'folderName': 'Name of the folder',
      'fileName': 'Name of the file',
      'sheet': 'Google Sheets sheet object',
      'range': 'Cell range in A1 notation',
      'data': 'Data to process or write',
      'options': 'Configuration options object',
      'callback': 'Callback function',
      'email': 'Email address',
      'subject': 'Email subject line',
      'body': 'Content body',
      'format': 'Output format type'
    };
    
    return commonParams[paramName] || `${paramName} parameter`;
  }

  /**
   * Infer return description
   */
  inferReturnDescription(funcName) {
    if (funcName.startsWith('get')) {
      const item = this.camelToWords(funcName.substring(3));
      return `The requested ${item}`;
    }
    if (funcName.startsWith('create')) {
      const item = this.camelToWords(funcName.substring(6));
      return `The created ${item}`;
    }
    if (funcName.includes('search') || funcName.includes('Search')) {
      return 'Array of search results';
    }
    if (funcName.includes('format') || funcName.includes('Format')) {
      return 'Formatted string or data';
    }
    
    return 'Operation result';
  }

  /**
   * Check if file has valid header
   */
  hasValidHeader(content) {
    return content.includes('* Title:') && 
           content.includes('* Service:') && 
           content.includes('Script Summary:');
  }

  /**
   * Detect service from file path
   */
  detectService(filePath) {
    const parts = filePath.split(path.sep);
    for (const part of parts) {
      if (this.serviceMapping[part]) {
        return this.serviceMapping[part];
      }
    }
    
    const fileName = path.basename(filePath).toLowerCase();
    for (const [key, value] of Object.entries(this.serviceMapping)) {
      if (fileName.includes(key)) {
        return value;
      }
    }
    
    return 'Google Apps Script';
  }

  /**
   * Fix indentation to 2 spaces
   */
  fixIndentation(content) {
    const lines = content.split('\n');
    const fixedLines = [];
    let indentLevel = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '}' || trimmed.startsWith('} ')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      if (trimmed) {
        fixedLines.push(' '.repeat(indentLevel * 2) + trimmed);
      } else {
        fixedLines.push('');
      }
      
      if (trimmed.endsWith('{')) {
        indentLevel++;
      }
    }
    
    return fixedLines.join('\n');
  }

  /**
   * Fix spacing issues
   */
  fixSpacing(content) {
    content = content.replace(/\b(if|for|while)\(/g, '$1 (');
    content = content.replace(/function\s*\(/g, 'function(');
    content = content.replace(/function\s+(\w+)\s*\(/g, 'function $1(');
    content = content.replace(/([=!<>]+)([^\s=])/g, '$1 $2');
    content = content.replace(/([^\s])([=!<>]+)/g, '$1 $2');
    content = content.replace(/ +$/gm, '');
    
    return content;
  }

  /**
   * Organize code into sections
   */
  organizeSections(content) {
    // This would be more complex in practice
    return content;
  }

  /**
   * Format all GAS files in the project
   */
  formatAll() {
    const appsDir = path.join(process.cwd(), 'apps');
    let totalFiles = 0;
    let successCount = 0;
    
    const findGSFiles = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
          findGSFiles(fullPath);
        } else if (file.endsWith('.gs')) {
          totalFiles++;
          if (this.formatFile(fullPath)) {
            successCount++;
          }
        }
      }
    };
    
    findGSFiles(appsDir);
    
    console.log(`\n📊 Smart formatting complete:`);
    console.log(`   Total files: ${totalFiles}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${totalFiles - successCount}`);
  }
}

// Main execution
const formatter = new SmartGASFormatter();
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node gas-formatter-smart.js [file-path]');
  console.log('       node gas-formatter-smart.js --all');
  process.exit(1);
}

if (args[0] === '--all') {
  formatter.formatAll();
} else {
  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  formatter.formatFile(filePath);
}