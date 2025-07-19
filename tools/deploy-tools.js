#!/usr/bin/env node

/**
 * Enhanced Deployment Tools with Status System
 * Handles idea, draft, beta, public deployment statuses
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Validates and sanitizes file paths to prevent path traversal attacks
 * @param {string} inputPath - The path to validate
 * @param {string} basePath - Optional base path to restrict access to
 * @returns {string} - Validated and resolved path
 * @throws {Error} - If path is invalid or contains traversal attempts
 */
function validatePath(inputPath, basePath = process.cwd()) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Invalid path input: must be a non-empty string');
  }
  
  // Prevent directory traversal attempts
  if (inputPath.includes('..') || inputPath.includes('~') || inputPath.startsWith('/')) {
    throw new Error('Path traversal attempt detected');
  }
  
  // Resolve the path and ensure it's within the base directory
  const resolvedPath = path.resolve(basePath, inputPath);
  const resolvedBase = path.resolve(basePath);
  
  if (!resolvedPath.startsWith(resolvedBase)) {
    throw new Error('Path outside of allowed directory');
  }
  
  return resolvedPath;
}

class EnhancedGASDeploymentManager {
  constructor() {
    this.rootDir = process.cwd();
    this.projectsDir = path.join(this.rootDir, 'projects');
    this.configDir = path.join(this.rootDir, 'config');
    this.statusConfigPath = path.join(this.configDir, 'deployment-status.json');
    
    this.deploymentStatuses = ['idea', 'draft', 'beta', 'public'];
    this.environments = {
      'beta': 'beta',
      'public': 'production'
    };
  }

  async deployAll(targetStatus = 'public') {
    console.log(`🚀 Deploying all projects with status: ${targetStatus}...`);
    
    const projects = this.getProjectsByStatus(targetStatus);
    if (projects.length === 0) {
      console.log(`📋 No projects found with status: ${targetStatus}`);
      return;
    }

    console.log(`📦 Found ${projects.length} projects to deploy:`);
    projects.forEach(project => {
      console.log(`   - ${project.name} (${project.status})`);
    });

    for (const project of projects) {
      try {
        await this.deployProject(project.name, targetStatus);
      } catch (error) {
        console.error(`❌ Failed to deploy ${project.name}:`, error.message);
      }
    }

    await this.updateStatusDashboard();
  }

