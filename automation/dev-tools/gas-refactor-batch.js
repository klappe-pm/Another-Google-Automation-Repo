#!/usr/bin/env node

/**
 * Google Apps Script Batch Refactoring Tool
 * Processes multiple scripts with formatting, linting, and progress tracking
 * 
 * Usage:
 *   node gas-refactor-batch.js                    # Interactive mode
 *   node gas-refactor-batch.js --service gmail    # Process specific service
 *   node gas-refactor-batch.js --all              # Process all scripts
 *   node gas-refactor-batch.js --dry-run          # Preview changes without applying
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

class GASRefactorBatch {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      service: options.service || null,
      interactive: options.interactive || true,
      ...options
    };
    
    this.scripts = [];
    this.processed = 0;
    this.errors = 0;
    this.skipped = 0;
  }

  /**
   * Main execution
   */
  async run() {
    console.log('🔧 Google Apps Script Batch Refactoring Tool');
    console.log('==========================================\n');
    
    // Load scripts from catalog
    this.loadScripts();
    
    if (this.options.service) {
      // Filter by service
      this.scripts = this.scripts.filter(s => 
        s.service.toLowerCase() === this.options.service.toLowerCase()
      );
      console.log(`📁 Processing ${this.scripts.length} scripts from ${this.options.service}\n`);
    } else if (this.options.interactive) {
      // Interactive mode - let user select
      await this.interactiveSelection();
    }
    
    // Process selected scripts
    await this.processScripts();
    
    // Show summary
    this.showSummary();
  }

  /**
   * Load scripts from catalog
   */
  loadScripts() {
    try {
      const catalogPath = path.join(process.cwd(), 'docs/script-catalog.json');
      if (fs.existsSync(catalogPath)) {
        const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        this.scripts = catalog.scripts || [];
      } else {
        // Generate catalog first
        console.log('📚 Generating script catalog...');
        execSync('node automation/dev-tools/gas-catalog.js --json', { stdio: 'inherit' });
        const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        this.scripts = catalog.scripts || [];
      }
    } catch (error) {
      console.error('❌ Failed to load script catalog:', error.message);
      process.exit(1);
    }
  }

  /**
   * Interactive script selection
   */
  async interactiveSelection() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (query) => new Promise(resolve => rl.question(query, resolve));
    
    console.log('📋 Available options:');
    console.log('  1. Process all scripts');
    console.log('  2. Process by service');
    console.log('  3. Process low documentation scores (<50%)');
    console.log('  4. Process scripts without headers');
    console.log('  5. Custom selection\n');
    
    const choice = await question('Select option (1-5): ');
    
    switch (choice) {
      case '1':
        // Process all
        break;
        
      case '2':
        // Group by service
        const services = [...new Set(this.scripts.map(s => s.service))];
        console.log('\n📂 Available services:');
        services.forEach((service, index) => {
          const count = this.scripts.filter(s => s.service === service).length;
          console.log(`  ${index + 1}. ${service} (${count} scripts)`);
        });
        const serviceIndex = await question('\nSelect service number: ');
        const selectedService = services[parseInt(serviceIndex) - 1];
        this.scripts = this.scripts.filter(s => s.service === selectedService);
        break;
        
      case '3':
        // Low documentation scores
        this.scripts = this.scripts.filter(s => s.documentationScore < 50);
        console.log(`\n📊 Found ${this.scripts.length} scripts with low documentation scores`);
        break;
        
      case '4':
        // Scripts without headers
        this.scripts = this.scripts.filter(s => !s.hasHeader);
        console.log(`\n📝 Found ${this.scripts.length} scripts without headers`);
        break;
        
      case '5':
        // Custom selection
        console.log('\n📄 Scripts:');
        this.scripts.forEach((script, index) => {
          console.log(`  ${index + 1}. ${script.name} (${script.service}) - ${script.documentationScore}%`);
        });
        const selection = await question('\nEnter script numbers (comma-separated): ');
        const indices = selection.split(',').map(n => parseInt(n.trim()) - 1);
        this.scripts = this.scripts.filter((_, index) => indices.includes(index));
        break;
    }
    
    rl.close();
    
    console.log(`\n✅ Selected ${this.scripts.length} scripts for processing\n`);
  }

  /**
   * Process selected scripts
   */
  async processScripts() {
    console.log('🚀 Starting batch processing...\n');
    
    for (const script of this.scripts) {
      await this.processScript(script);
    }
  }

  /**
   * Process individual script
   */
  async processScript(script) {
    console.log(`\n📄 Processing: ${script.name}`);
    console.log(`   Path: ${script.path}`);
    console.log(`   Current score: ${script.documentationScore}%`);
    
    if (this.options.dryRun) {
      console.log('   🔍 Dry run - changes would be:');
      
      // Check what would be done
      if (!script.hasHeader) {
        console.log('     - Add standard header');
      }
      if (!script.hasSummary) {
        console.log('     - Add script summary template');
      }
      if (script.documentationScore < 50) {
        console.log('     - Add function documentation');
      }
      console.log('     - Fix formatting issues');
      
      this.processed++;
      return;
    }
    
    try {
      // Step 1: Format the script
      console.log('   📝 Formatting...');
      execSync(`node automation/dev-tools/gas-formatter.js "${script.path}"`, { 
        stdio: 'pipe' 
      });
      
      // Step 2: Run linter to check issues
      console.log('   🔍 Linting...');
      const lintResult = this.runLinter(script.path);
      
      // Step 3: If the script needs manual attention, mark it
      if (lintResult.errors > 0) {
        console.log(`   ⚠️  Script has ${lintResult.errors} errors that need manual fixes`);
        this.createTodoFile(script, lintResult);
      }
      
      // Step 4: Update progress
      this.processed++;
      console.log('   ✅ Processed successfully');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.errors++;
    }
  }

  /**
   * Run linter and get results
   */
  runLinter(scriptPath) {
    try {
      const output = execSync(
        `node automation/dev-tools/gas-linter.js "${scriptPath}" --json`, 
        { encoding: 'utf8', stdio: 'pipe' }
      );
      return JSON.parse(output);
    } catch (error) {
      // Linter exits with error code if there are issues
      return {
        errors: 1,
        warnings: 0,
        issues: [{ message: error.message }]
      };
    }
  }

  /**
   * Create TODO file for scripts needing manual attention
   */
  createTodoFile(script, lintResult) {
    const todoDir = path.join(process.cwd(), 'docs/refactoring-todos');
    fs.mkdirSync(todoDir, { recursive: true });
    
    const todoPath = path.join(todoDir, `${script.name}.todo.md`);
    const content = [
      `# TODO: ${script.name}`,
      '',
      `**File**: ${script.path}`,
      `**Service**: ${script.service}`,
      `**Current Score**: ${script.documentationScore}%`,
      '',
      '## Required Fixes',
      '',
      '### Header Information',
      '- [ ] Update Title to be descriptive',
      '- [ ] Verify Service is correct',
      '- [ ] Add clear Purpose description',
      '- [ ] Update Created/Updated dates',
      '',
      '### Script Summary',
      '- [ ] Write detailed purpose',
      '- [ ] Add complete description',
      '- [ ] Describe problem being solved',
      '- [ ] Define success criteria',
      '- [ ] List at least 3 key features',
      '- [ ] List all services used',
      '- [ ] Add complete setup instructions (minimum 3 steps)',
      '',
      '### Function Documentation',
      '- [ ] Document all functions with clear descriptions',
      '- [ ] Add parameter documentation',
      '- [ ] Add return value documentation',
      '- [ ] Add usage examples for complex functions',
      '',
      '### Code Issues',
      ...lintResult.issues.map(issue => `- [ ] ${issue.message}`),
      '',
      '## Notes',
      '- Review the existing code to understand functionality',
      '- Ensure setup instructions are complete and tested',
      '- Add any configuration requirements',
      '- Document any prerequisites or dependencies'
    ];
    
    fs.writeFileSync(todoPath, content.join('\n'));
  }

  /**
   * Show processing summary
   */
  showSummary() {
    console.log('\n\n📊 Batch Processing Summary');
    console.log('===========================');
    console.log(`Total scripts selected: ${this.scripts.length}`);
    console.log(`Successfully processed: ${this.processed}`);
    console.log(`Errors encountered: ${this.errors}`);
    console.log(`Skipped: ${this.skipped}`);
    
    if (!this.options.dryRun && this.processed > 0) {
      console.log('\n📋 Next Steps:');
      console.log('1. Review changes with: git diff');
      console.log('2. Check TODO files in: docs/refactoring-todos/');
      console.log('3. Run catalog update: npm run catalog');
      console.log('4. Commit changes: git add -A && git commit -m "Refactor: Add headers to scripts"');
    }
    
    console.log('\n✨ Batch processing complete!');
  }
}

// Main execution
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  service: args.includes('--service') ? args[args.indexOf('--service') + 1] : null,
  interactive: !args.includes('--all') && !args.includes('--service')
};

const batch = new GASRefactorBatch(options);

if (args.includes('--help')) {
  console.log('Usage: node gas-refactor-batch.js [options]');
  console.log('\nOptions:');
  console.log('  --all              Process all scripts');
  console.log('  --service [name]   Process scripts from specific service');
  console.log('  --dry-run          Preview changes without applying');
  console.log('  --help             Show this help message');
  console.log('\nExamples:');
  console.log('  node gas-refactor-batch.js                    # Interactive mode');
  console.log('  node gas-refactor-batch.js --service gmail    # Process Gmail scripts');
  console.log('  node gas-refactor-batch.js --all --dry-run    # Preview all changes');
  process.exit(0);
}

batch.run().catch(console.error);