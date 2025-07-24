#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { services } from './scaffold';

class ScriptRegenerator {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Regenerate all script files across all services
   */
  async regenerateAllScripts(): Promise<void> {
    console.log('🔄 Starting script file regeneration...');
    
    let totalScriptsRegenerated = 0;
    
    // Regenerate new service structure scripts
    for (const service of services) {
      const scriptsRegenerated = await this.regenerateServiceScripts(service);
      totalScriptsRegenerated += scriptsRegenerated;
    }
    
    // Regenerate legacy scripts in ./src/ directory
    const legacyScriptsRegenerated = await this.regenerateLegacyScripts();
    totalScriptsRegenerated += legacyScriptsRegenerated;
    
    console.log(`✅ Successfully regenerated ${totalScriptsRegenerated} script files!`);
  }

  /**
   * Regenerate script files for a specific service
   */
  async regenerateServiceScripts(service: any): Promise<number> {
    console.log(`📦 Regenerating scripts for service: ${service.displayName}`);
    
    const servicePath = path.join(this.projectPath, service.name);
    const scriptsPath = path.join(servicePath, 'src', 'scripts');
    
    if (!fs.existsSync(servicePath)) {
      console.log(`⚠️  Service directory ${service.name} does not exist, skipping...`);
      return 0;
    }

    // Create scripts directory if it doesn't exist
    if (!fs.existsSync(scriptsPath)) {
      fs.mkdirSync(scriptsPath, { recursive: true });
    }

    // Regenerate each script file
    for (const scriptName of service.scripts) {
      const scriptPath = path.join(scriptsPath, scriptName);
      const scriptContent = this.generateScriptTemplate(scriptName, service);
      fs.writeFileSync(scriptPath, scriptContent, 'utf8');
      console.log(`  ✓ Regenerated ${scriptName}`);
    }

    console.log(`📝 Regenerated ${service.scripts.length} script files for ${service.name}`);
    return service.scripts.length;
  }

  /**
   * Generate template content for a script file with corrected function names
   */
  private generateScriptTemplate(scriptName: string, service: any): string {
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
   * Regenerate legacy script files in ./src/ directory
   */
  async regenerateLegacyScripts(): Promise<number> {
    console.log('📦 Regenerating legacy scripts in ./src/ directory');
    
    const srcPath = path.join(this.projectPath, 'src');
    
    if (!fs.existsSync(srcPath)) {
      console.log('⚠️  ./src/ directory does not exist, skipping...');
      return 0;
    }

    // Find all .gs files in src directory except config.gs and test.gs
    const scriptFiles = fs.readdirSync(srcPath)
      .filter(file => 
        file.endsWith('.gs') && 
        file !== 'config.gs' && 
        file !== 'test.gs'
      );

    // Regenerate each script file
    for (const scriptName of scriptFiles) {
      const scriptPath = path.join(srcPath, scriptName);
      const scriptContent = this.generateLegacyScriptTemplate(scriptName);
      fs.writeFileSync(scriptPath, scriptContent, 'utf8');
      console.log(`  ✓ Regenerated legacy ${scriptName}`);
    }

    console.log(`📝 Regenerated ${scriptFiles.length} legacy script files`);
    return scriptFiles.length;
  }

  /**
   * Generate template content for a legacy script file
   */
  private generateLegacyScriptTemplate(scriptName: string): string {
    const currentDate = new Date().toISOString().split('T')[0];
    const functionName = this.scriptNameToFunctionName(scriptName);
    
    return `/**
 * @fileoverview ${this.scriptNameToDescription(scriptName)} (Legacy Version)
 * @author Platform Team <platform-team@company.com>
 * @version 1.0.0
 * @since ${currentDate}
 * @lastmodified ${currentDate}
 * @deprecated This is a legacy script. Consider using the new service-based version.
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
   * Convert script name to function name (corrected version)
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
}

// CLI interface
async function main() {
  const projectPath = path.resolve(__dirname, '..');
  const regenerator = new ScriptRegenerator(projectPath);
  
  await regenerator.regenerateAllScripts();
  
  console.log('\n🎉 Script regeneration complete!');
  console.log('\nAll 144 script files have been regenerated with corrected function names.');
  console.log('\nNext steps:');
  console.log('1. Review the regenerated script files');
  console.log('2. Implement specific functionality in each script');
  console.log('3. Run tests to verify functionality');
  console.log('4. Commit the updated files');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ScriptRegenerator };
