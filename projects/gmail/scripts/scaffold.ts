#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Service definitions based on existing script patterns
interface ServiceDefinition {
  name: string;
  displayName: string;
  description: string;
  scopes: string[];
  scripts: string[];
  category: string;
}

const services: ServiceDefinition[] = [
  {
    name: 'gmail-analysis',
    displayName: 'Gmail Analysis Service',
    description: 'Comprehensive email analysis and reporting tools',
    category: 'analysis',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
    scripts: [
      'gmail-analysis-24months.gs',
      'gmail-analysis-label-statistics.gs',
      'gmail-analysis-label-stats.gs',
      'gmail-analysis-labeled-vs-unlabeled-count.gs',
      'gmail-analysis-labels-data.gs',
      'gmail-analysis-markdown-yaml-v2.gs',
      'gmail-analysis-markdown-yaml.gs',
      'gmail-analysis-metadata-misc.gs'
    ]
  },
  {
    name: 'gmail-export',
    displayName: 'Gmail Export Service',
    description: 'Email export tools for various formats and destinations',
    category: 'export',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive'
    ],
    scripts: [
      'gmail-export-advanced-sheets.gs',
      'gmail-export-basic-sheets.gs',
      'gmail-export-docs-pdf.gs',
      'gmail-export-emails-pdf-attachments.gs',
      'gmail-export-labels-to-sheets.gs',
      'gmail-export-pdf-markdown.gs',
      'gmail-export-pdf-only.gs',
      'gmail-export-transportation-emails-markdown.gs',
      'gmail-export-weekly-threads.gs'
    ]
  },
  {
    name: 'gmail-labels',
    displayName: 'Gmail Labels Service',
    description: 'Comprehensive label management and automation',
    category: 'labels',
    scopes: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
    scripts: [
      'gmail-labels-analysis.gs',
      'gmail-labels-auto-sender.gs',
      'gmail-labels-count.gs',
      'gmail-labels-create-basic.gs',
      'gmail-labels-create-sender.gs',
      'gmail-labels-date-processor.gs',
      'gmail-labels-delete-all.gs',
      'gmail-labels-export-to-sheets.gs',
      'gmail-labels-statistics.gs',
      'gmail-labels-status-count.gs',
      'gmail-labels-unread-count.gs'
    ]
  },
  {
    name: 'gmail-utility',
    displayName: 'Gmail Utility Service',
    description: 'General utility and maintenance tools',
    category: 'utility',
    scopes: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.readonly'
    ],
    scripts: [
      'gmail-utility-delete-all-labels.gs',
      'gmail-utility-header-cleaner.gs',
      'gmail-utility-mark-read.gs',
      'gmail-utility-markdown-fixer.gs',
      'gmail-utility-md-linter.gs'
    ]
  },
  {
    name: 'gmail-processing',
    displayName: 'Gmail Processing Service',
    description: 'Automated email processing and workflow tools',
    category: 'processing',
    scopes: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels'
    ],
    scripts: [
      'gmail-process-auto-label-by-sender.gs'
    ]
  },
  {
    name: 'gmail-metadata',
    displayName: 'Gmail Metadata Service',
    description: 'Email metadata extraction and analysis tools',
    category: 'metadata',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
    scripts: [
      'gmail-metadata-tools.gs'
    ]
  },
  {
    name: 'sheets-utility',
    displayName: 'Sheets Utility Service',
    description: 'Google Sheets utility and helper functions',
    category: 'sheets',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ],
    scripts: [
      'sheets-utility-script-22-legacy.gs'
    ]
  },
  {
    name: 'email-data',
    displayName: 'Email Data Service',
    description: 'Email data extraction and legacy migration tools',
    category: 'data',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
    scripts: [
      'email-data-24months-copy-legacy.gs',
      'email-export-pdf-md-sheets-copy-legacy.gs',
      'email-labels-data-copy-legacy.gs'
    ]
  }
];

class ServiceScaffolder {
  private templatePath: string;
  private outputPath: string;

  constructor(templatePath: string, outputPath: string) {
    this.templatePath = templatePath;
    this.outputPath = outputPath;
  }

  /**
   * Generate all services from the template
   */
  async generateAllServices(): Promise<void> {
    console.log('🚀 Starting service scaffolding...');
    
    for (const service of services) {
      await this.generateService(service);
    }
    
    console.log('✅ All services generated successfully!');
  }

