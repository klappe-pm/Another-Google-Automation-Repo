#!/usr/bin/env node

/**
 * Security Scanner for Workspace Automation
 * Comprehensive security analysis tool for Google Apps Script projects
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class SecurityScanner {
    constructor() {
        this.resultsDir = path.join(process.cwd(), 'security', 'scan-results');
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                        new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
        this.reportFile = path.join(this.resultsDir, `security_scan_report_${this.timestamp}.txt`);
        this.issues = {
            snyk: 0,
            shell: 0,
            gas: 0,
            patterns: 0
        };
        
        // Ensure results directory exists
        this.ensureDirectoryExists(this.resultsDir);
        
        // Initialize report file
        this.initializeReport();
    }

    ensureDirectoryExists(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    }

    initializeReport() {
        const header = `Security Scan Report - ${new Date().toISOString()}
======================================

`;
        fs.writeFileSync(this.reportFile, header);
        console.log(`📋 Report will be saved to: ${this.reportFile}\n`);
    }

    logMessage(message, skipFile = false) {
        console.log(message);
        if (!skipFile) {
            fs.appendFileSync(this.reportFile, message + '\n');
        }
    }

    async runCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const result = execSync(command, { 
                    encoding: 'utf8', 
                    timeout: 30000,
                    ...options 
                });
                resolve(result);
            } catch (error) {
                // For security tools, non-zero exit codes often just mean issues were found
                resolve(error.stdout || error.message);
            }
        });
    }

    async checkToolAvailable(tool) {
        try {
            await this.runCommand(`which ${tool}`, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    async runSnykCodeAnalysis() {
        this.logMessage('\n🔍 Running Snyk Code analysis...');
        this.logMessage('==================================');

        const outputFile = path.join(this.resultsDir, `snyk_code_${this.timestamp}.sarif`);
        
        try {
            const result = await this.runCommand(`snyk code test --sarif-file-output="${outputFile}"`);
            this.logMessage(result);
            this.logMessage('✅ Snyk Code analysis completed');
            
            if (result.includes('issues') || result.includes('vulnerabilities')) {
                this.issues.snyk++;
            }
        } catch (error) {
            this.logMessage(`❌ Snyk Code analysis failed: ${error.message}`);
            this.issues.snyk++;
        }
    }

    async runSnykDependencyCheck() {
        this.logMessage('\n🔍 Running Snyk dependency analysis...');
        this.logMessage('=====================================');

        const outputFile = path.join(this.resultsDir, `snyk_deps_${this.timestamp}.json`);
        
        try {
            const result = await this.runCommand(`snyk test --json-file-output="${outputFile}"`);
            this.logMessage(result);
            this.logMessage('✅ Snyk dependency analysis completed');
            
            if (result.includes('vulnerabilities') || result.includes('issues')) {
                this.issues.snyk++;
            }
        } catch (error) {
            this.logMessage(`❌ Snyk dependency analysis failed: ${error.message}`);
            this.issues.snyk++;
        }
    }

    async analyzeShellScripts() {
        this.logMessage('\n🐚 Analyzing shell scripts with shellcheck...');
        this.logMessage('============================================');

        // Check if shellcheck is available
        if (!(await this.checkToolAvailable('shellcheck'))) {
            this.logMessage('⚠️ shellcheck not found. Installing via Homebrew...');
            try {
                await this.runCommand('brew install shellcheck');
            } catch (error) {
                this.logMessage('❌ Failed to install shellcheck. Please install manually.');
                return;
            }
        }

        try {
            // Find shell scripts
            const findResult = await this.runCommand('find . -name "*.sh" -not -path "./node_modules/*" -type f');
            const shellScripts = findResult.trim().split('\n').filter(script => script.length > 0);

            this.logMessage(`Found ${shellScripts.length} shell scripts`);

            for (const script of shellScripts) {
                this.logMessage(`Checking: ${script}`);
                const outputFile = path.join(this.resultsDir, `shellcheck_${path.basename(script)}_${this.timestamp}.txt`);
                
                try {
                    const result = await this.runCommand(`shellcheck "${script}"`);
                    fs.writeFileSync(outputFile, result);
                    
                    if (result.trim()) {
                        this.logMessage(`  ❌ Issues found - see ${outputFile}`);
                        this.issues.shell++;
                    } else {
                        this.logMessage('  ✅ No issues found');
                    }
                } catch (error) {
                    this.logMessage(`  ❌ Analysis failed: ${error.message}`);
                    this.issues.shell++;
                }
            }
        } catch (error) {
            this.logMessage(`❌ Shell script analysis failed: ${error.message}`);
        }
    }

    async analyzeGoogleAppsScripts() {
        this.logMessage('\n📜 Analyzing Google Apps Script files...');
        this.logMessage('=======================================');

        try {
            // Find .gs files
            const findResult = await this.runCommand('find . -name "*.gs" -not -path "./node_modules/*" -type f');
            const gasFiles = findResult.trim().split('\n').filter(file => file.length > 0);

            this.logMessage(`Found ${gasFiles.length} Google Apps Script files`);

            if (gasFiles.length === 0) {
                this.logMessage('No .gs files found to analyze');
                return;
            }

            // Check if ESLint is available
            if (await this.checkToolAvailable('npx')) {
                // Create temporary ESLint config for GAS
                const eslintConfig = {
                    env: {
                        es6: true,
                        node: true,
                        browser: true
                    },
                    extends: ['eslint:recommended'],
                    parserOptions: {
                        ecmaVersion: 2018,
                        sourceType: 'script'
                    },
                    globals: {
                        // Google Apps Script globals
                        'PropertiesService': 'readonly',
                        'DriveApp': 'readonly',
                        'SpreadsheetApp': 'readonly',
                        'DocumentApp': 'readonly',
                        'GmailApp': 'readonly',
                        'CalendarApp': 'readonly',
                        'Utilities': 'readonly',
                        'Logger': 'readonly',
                        'console': 'readonly',
                        'Session': 'readonly',
                        'Browser': 'readonly',
                        'HtmlService': 'readonly',
                        'ScriptApp': 'readonly',
                        'ContentService': 'readonly',
                        'XmlService': 'readonly',
                        'UrlFetchApp': 'readonly',
                        'LockService': 'readonly',
                        'CacheService': 'readonly',
                        'Blob': 'readonly'
                    },
                    rules: {
                        'no-console': 'off',
                        'no-unused-vars': 'warn',
                        'no-undef': 'warn'
                    }
                };

                const tempConfigFile = '.eslintrc.temp.js';
                fs.writeFileSync(tempConfigFile, `module.exports = ${JSON.stringify(eslintConfig, null, 2)};`);

                try {
                    for (const gasFile of gasFiles) {
                        this.logMessage(`Analyzing: ${gasFile}`);
                        const outputFile = path.join(this.resultsDir, `eslint_${path.basename(gasFile)}_${this.timestamp}.txt`);
                        
                        try {
                            const result = await this.runCommand(`npx eslint "${gasFile}" --config ${tempConfigFile} --format compact`);
                            fs.writeFileSync(outputFile, result);
                            
                            if (result.trim()) {
                                this.logMessage(`  ⚠️ Issues found - see ${outputFile}`);
                                this.issues.gas++;
                            } else {
                                this.logMessage('  ✅ No issues found');
                            }
                        } catch (error) {
                            this.logMessage(`  ❌ Analysis failed: ${error.message}`);
                            this.issues.gas++;
                        }
                    }
                } finally {
                    // Clean up temp config
                    if (fs.existsSync(tempConfigFile)) {
                        fs.unlinkSync(tempConfigFile);
                    }
                }
            } else {
                this.logMessage('⚠️ ESLint not available. Skipping .gs file analysis.');
            }
        } catch (error) {
            this.logMessage(`❌ Google Apps Script analysis failed: ${error.message}`);
        }
    }

    async scanSecurityPatterns() {
        this.logMessage('\n🔍 Scanning for common security patterns...');
        this.logMessage('==========================================');

        const patterns = [
            {
                name: 'Hardcoded secrets',
                command: 'grep -r -n -i "password\\|secret\\|token\\|key" --include="*.gs" --include="*.sh" --include="*.js" . | grep -v node_modules | head -10'
            },
            {
                name: 'SQL injection patterns',
                command: 'grep -r -n -E "(SELECT|INSERT|UPDATE|DELETE).*\\+" --include="*.gs" --include="*.js" . | grep -v node_modules | head -5'
            },
            {
                name: 'eval() usage',
                command: 'grep -r -n "eval(" --include="*.gs" --include="*.js" . | grep -v node_modules'
            }
        ];

        for (const pattern of patterns) {
            this.logMessage(`\nChecking for ${pattern.name}...`);
            try {
                const result = await this.runCommand(pattern.command);
                if (result.trim()) {
                    this.logMessage(`⚠️ Found ${pattern.name} - review manually:`);
                    this.logMessage(result.substring(0, 500)); // Limit output
                    this.issues.patterns++;
                } else {
                    this.logMessage(`✅ No ${pattern.name} found`);
                }
            } catch (error) {
                this.logMessage(`✅ No ${pattern.name} found`);
            }
        }
    }

    async generateSummary() {
        this.logMessage('\n========================================');
        this.logMessage('📊 SECURITY SCAN SUMMARY');
        this.logMessage('========================================');
        this.logMessage(`Snyk issues: ${this.issues.snyk}`);
        this.logMessage(`Shell script issues: ${this.issues.shell}`);
        this.logMessage(`Google Apps Script issues: ${this.issues.gas}`);
        this.logMessage(`Security pattern matches: ${this.issues.patterns}`);
        this.logMessage('');

        // List generated files
        this.logMessage('Generated files:');
        try {
            const files = fs.readdirSync(this.resultsDir)
                .filter(file => file.includes(this.timestamp))
                .map(file => path.join(this.resultsDir, file));
            
            for (const file of files) {
                const stats = fs.statSync(file);
                this.logMessage(`  ${file} (${stats.size} bytes)`);
            }
        } catch (error) {
            this.logMessage('  No timestamped files found');
        }

        this.logMessage('');
        this.logMessage('✅ Security scan completed!');
        this.logMessage(`📋 Full report saved to: ${this.reportFile}`);
        
        // Final recommendations
        this.logMessage('\n📋 TO ADDRESS ISSUES:');
        this.logMessage('1. Review Snyk Code results for JavaScript/TypeScript security issues');
        this.logMessage('2. Check shellcheck results for shell script issues');
        this.logMessage('3. Review ESLint results for Google Apps Script issues');
        this.logMessage('4. Manually review any flagged security patterns');
    }

    async run() {
        console.log('🔍 Starting comprehensive security scan...');
        console.log('========================================\n');

        try {
            await this.runSnykCodeAnalysis();
            await this.runSnykDependencyCheck();
            await this.analyzeShellScripts();
            await this.analyzeGoogleAppsScripts();
            await this.scanSecurityPatterns();
            await this.generateSummary();
            
            // Exit with non-zero code if issues found
            const totalIssues = Object.values(this.issues).reduce((sum, count) => sum + count, 0);
            process.exit(totalIssues > 0 ? 1 : 0);
            
        } catch (error) {
            this.logMessage(`❌ Security scan failed: ${error.message}`);
            process.exit(1);
        }
    }
}

// Run the scanner if called directly
if (require.main === module) {
    const scanner = new SecurityScanner();
    scanner.run().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = SecurityScanner;