  async deployProject(projectName, targetStatus = null) {
    console.log(`\n📦 Deploying ${projectName}...`);
    
    const projectPath = path.join(this.projectsDir, projectName);
    
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project directory not found: ${projectPath}`);
    }

    const config = this.getProjectConfig(projectPath);
    
    // Determine deployment status
    const deploymentStatus = targetStatus || config.status || 'draft';
    
    // Check if status allows deployment
    if (!this.shouldDeploy(deploymentStatus)) {
      console.log(`⏸️  Skipping ${projectName} - status '${deploymentStatus}' does not allow deployment`);
      return;
    }

    // Validate project
    this.validateProject(projectPath);
    
    // Get deployment environment
    const environment = this.getDeploymentEnvironment(deploymentStatus);
    const scriptId = this.getScriptIdForEnvironment(config, environment);
    
    if (!scriptId) {
      throw new Error(`No script ID configured for ${projectName} in ${environment} environment`);
    }

    console.log(`🎯 Deploying to ${environment} environment (${deploymentStatus})`);
    
    // Update appsscript.json from config
    this.updateAppsScriptJson(projectPath, config);
    
    // Update .clasp.json with correct script ID
    this.updateClaspJson(projectPath, scriptId);
    
    // Deploy to Google Apps Script
    await this.pushToGAS(projectPath);
    
    // Update deployment record
    await this.recordDeployment(projectName, deploymentStatus, environment);
    
    console.log(`✅ ${projectName} deployed successfully to ${environment}`);
  }

  shouldDeploy(status) {
    const deployableStatuses = ['beta', 'public'];
    return deployableStatuses.includes(status);
  }

  getDeploymentEnvironment(status) {
    return this.environments[status] || 'development';
  }

  getProjectsByStatus(targetStatus) {
    const projects = this.getProjects();
    
    return projects.map(projectName => {
      const projectPath = path.join(this.projectsDir, projectName);
      const config = this.getProjectConfig(projectPath);
      return {
        name: projectName,
        status: config.status || 'draft',
        config: config
      };
    }).filter(project => {
      if (targetStatus === 'all') return true;
      return project.status === targetStatus;
    });
  }

  getProjectConfig(projectPath) {
    const validatedProjectPath = validatePath(projectPath, this.rootDir);
    const configPath = path.join(validatedProjectPath, 'project-config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error(`Project config not found: ${configPath}`);
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  getScriptIdForEnvironment(config, environment) {
    if (config.deploymentConfig && 
        config.deploymentConfig.environments && 
        config.deploymentConfig.environments[environment]) {
      return config.deploymentConfig.environments[environment].scriptId;
    }
    
    // Fallback to single script ID for backward compatibility
    return config.scriptId;
  }

  updateClaspJson(projectPath, scriptId) {
    const validatedProjectPath = validatePath(projectPath, this.rootDir);
    const claspPath = path.join(validatedProjectPath, '.clasp.json');
    let claspConfig = {};
    
    if (fs.existsSync(claspPath)) {
      claspConfig = JSON.parse(fs.readFileSync(claspPath, 'utf8'));
    }
    
    claspConfig.scriptId = scriptId;
    claspConfig.rootDir = claspConfig.rootDir || './src';
    
    fs.writeFileSync(claspPath, JSON.stringify(claspConfig, null, 2));
  }

  async setProjectStatus(projectName, newStatus) {
    if (!this.deploymentStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Valid statuses: ${this.deploymentStatuses.join(', ')}`);
    }

    const projectPath = path.join(this.projectsDir, projectName);
    const config = this.getProjectConfig(projectPath);
    
    const oldStatus = config.status || 'draft';
    config.status = newStatus;
    config.lastUpdated = new Date().toISOString().split('T')[0];
    
    // Update version if moving to higher status
    if (this.isStatusUpgrade(oldStatus, newStatus)) {
      config.version = this.incrementVersion(config.version || '1.0.0');
    }

    const validatedProjectPath = validatePath(projectPath, this.rootDir);
    const configPath = path.join(validatedProjectPath, 'project-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`📝 Updated ${projectName} status: ${oldStatus} → ${newStatus}`);
    
    // Auto-deploy if moving to deployable status
    if (this.shouldDeploy(newStatus) && !this.shouldDeploy(oldStatus)) {
      console.log(`🚀 Auto-deploying ${projectName} to ${newStatus} environment...`);
      await this.deployProject(projectName, newStatus);
    }

    await this.updateStatusDashboard();
  }

  isStatusUpgrade(oldStatus, newStatus) {
    const statusOrder = { 'idea': 0, 'draft': 1, 'beta': 2, 'public': 3 };
    return statusOrder[newStatus] > statusOrder[oldStatus];
  }

  incrementVersion(currentVersion) {
    const parts = currentVersion.split('.').map(n => parseInt(n));
    parts[2]++; // Increment patch version
    return parts.join('.');
  }

  async recordDeployment(projectName, status, environment) {
    const deploymentRecord = {
      project: projectName,
      status: status,
      environment: environment,
      timestamp: new Date().toISOString(),
      success: true
    };

    // Update project config with last deployment
    const projectPath = path.join(this.projectsDir, projectName);
    const config = this.getProjectConfig(projectPath);
    
    config.lastDeployment = deploymentRecord.timestamp;
    if (!config.deploymentHistory) config.deploymentHistory = [];
    
    config.deploymentHistory.unshift(deploymentRecord);
    // Keep only last 10 deployments
    config.deploymentHistory = config.deploymentHistory.slice(0, 10);

    const validatedProjectPath = validatePath(projectPath, this.rootDir);
    const configPath = path.join(validatedProjectPath, 'project-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  async updateStatusDashboard() {
    const validatedConfigDir = validatePath(this.configDir, this.rootDir);
    if (!fs.existsSync(validatedConfigDir)) {
      fs.mkdirSync(validatedConfigDir, { recursive: true });
    }

    const projects = this.getProjects();
    const dashboard = {
      repository: {
        name: "workspace-automation",
        lastUpdated: new Date().toISOString(),
        totalProjects: projects.length
      },
      projects: {}
    };

    projects.forEach(projectName => {
      const projectPath = validatePath(path.join(this.projectsDir, projectName), this.rootDir);
      try {
        const config = this.getProjectConfig(projectPath);
        const srcPath = path.join(projectPath, 'src');
        const scriptCount = fs.existsSync(srcPath) ? 
          fs.readdirSync(srcPath).filter(f => f.endsWith('.gs')).length : 0;

        dashboard.projects[projectName] = {
          status: config.status || 'draft',
          version: config.version || '1.0.0',
          scripts: scriptCount,
          lastDeployment: config.lastDeployment || null,
          environments: this.getActiveEnvironments(config)
        };
      } catch (error) {
        console.warn(`⚠️  Could not read config for ${projectName}: ${error.message}`);
      }
    });

    const validatedStatusPath = validatePath(this.statusConfigPath, this.rootDir);
    fs.writeFileSync(validatedStatusPath, JSON.stringify(dashboard, null, 2));
    console.log(`📊 Updated deployment status dashboard`);
  }

  getActiveEnvironments(config) {
    const environments = [];
    
    if (config.deploymentConfig && config.deploymentConfig.environments) {
      Object.entries(config.deploymentConfig.environments).forEach(([env, envConfig]) => {
        if (envConfig.enabled && envConfig.scriptId) {
          environments.push(env);
        }
      });
    } else if (config.scriptId) {
      // Fallback for simple configuration
      const status = config.status || 'draft';
      if (this.shouldDeploy(status)) {
        environments.push(this.getDeploymentEnvironment(status));
      }
    }
    
    return environments;
  }

  async showStatus(projectName = null) {
    if (projectName) {
      // Show specific project status
      const projectPath = path.join(this.projectsDir, projectName);
      const config = this.getProjectConfig(projectPath);
      
      console.log(`\n📋 Status for ${projectName}:`);
      console.log(`   Status: ${config.status || 'draft'}`);
      console.log(`   Version: ${config.version || '1.0.0'}`);
      console.log(`   Last Updated: ${config.lastUpdated || 'Unknown'}`);
      console.log(`   Last Deployment: ${config.lastDeployment || 'Never'}`);
      
      if (config.deploymentConfig && config.deploymentConfig.environments) {
        console.log(`   Environments:`);
        Object.entries(config.deploymentConfig.environments).forEach(([env, envConfig]) => {
          const status = envConfig.enabled ? '✅' : '❌';
          console.log(`     ${env}: ${status} (${envConfig.scriptId || 'No Script ID'})`);
        });
      }
    } else {
      // Show all projects status
      if (fs.existsSync(this.statusConfigPath)) {
        const validatedStatusPath = validatePath(this.statusConfigPath, this.rootDir);
        const dashboard = JSON.parse(fs.readFileSync(validatedStatusPath, 'utf8'));
        
        console.log(`\n📊 Deployment Status Dashboard`);
        console.log(`Last Updated: ${dashboard.repository.lastUpdated}`);
        console.log(`Total Projects: ${dashboard.repository.totalProjects}\n`);
        
        console.log(`| Project | Status | Version | Scripts | Last Deployment |`);
        console.log(`|---------|--------|---------|---------|-----------------|`);
        
        Object.entries(dashboard.projects).forEach(([name, info]) => {
          const lastDeploy = info.lastDeployment ? 
            new Date(info.lastDeployment).toLocaleDateString() : 'Never';
          console.log(`| ${name} | ${info.status} | ${info.version} | ${info.scripts} | ${lastDeploy} |`);
        });
      } else {
        console.log(`📋 No status dashboard found. Projects need to be set up first.`);
        
        // Show available projects from scripts directory
        const scriptsDir = validatePath(path.join(this.rootDir, 'scripts'), this.rootDir);
        if (fs.existsSync(scriptsDir)) {
          console.log(`\n📁 Available services in scripts directory:`);
          const services = fs.readdirSync(scriptsDir).filter(item => {
            const itemPath = path.join(scriptsDir, item);
            return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
          });
          services.forEach(service => {
            const servicePath = path.join(scriptsDir, service);
            const gsFiles = this.countGsFiles(servicePath);
            console.log(`   - ${service}: ${gsFiles} .gs files`);
          });
          console.log(`\nRun 'npm run migrate' to set up projects.`);
        }
      }
    }
  }

  countGsFiles(dir) {
    let count = 0;
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      files.forEach(file => {
        if (file.isDirectory()) {
          count += this.countGsFiles(path.join(dir, file.name));
        } else if (file.name.endsWith('.gs')) {
          count++;
        }
      });
    }
    return count;
  }

  // Existing methods from previous version
  getProjects() {
    if (!fs.existsSync(this.projectsDir)) {
      return [];
    }
    
    const validatedProjectsDir = validatePath(this.projectsDir, this.rootDir);
    return fs.readdirSync(validatedProjectsDir)
      .filter(item => {
        const itemPath = path.join(validatedProjectsDir, item);
        return fs.statSync(itemPath).isDirectory();
      });
  }

  validateProject(projectPath) {
    const validatedProjectPath = validatePath(projectPath, this.rootDir);
    const requiredFiles = [
      '.clasp.json',
      'appsscript.json', 
      'project-config.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(validatedProjectPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing required file: ${file} in ${validatedProjectPath}`);
      }
    }

    const srcPath = path.join(validatedProjectPath, 'src');
    if (!fs.existsSync(srcPath) || fs.readdirSync(srcPath).length === 0) {
      throw new Error(`No source files found in ${srcPath}`);
    }
  }

  updateAppsScriptJson(projectPath, config) {
    const validatedProjectPath = validatePath(projectPath, this.rootDir);
    const appsscriptPath = path.join(validatedProjectPath, 'appsscript.json');
    let appsscript = {
      "timeZone": "America/Los_Angeles",
      "dependencies": {},
      "webapp": {
        "executeAs": "USER_ACCESSING",
        "access": "DOMAIN"
      },
      "exceptionLogging": "STACKDRIVER",
      "runtimeVersion": "V8"
    };

    if (fs.existsSync(appsscriptPath)) {
      appsscript = JSON.parse(fs.readFileSync(appsscriptPath, 'utf8'));
    }

    appsscript.oauthScopes = config.oauthScopes || [];

    if (config.enabledAPIs && config.enabledAPIs.length > 0) {
      appsscript.dependencies = appsscript.dependencies || {};
      appsscript.dependencies.enabledAdvancedServices = config.enabledAPIs.map(api => ({
        userSymbol: this.getServiceSymbol(api),
        serviceId: api,
        version: 'v3'
      }));
    }

    if (config.libraries && config.libraries.length > 0) {
      appsscript.dependencies.libraries = config.libraries;
    }

    fs.writeFileSync(appsscriptPath, JSON.stringify(appsscript, null, 2));
  }

  getServiceSymbol(apiName) {
    const symbols = {
      'calendar': 'Calendar',
      'gmail': 'Gmail',
      'drive': 'Drive',
      'docs': 'Docs',
      'sheets': 'Sheets',
      'slides': 'Slides',
      'tasks': 'Tasks'
    };
    return symbols[apiName] || apiName.charAt(0).toUpperCase() + apiName.slice(1);
  }

  async pushToGAS(projectPath) {
    const validatedProjectPath = validatePath(projectPath, this.rootDir);
    const originalCwd = process.cwd();
    
    try {
      process.chdir(validatedProjectPath);
      
      try {
        execSync('clasp login --status', { stdio: 'pipe' });
      } catch (error) {
        throw new Error('Not logged into clasp. Run "clasp login" first.');
      }

      console.log('   📤 Pushing files to Google Apps Script...');
      execSync('clasp push --force', { stdio: 'inherit' });
      
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    } finally {
      process.chdir(originalCwd);
    }
  }
}