  /**
   * Generate a single service from the template
   */
  async generateService(service: ServiceDefinition): Promise<void> {
    console.log(`📦 Generating service: ${service.displayName}`);
    
    const servicePath = path.join(this.outputPath, service.name);
    
    // Create service directory
    if (fs.existsSync(servicePath)) {
      console.log(`⚠️  Service directory ${service.name} already exists, skipping...`);
      return;
    }
    
    // Copy template
    this.copyTemplate(servicePath);
    
    // Process template files
    await this.processTemplateFiles(servicePath, service);
    
    // Create empty script files
    await this.createScriptFiles(servicePath, service);
    
    console.log(`✅ Generated ${service.name}`);
  }

  /**
   * Copy template directory to service directory
   */
  private copyTemplate(servicePath: string): void {
    execSync(`cp -r "${this.templatePath}" "${servicePath}"`);
  }

  /**
   * Process template files and replace placeholders
   */
  private async processTemplateFiles(servicePath: string, service: ServiceDefinition): Promise<void> {
    const filesToProcess = [
      'README.md',
      'appsscript.json',
      'src/config.gs',
      'src/common.gs',
      'src/utils.gs',
      'src/test.gs',
      'deploy/deploy.gs',
      'docs/API_TEMPLATE.md'
    ];

    for (const filePath of filesToProcess) {
      const fullPath = path.join(servicePath, filePath);
      if (fs.existsSync(fullPath)) {
        await this.processFile(fullPath, service);
      }
    }
  }

