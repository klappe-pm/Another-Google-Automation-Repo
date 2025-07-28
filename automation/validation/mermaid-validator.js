#!/usr/bin/env node

/**
 * Mermaid Diagram Validator
 * Validates mermaid diagrams in markdown files
 */

const fs = require('fs');
const path = require('path');

class MermaidValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    console.log(`\nValidating: ${fileName}`);
    
    // Find mermaid code blocks
    const mermaidBlocks = this.extractMermaidBlocks(content);
    
    if (mermaidBlocks.length === 0) {
      console.log(`  No mermaid diagrams found`);
      return true;
    }
    
    console.log(`  Found ${mermaidBlocks.length} mermaid diagram(s)`);
    
    let allValid = true;
    
    mermaidBlocks.forEach((block, index) => {
      const isValid = this.validateMermaidSyntax(block.content, block.lineNumber);
      if (!isValid) {
        allValid = false;
        this.errors.push({
          file: fileName,
          line: block.lineNumber,
          message: `Invalid mermaid syntax in diagram ${index + 1}`
        });
      }
    });
    
    return allValid;
  }

  extractMermaidBlocks(content) {
    const blocks = [];
    const lines = content.split('\n');
    let inMermaidBlock = false;
    let currentBlock = null;
    
    lines.forEach((line, index) => {
      if (line.trim().startsWith('```mermaid')) {
        inMermaidBlock = true;
        currentBlock = {
          content: '',
          lineNumber: index + 1
        };
      } else if (inMermaidBlock && line.trim() === '```') {
        inMermaidBlock = false;
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
      } else if (inMermaidBlock && currentBlock) {
        currentBlock.content += line + '\n';
      }
    });
    
    return blocks;
  }

  validateMermaidSyntax(content, lineNumber) {
    // Basic syntax validation
    const trimmed = content.trim();
    
    if (!trimmed) {
      return false;
    }
    
    // Check for common mermaid diagram types
    const validTypes = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
      'stateDiagram', 'erDiagram', 'gantt', 'pie', 'journey',
      'gitgraph', 'mindmap', 'timeline', 'zenuml', 'sankey'
    ];
    
    const firstLine = trimmed.split('\n')[0].trim();
    const hasValidType = validTypes.some(type => 
      firstLine.startsWith(type) || firstLine.includes(type)
    );
    
    if (!hasValidType) {
      console.log(`    Warning: Unknown diagram type at line ${lineNumber}`);
      this.warnings.push({
        line: lineNumber,
        message: 'Unknown mermaid diagram type'
      });
    }
    
    // Check for basic syntax issues
    const lines = trimmed.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !this.isValidMermaidLine(line)) {
        console.log(`    Error: Invalid syntax at line ${lineNumber + i}: ${line}`);
        return false;
      }
    }
    
    return true;
  }

  isValidMermaidLine(line) {
    // Skip empty lines and comments
    if (!line || line.startsWith('%%')) {
      return true;
    }
    
    // Basic patterns that are commonly valid
    const validPatterns = [
      /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitgraph|mindmap|timeline|zenuml|sankey)/,
      /^[A-Za-z0-9_-]+(\s*-->?\s*[A-Za-z0-9_-]+)?/,
      /^[A-Za-z0-9_-]+\s*:\s*.+/,
      /^[A-Za-z0-9_-]+\s*\[.*\]/,
      /^[A-Za-z0-9_-]+\s*\(.*\)/,
      /^[A-Za-z0-9_-]+\s*\{.*\}/,
      /^\s*(TD|TB|BT|RL|LR)\s*$/,
      /^\s*title\s+.+/,
      /^\s*participant\s+.+/,
      /^\s*note\s+(left|right|over)\s+.+/,
      /^\s*class\s+.+/,
      /^\s*state\s+.+/,
      /^\s*(dateFormat|axisFormat|includes|excludes)\s+.+/,
      /^\s*section\s+.+/,
      /^\s*(.*?)\s*:\s*\d+/
    ];
    
    return validPatterns.some(pattern => pattern.test(line));
  }

  validateFiles(files) {
    let totalErrors = 0;
    let totalWarnings = 0;
    let allValid = true;

    files.forEach(file => {
      const isValid = this.validateFile(file);
      if (!isValid) {
        allValid = false;
      }
    });

    // Count totals
    totalErrors = this.errors.length;
    totalWarnings = this.warnings.length;

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('Mermaid Validation Summary');
    console.log('='.repeat(50));
    console.log(`Files checked: ${files.length}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Warnings: ${totalWarnings}`);

    if (totalErrors > 0) {
      console.log('\nValidation failed with errors:');
      this.errors.forEach(err => {
        console.log(`  ${err.file}:${err.line} - ${err.message}`);
      });
    }

    if (totalWarnings > 0) {
      console.log('\nValidation completed with warnings:');
      this.warnings.forEach(warn => {
        console.log(`  Line ${warn.line} - ${warn.message}`);
      });
    }

    if (totalErrors === 0) {
      console.log('\nAll mermaid diagrams passed validation!');
    }

    return allValid;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: mermaid-validator.js <file-or-directory>');
    console.log('Example: mermaid-validator.js docs/diagrams/');
    process.exit(1);
  }
  
  const target = args[0];
  const validator = new MermaidValidator();
  const files = [];
  
  // Collect files
  if (fs.statSync(target).isDirectory()) {
    function findMarkdownFiles(dir) {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          findMarkdownFiles(fullPath);
        } else if (stat.isFile() && item.toLowerCase().endsWith('.md')) {
          files.push(fullPath);
        }
      });
    }
    findMarkdownFiles(target);
  } else {
    files.push(target);
  }
  
  if (files.length === 0) {
    console.log('No markdown files found');
    process.exit(0);
  }
  
  const success = validator.validateFiles(files);
  process.exit(success ? 0 : 1);
}

module.exports = MermaidValidator;