// CLI interface
if (require.main === module) {
  const manager = new EnhancedGASDeploymentManager();
  const command = process.argv[2];
  const projectName = process.argv[3];
  const status = process.argv[4];

  switch (command) {
    case 'deploy-all':
      const targetStatus = projectName || 'public';
      manager.deployAll(targetStatus).catch(console.error);
      break;
    case 'deploy':
      if (!projectName) {
        console.error('Usage: node deploy-tools.js deploy <project-name> [status]');
        process.exit(1);
      }
      manager.deployProject(projectName, status).catch(console.error);
      break;
    case 'status':
      manager.showStatus(projectName).catch(console.error);
      break;
    case 'set-status':
      if (!projectName || !status) {
        console.error('Usage: node deploy-tools.js set-status <project-name> <status>');
        console.error('Valid statuses: idea, draft, beta, public');
        process.exit(1);
      }
      manager.setProjectStatus(projectName, status).catch(console.error);
      break;
    case 'dashboard':
      manager.updateStatusDashboard().catch(console.error);
      break;
    default:
      console.log(`
Usage: node deploy-tools.js <command> [options]

Commands:
  deploy-all [status]           Deploy all projects with specified status (default: public)
  deploy <project> [status]     Deploy specific project
  status [project]              Show status dashboard or specific project status
  set-status <project> <status> Set project status (idea|draft|beta|public)
  dashboard                     Update status dashboard

Examples:
  node deploy-tools.js deploy-all beta     # Deploy all beta projects
  node deploy-tools.js deploy gmail        # Deploy gmail project
  node deploy-tools.js set-status gmail beta  # Set gmail to beta status
  node deploy-tools.js status              # Show all project status
      `);
  }
}

module.exports = EnhancedGASDeploymentManager;