  /**
   * Process a single file and replace placeholders
   */
  private async processFile(filePath: string, service: ServiceDefinition): Promise<void> {
    let content = fs.readFileSync(filePath, 'utf8');
    const currentDate = new Date().toISOString().split('T')[0];
    const authorEmail = 'platform-team@company.com';
    const authorName = 'Platform Team';
    
    // Simple string replacements using split/join for reliability
    content = content.split('[SERVICE_NAME]').join(service.name);
    content = content.split('[DISPLAY_NAME]').join(service.displayName);
    content = content.split('[DESCRIPTION]').join(service.description);
    content = content.split('[CATEGORY]').join(service.category);
    content = content.split('[YYYY-MM-DD]').join(currentDate);
    content = content.split('[Your Name]').join(authorName);
    content = content.split('[your.email@domain.com]').join(authorEmail);
    content = content.split('[admin@domain.com]').join('admin@company.com');
    content = content.split('[errors@domain.com]').join('errors@company.com');

    // Special handling for appsscript.json to add OAuth scopes
    if (filePath.endsWith('appsscript.json')) {
      const manifest = JSON.parse(content);
      manifest.oauthScopes = service.scopes;
      content = JSON.stringify(manifest, null, 2);
    }

    // Special handling for config.gs to add service-specific configuration
    if (filePath.endsWith('config.gs')) {
      content = this.addServiceSpecificConfig(content, service);
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Add service-specific configuration to config.gs
   */
  private addServiceSpecificConfig(content: string, service: ServiceDefinition): string {
    // Add service-specific constants before the closing of SERVICE_CONFIG
    const configAddition = `
  // Service-specific configuration
  CATEGORY: '${service.category}',
  SCRIPT_COUNT: ${service.scripts.length},
  OAUTH_SCOPES: ${JSON.stringify(service.scopes, null, 4).replace(/\n/g, '\n  ')},`;

    return content.replace(
      /(NOTIFICATION_EMAIL: 'admin@company\.com',)/,
      `$1${configAddition}`
    );
  }

  /**
   * Create empty script files based on the service definition
   */
  private async createScriptFiles(servicePath: string, service: ServiceDefinition): Promise<void> {
    const scriptsPath = path.join(servicePath, 'src', 'scripts');
    
    // Create scripts directory
    if (!fs.existsSync(scriptsPath)) {
      fs.mkdirSync(scriptsPath, { recursive: true });
    }

    // Create each script file
    for (const scriptName of service.scripts) {
      const scriptPath = path.join(scriptsPath, scriptName);
      const scriptContent = this.generateScriptTemplate(scriptName, service);
      fs.writeFileSync(scriptPath, scriptContent, 'utf8');
    }

    console.log(`📝 Created ${service.scripts.length} script files`);
  }

  /**
   * Generate template content for a script file
   */
  private generateScriptTemplate(scriptName: string, service: ServiceDefinition): string {
    const currentDate = new Date().toISOString().split('T')[0];
    const functionName = this.scriptNameToFunctionName(scriptName);
    
    return `/**
 * @fileoverview ${this.scriptNameToDescription(scriptName)}
 * @author Platform Team <platform-team@company.com>
 * @version 1.0.0
 * @since ${currentDate}
 * @lastmodified ${currentDate}
 * @service ${service.name}
 * @category ${service.category}
 */

/**
 * Main function for ${scriptName}
 * TODO: Implement the specific functionality for this script
 * 
 * @returns {void}
 */
function ${functionName}() {
  const lock = LockManager.acquire('${functionName}');
  
  if (!lock) {
    Logger.warn('Could not acquire lock for ${functionName}');
    return;
  }
  
  try {
    Logger.info('Starting ${functionName}');
    
    // TODO: Implement your script logic here
    // Example structure:
    // const data = fetchData();
    // const processed = processData(data);
    // saveResults(processed);
    
    Logger.info('${functionName} completed successfully');
  } catch (error) {
    ErrorHandler.handle(error, '${functionName}', true);
  } finally {
    LockManager.release(lock, '${functionName}');
  }
}

/**
 * Helper function for ${scriptName}
 * TODO: Add specific helper functions as needed
 */
function ${functionName}Helper() {
  // TODO: Implement helper logic
}

/**
 * Test function for ${scriptName}
 * TODO: Add comprehensive tests
 */
function test${functionName.charAt(0).toUpperCase() + functionName.slice(1)}() {
  Logger.info('Running tests for ${functionName}');
  
  try {
    // TODO: Add test cases
    Assert.isTrue(true, 'Placeholder test should pass');
    Logger.info('All tests passed for ${functionName}');
  } catch (error) {
    Logger.error('Tests failed for ${functionName}', error);
    throw error;
  }
}
`;
  }

  /**
   * Convert script name to function name
   */
  private scriptNameToFunctionName(scriptName: string): string {
    return scriptName
      .replace(/\.gs$/, '')
      .replace(/-([a-z0-9])/g, (match, letter) => letter.toUpperCase())
      .replace(/^([a-z])/, (match, letter) => letter.toLowerCase());
  }

  /**
   * Convert script name to description
   */
  private scriptNameToDescription(scriptName: string): string {
    return scriptName
      .replace(/\.gs$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Update service README with script inventory
   */
  private async updateServiceReadme(servicePath: string, service: ServiceDefinition): Promise<void> {
    const readmePath = path.join(servicePath, 'README.md');
    let content = fs.readFileSync(readmePath, 'utf8');
    
    // Add script inventory section
    const scriptInventory = `
## Script Inventory

This service contains ${service.scripts.length} scripts:

${service.scripts.map(script => `- \`${script}\` - ${this.scriptNameToDescription(script)}`).join('\n')}

## OAuth Scopes

This service requires the following OAuth scopes:

${service.scopes.map(scope => `- \`${scope}\``).join('\n')}
`;
    
    content = content.replace(
      /## Support/,
      `${scriptInventory}\n## Support`
    );
    
    fs.writeFileSync(readmePath, content, 'utf8');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const templatePath = path.resolve(__dirname, '..', 'service-template');
  const outputPath = path.resolve(__dirname, '..');
  
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Template directory not found:', templatePath);
    process.exit(1);
  }
  
  const scaffolder = new ServiceScaffolder(templatePath, outputPath);
  
  if (args.length === 0) {
    // Generate all services
    await scaffolder.generateAllServices();
  } else {
    // Generate specific service
    const serviceName = args[0];
    const service = services.find(s => s.name === serviceName);
    
    if (!service) {
      console.error('❌ Service not found:', serviceName);
      console.log('Available services:', services.map(s => s.name).join(', '));
      process.exit(1);
    }
    
    await scaffolder.generateService(service);
  }
  
  console.log('\n🎉 Scaffolding complete!');
  console.log('\nNext steps:');
  console.log('1. Review generated services');
  console.log('2. Implement script logic in src/scripts/ directories');
  console.log('3. Run tests with npm test (or your testing framework)');
  console.log('4. Commit the generated code');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ServiceScaffolder, services };
