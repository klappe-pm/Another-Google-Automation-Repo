#!/usr/bin/env node

/**
 * README Style Linter
 * Validates README files against project standards
 */

const fs = require('fs');
const path = require('path');

class ReadmeLinter {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  lint(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    this.checkEmojis(content, filePath);
    this.checkLanguage(content, filePath);
    this.checkStructure(lines, filePath);
    this.checkFormatting(lines, filePath);
    this.checkReferences(content, filePath);
    
    return {
      file: filePath,
      errors: this.errors,
      warnings: this.warnings,
      fixes: this.fixes,
      passed: this.errors.length === 0
    };
  }

  checkEmojis(content, filePath) {
    // Common emoji patterns - simplified for Node.js compatibility
    const emojiPattern = /[🚀📋🛠️📚🔧📊📄🤝❤️✅❌🟡⚠️📝💡😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗😙😚☺️🙂🤗🤩🤔🤨😐😑😶🙄😏😣😥😮🤐😯😪😫😴😌😛😜😝🤤😒😓😔😕🙃🤑😲☹️🙁😖😞😟😤😢😭😦😧😨😩🤯😬😰😱🥵🥶😳🤪😵😡😠🤬😷🤒🤕🤢🤮🤧😇🤠🤡🥳🥴🥺🤥🤫🤭🧐🤓😈👿👹👺💀👻👽🤖💩😺😸😹😻😼😽🙀😿😾]/g;
    
    const matches = content.match(emojiPattern);
    if (matches) {
      this.errors.push({
        line: 0,
        message: `Found ${matches.length} emojis. Remove all emojis.`,
        emojis: [...new Set(matches)]
      });
    }
  }

