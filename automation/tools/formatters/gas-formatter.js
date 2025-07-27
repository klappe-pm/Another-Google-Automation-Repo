#!/usr/bin/env node

/**
 * Google Apps Script Formatter
 * Automatically formats GAS files according to the style guide
 * 
 * Usage: node gas-formatter.js [file-path]
 *        node gas-formatter.js --all
 */

const fs = require('fs');
const path = require('path');

const HEADER_TEMPLATE = `/**
 * Title: [TITLE]
 * Service: [SERVICE]
 * Purpose: [PURPOSE]
 * Created: [CREATED]
 * Updated: [UPDATED]
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: [DETAILED_PURPOSE]
- Description: [DESCRIPTION]
- Problem Solved: [PROBLEM]
- Successful Execution: [SUCCESS]
- Key Features:
  - [FEATURE_1]
  - [FEATURE_2]
  - [FEATURE_3]
- Services Used: [SERVICES]
- Setup:
  1. [SETUP_1]
  2. [SETUP_2]
  3. [SETUP_3]
*/`;

class GASFormatter {
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
   * Format a single GAS file
   */
  formatFile(filePath) {
    console.log(`Formatting: ${filePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const formatted = this.applyFormatting(content, filePath);
      
      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Write formatted content
      fs.writeFileSync(filePath, formatted);
      
      console.log(`✅ Formatted: ${path.basename(filePath)}`);
      return true;
    } catch (error) {
      console.error(`❌ Error formatting ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Apply formatting rules to content
   */
  applyFormatting(content, filePath) {
    let formatted = content;
    
    // Check if header exists
    if (!this.hasValidHeader(content)) {
      formatted = this.addHeader(formatted, filePath) + '\n\n' + formatted;
    }
    
    // Apply formatting rules
    formatted = this.fixIndentation(formatted);
    formatted = this.fixSpacing(formatted);
    formatted = this.addFunctionComments(formatted);
    formatted = this.organizeSections(formatted);
    
    return formatted;
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
   * Add header template to file
   */
  addHeader(content, filePath) {
    const fileName = path.basename(filePath, '.gs');
    const service = this.detectService(filePath);
    const title = this.generateTitle(fileName);
    const today = new Date().toISOString().split('T')[0];
    
    let header = HEADER_TEMPLATE;
    header = header.replace('[TITLE]', title);
    header = header.replace('[SERVICE]', service);
    header = header.replace('[PURPOSE]', `TODO: Add purpose for ${title}`);
    header = header.replace('[CREATED]', today);
    header = header.replace('[UPDATED]', today);
    header = header.replace('[DETAILED_PURPOSE]', 'TODO: Add detailed purpose');
    header = header.replace('[DESCRIPTION]', 'TODO: Add description');
    header = header.replace('[PROBLEM]', 'TODO: Describe problem solved');
    header = header.replace('[SUCCESS]', 'TODO: Define success criteria');
    header = header.replace('[FEATURE_1]', 'TODO: Add feature');
    header = header.replace('[FEATURE_2]', 'TODO: Add feature');
    header = header.replace('[FEATURE_3]', 'TODO: Add feature');
    header = header.replace('[SERVICES]', service + ' API');
    header = header.replace('[SETUP_1]', 'TODO: Add setup step');
    header = header.replace('[SETUP_2]', 'TODO: Add setup step');
    header = header.replace('[SETUP_3]', 'TODO: Add setup step');
    
    return header;
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
    
    // Try to detect from filename
    const fileName = path.basename(filePath).toLowerCase();
    for (const [key, value] of Object.entries(this.serviceMapping)) {
      if (fileName.includes(key)) {
        return value;
      }
    }
    
    return 'Google Apps Script';
  }

  /**
   * Generate title from filename
   */
  generateTitle(fileName) {
    // Remove service prefix and convert to title case
    const words = fileName
      .replace(/^(gmail|drive|sheets|docs|calendar|tasks|photos|chat|utility)-/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));
    
    return words.join(' ');
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
      
      // Decrease indent for closing braces
      if (trimmed === '}' || trimmed.startsWith('} ')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Apply indentation
      if (trimmed) {
        fixedLines.push(' '.repeat(indentLevel * 2) + trimmed);
      } else {
        fixedLines.push('');
      }
      
      // Increase indent for opening braces
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
    // Add space after if, for, while
    content = content.replace(/\b(if|for|while)\(/g, '$1 (');
    
    // Fix function spacing
    content = content.replace(/function\s*\(/g, 'function(');
    content = content.replace(/function\s+(\w+)\s*\(/g, 'function $1(');
    
    // Fix operator spacing
    content = content.replace(/([=!<>]+)([^\s=])/g, '$1 $2');
    content = content.replace(/([^\s])([=!<>]+)/g, '$1 $2');
    
    // Remove trailing spaces
    content = content.replace(/ +$/gm, '');
    
    return content;
  }

  /**
   * Add function comments where missing
   */
  addFunctionComments(content) {
    const functionRegex = /^(\s*)function\s+(\w+)\s*\([^)]*\)\s*{/gm;
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = functionRegex.exec(line);
      
      if (match && i > 0 && !lines[i-1].includes('*/')) {
        const indent = match[1];
        const funcName = match[2];
        
        newLines.push(`${indent}/**`);
        newLines.push(`${indent} * ${this.generateFunctionDescription(funcName)}`);
        newLines.push(`${indent} */`);
      }
      
      newLines.push(line);
    }
    
    return newLines.join('\n');
  }

  /**
   * Generate function description from name
   */
  generateFunctionDescription(funcName) {
    // Convert camelCase to readable description
    const words = funcName
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
      .split(' ');
    
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    
    return words.join(' ') + ' - TODO: Add description';
  }

  /**
   * Organize code into sections
   */
  organizeSections(content) {
    // This is a simplified version - in practice, would need more sophisticated parsing
    if (!content.includes('// ============================================')) {
      const sections = [];
      
      // Add constants section if there are const declarations
      if (content.includes('const ')) {
        sections.push(`
// ============================================
// CONSTANTS AND CONFIGURATION
// ============================================`);
      }
      
      // Add main functions section
      sections.push(`
// ============================================
// MAIN FUNCTIONS
// ============================================`);
      
      // TODO: More sophisticated section detection and organization
    }
    
    return content;
  }

  /**
   * Format all GAS files in the project
   */
  formatAll() {
    const appsDir = path.join(process.cwd(), 'apps');
    let totalFiles = 0;
    let successCount = 0;
    
    // Find all .gs files
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
    
    console.log(`\n📊 Formatting complete:`);
    console.log(`   Total files: ${totalFiles}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${totalFiles - successCount}`);
  }
}

// Main execution
const formatter = new GASFormatter();
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node gas-formatter.js [file-path]');
  console.log('       node gas-formatter.js --all');
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