  checkLanguage(content, filePath) {
    // Weasel words to avoid
    const weaselWords = [
      'very', 'really', 'quite', 'extremely', 'highly',
      'basically', 'simply', 'just', 'actually', 'literally',
      'awesome', 'amazing', 'fantastic', 'great', 'excellent',
      'comprehensive', 'robust', 'powerful', 'advanced',
      'cutting-edge', 'state-of-the-art', 'best-in-class',
      'easy', 'simple', 'intuitive', 'seamless'
    ];
    
    const contentLower = content.toLowerCase();
    const foundWeaselWords = [];
    
    weaselWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(contentLower)) {
        foundWeaselWords.push(word);
      }
    });
    
    if (foundWeaselWords.length > 0) {
      this.warnings.push({
        message: `Found weasel words: ${foundWeaselWords.join(', ')}`,
        suggestion: 'Use specific, factual language'
      });
    }

    // Check for unnecessary adjectives
    const adjectivePatterns = [
      /professionally documented/gi,
      /comprehensive collection/gi,
      /complete automation framework/gi,
      /powerful automation/gi,
      /seamless integration/gi
    ];
    
    adjectivePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        this.warnings.push({
          message: `Remove adjectives: "${content.match(pattern)[0]}"`,
          suggestion: 'Use plain, factual descriptions'
        });
      }
    });
  }

  checkStructure(lines, filePath) {
    // Required sections for main README
    const requiredSections = [
      '# ',  // Title
      '## Overview',
      '## Requirements',
      '## Installation',
      '## Usage',
      '## Structure',
      '## Development',
      '## License'
    ];
    
    const isMainReadme = path.basename(filePath).toLowerCase() === 'readme.md' && 
                        path.dirname(filePath).endsWith('Workspace Automation');
    
    if (isMainReadme) {
      requiredSections.forEach(section => {
        const hasSection = lines.some(line => line.startsWith(section));
        if (!hasSection) {
          this.errors.push({
            message: `Missing required section: ${section}`
          });
        }
      });
    }

    // Check for duplicate sections
    const sectionCounts = {};
    lines.forEach((line, index) => {
      if (line.match(/^#{1,3}\s+/)) {
        const section = line.trim();
        sectionCounts[section] = (sectionCounts[section] || 0) + 1;
        if (sectionCounts[section] > 1) {
          this.warnings.push({
            line: index + 1,
            message: `Duplicate section: ${section}`
          });
        }
      }
    });
  }

  checkFormatting(lines, filePath) {
    lines.forEach((line, index) => {
      // No trailing whitespace
      if (line.endsWith(' ')) {
        this.errors.push({
          line: index + 1,
          message: 'Trailing whitespace'
        });
      }

      // Proper header formatting
      if (line.match(/^#+/) && !line.match(/^#{1,6}\s+/)) {
        this.errors.push({
          line: index + 1,
          message: 'Header must have space after #'
        });
      }

      // No multiple blank lines
      if (index > 0 && line === '' && lines[index - 1] === '') {
        this.warnings.push({
          line: index + 1,
          message: 'Multiple blank lines'
        });
      }
    });
  }

  checkReferences(content, filePath) {
    // Check for AI tool references
    const aiReferences = /claude|Claude|AI Assistant|AI-generated|ChatGPT|Copilot/gi;
    const aiMatches = content.match(aiReferences);
    
    if (aiMatches) {
      this.errors.push({
        message: `Found AI tool references: ${[...new Set(aiMatches)].join(', ')}`,
        suggestion: 'Remove all AI tool references'
      });
    }

    // Check for contributor attributions that shouldn't be there
    const badAttributions = /Co-Authored-By:\s*Claude|Generated with.*Claude|Built with.*Claude/gi;
    if (badAttributions.test(content)) {
      this.errors.push({
        message: 'Remove AI tool attributions',
        suggestion: 'Tools are not contributors'
      });
    }
  }

  fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove emojis
    content = content.replace(/[🚀📋🛠️📚🔧📊📄🤝❤️✅❌🟡⚠️📝💡😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗😙😚☺️🙂🤗🤩🤔🤨😐😑😶🙄😏😣😥😮🤐😯😪😫😴😌😛😜😝🤤😒😓😔😕🙃🤑😲☹️🙁😖😞😟😤😢😭😦😧😨😩🤯😬😰😱🥵🥶😳🤪😵😡😠🤬😷🤒🤕🤢🤮🤧😇🤠🤡🥳🥴🥺🤥🤫🤭🧐🤓😈👿👹👺💀👻👽🤖💩😺😸😹😻😼😽🙀😿😾]/g, '');
    
    // Remove AI references
    content = content.replace(/\s*🤖 Generated with \[Claude Code\]\([^)]+\)\s*/g, '');
    content = content.replace(/\s*Co-Authored-By: Claude[^\n]*/g, '');
    content = content.replace(/Claude AI Assistant/g, 'automation tools');
    
    // Fix trailing whitespace
    content = content.split('\n').map(line => line.trimEnd()).join('\n');
    
    // Fix multiple blank lines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Remove specific adjectives
    content = content.replace(/professionally documented/gi, 'documented');
    content = content.replace(/comprehensive collection/gi, 'collection');
    content = content.replace(/complete automation framework/gi, 'automation framework');
    content = content.replace(/powerful automation/gi, 'automation');
    
    // Fix header spacing
    content = content.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');
    
    return content;
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: readme-linter.js [--fix] <file-or-directory>');
    process.exit(1);
  }
  
  const shouldFix = args.includes('--fix');
  const target = args[args.length - 1];
  
  const linter = new ReadmeLinter();
  const files = [];
  
  // Collect files
  if (fs.statSync(target).isDirectory()) {
    function findReadmes(dir) {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          findReadmes(fullPath);
        } else if (stat.isFile() && item.toLowerCase().includes('readme')) {
          files.push(fullPath);
        }
      });
    }
    findReadmes(target);
  } else {
    files.push(target);
  }
  
  // Process files
  let totalErrors = 0;
  let totalWarnings = 0;
  
  files.forEach(file => {
    const result = linter.lint(file);
    
    if (result.errors.length > 0 || result.warnings.length > 0) {
      console.log(`\n${file}`);
      
      result.errors.forEach(error => {
        console.log(`  ERROR: ${error.message}`);
        if (error.line) console.log(`    Line ${error.line}`);
        if (error.suggestion) console.log(`    Suggestion: ${error.suggestion}`);
      });
      
      result.warnings.forEach(warning => {
        console.log(`  WARNING: ${warning.message}`);
        if (warning.line) console.log(`    Line ${warning.line}`);
        if (warning.suggestion) console.log(`    Suggestion: ${warning.suggestion}`);
      });
      
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
      
      if (shouldFix) {
        const fixed = linter.fix(file);
        fs.writeFileSync(file, fixed);
        console.log(`  FIXED: Applied automatic fixes`);
      }
    }
    
    // Reset for next file
    linter.errors = [];
    linter.warnings = [];
    linter.fixes = [];
  });
  
  console.log(`\nSummary:`);
  console.log(`Files checked: ${files.length}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);
  
  if (!shouldFix && totalErrors > 0) {
    console.log(`\nRun with --fix to automatically fix some issues`);
  }
  
  process.exit(totalErrors > 0 ? 1 : 0);
}

module.exports = ReadmeLinter;