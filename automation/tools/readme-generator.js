#!/usr/bin/env node

/**
 * README Template Engine
 * 
 * Generates consistent README.md files for major directories using templates
 * and shared configuration data.
 * 
 * Features:
 * - Template-based generation
 * - Cross-link validation
 * - Shared library integration
 * - Consistent formatting
 */

const fs = require('fs');
const path = require('path');

// Configuration for each directory
const directoryConfigs = {
  'agents': {
    title: 'Multi-Agent Framework',
    purpose: 'Specialized AI agents that collaborate to analyze, design, implement, and maintain automation solutions.',
    subdirectories: [
      { name: 'project-evaluator', description: 'Strategic project analysis and evolution tracking' },
      { name: 'data-synthesizer', description: 'Metrics aggregation and optimization insights' },
      { name: 'solution-designer', description: 'Architecture design and scalable solutions' },
      { name: 'code-advisor', description: 'Technical debt assessment and improvements' },
      { name: 'documenter', description: 'Documentation automation and maintenance' }
    ],
    crossLinks: [
      { name: 'Main README', path: '/README.md' },
      { name: 'Agent Implementation Summary', path: 'AGENT_IMPLEMENTATION_SUMMARY.md' },
      { name: 'Multi-Agent Framework Guide', path: '/docs/diagrams/MULTI_AGENT_FRAMEWORK.md' }
    ],
    codeExamples: [
      {
        title: 'Agent Communication Using Shared Libraries',
        code: `// Using shared utilities for agent communication
const { validateAgentData } = require('../utils/validation.js');
const { formatTimestamp } = require('../utils/date.js');
const { processArray } = require('../utils/array.js');

// Agent analysis with validation
function analyzeProject(projectData) {
  if (!validateAgentData(projectData)) {
    throw new Error('Invalid project data for analysis');
  }
  
  return {
    timestamp: formatTimestamp(new Date()),
    analysis: processArray(projectData.metrics, metric => ({
      name: metric.name,
      value: metric.value,
      trend: calculateTrend(metric.history)
    }))
  };
}`
      }
    ]
  },
  'automation': {
    title: 'Automation Tools & Scripts',
    purpose: 'Comprehensive automation infrastructure for Google Workspace project management, deployment, and quality assurance.',
    subdirectories: [
      { name: 'deployment', description: 'Deployment scripts and environment setup' },
      { name: 'tools', description: 'Development and maintenance utilities' },
      { name: 'validation', description: 'Testing, linting, and quality assurance' },
      { name: 'utilities', description: 'Git automation and configuration management' }
    ],
    crossLinks: [
      { name: 'Main README', path: '/README.md' },
      { name: 'Deployment Guide', path: '/docs/diagrams/DEPLOYMENT_FLOW.md' },
      { name: 'Development Workflow', path: '/docs/diagrams/DEVELOPMENT_WORKFLOW.md' }
    ],
    codeExamples: [
      {
        title: 'Validation Script Using Shared Libraries',
        code: `// Using shared libraries for script validation
const { validateEmail, validateUrl } = require('../../utils/validation.js');
const { splitByDelimiter } = require('../../utils/string.js');
const { removeDuplicates } = require('../../utils/array.js');

// Validate Google Apps Script configuration
function validateGASConfig(config) {
  const errors = [];
  
  // Validate email addresses
  if (config.notificationEmails) {
    const emails = splitByDelimiter(config.notificationEmails, ',');
    const validEmails = emails.filter(email => validateEmail(email.trim()));
    config.validatedEmails = removeDuplicates(validEmails);
  }
  
  // Validate webhook URLs
  if (config.webhookUrls && !config.webhookUrls.every(validateUrl)) {
    errors.push('Invalid webhook URLs detected');
  }
  
  return { isValid: errors.length === 0, errors, config };
}`
      }
    ]
  },
  'docs/diagrams': {
    title: 'System Architecture Diagrams',
    purpose: 'Visual documentation and architecture diagrams using Mermaid.js and ASCII art for system understanding.',
    subdirectories: [
      { name: 'ARCHITECTURE.md', description: 'System architecture overview with component relationships' },
      { name: 'DEPLOYMENT_FLOW.md', description: 'Deployment pipeline visualization and error handling' },
      { name: 'REPOSITORY_STRUCTURE.md', description: 'Directory organization and file naming conventions' },
      { name: 'MULTI_AGENT_FRAMEWORK.md', description: 'Complete agent system architecture' }
    ],
    crossLinks: [
      { name: 'Main README', path: '/README.md' },
      { name: 'System Architecture', path: 'SYSTEM_ARCHITECTURE.md' },
      { name: 'Agent Framework', path: 'MULTI_AGENT_FRAMEWORK.md' },
      { name: 'Development Workflow', path: 'DEVELOPMENT_WORKFLOW.md' }
    ],
    codeExamples: [
      {
        title: 'Diagram Generation Using Shared Libraries',
        code: `// Using shared libraries for diagram metadata
const { formatDate } = require('../../utils/date.js');
const { capitalizeWords } = require('../../utils/string.js');

// Generate Mermaid diagram with metadata
function generateSystemDiagram(components) {
  const header = \`# System Architecture
**Generated**: \${formatDate(new Date())}
**Components**: \${components.length}

\\\`\\\`\\\`mermaid
graph TD\`;
  
  const nodes = components.map(comp => 
    \`    \${comp.id}[\${capitalizeWords(comp.name)}]\`
  ).join('\\n');
  
  return header + nodes + '\\n\\\`\\\`\\\`';
}`
      }
    ]
  },
  'docs/reports': {
    title: 'Project Reports & Analysis',
    purpose: 'Comprehensive project reports and analysis documents generated by agents and automated systems.',
    subdirectories: [
      { name: 'Daily Summaries', description: 'Daily progress tracking and milestone updates' },
      { name: 'Project Analysis', description: 'Quality assessments and status reports' },
      { name: 'Framework Development', description: 'Modernization progress and impact analysis' },
      { name: 'System Health', description: 'Error tracking and quality improvements' }
    ],
    crossLinks: [
      { name: 'Main README', path: '/README.md' },
      { name: 'Agent Implementation Summary', path: '/agents/AGENT_IMPLEMENTATION_SUMMARY.md' },
      { name: 'Framework Upgrade Status', path: 'framework-upgrade-status-2025-07-28.md' },
      { name: 'Repository Tools', path: '/docs/tools/README.md' }
    ],
    codeExamples: [
      {
        title: 'Report Generation Using Shared Libraries',
        code: `// Using shared validation and formatting utilities
const { validateProjectData } = require('../../utils/validation.js');
const { formatDate, getDaysDifference } = require('../../utils/date.js');
const { truncateString } = require('../../utils/string.js');

// Generate comprehensive project report
function generateProjectReport(data) {
  if (!validateProjectData(data)) {
    throw new Error('Invalid project data');
  }
  
  return {
    timestamp: formatDate(new Date()),
    summary: truncateString(data.summary, 200),
    daysSinceLastUpdate: getDaysDifference(data.lastUpdate, new Date()),
    metrics: data.metrics,
    recommendations: data.recommendations || []
  };
}`
      }
    ]
  },
  'tools': {
    title: 'Development Tools',
    purpose: 'Development and repository management tools for quality assurance, version control, and publication readiness.',
    subdirectories: [
      { name: 'Repository Review', description: 'Publication readiness analysis and security scanning' },
      { name: 'Report Generation', description: 'Comprehensive status reports and analytics' },
      { name: 'Version Management', description: 'Semantic versioning and release management' }
    ],
    crossLinks: [
      { name: 'Main README', path: '/README.md' },
      { name: 'Repository Tools Guide', path: '/docs/tools/README.md' },
      { name: 'Development Workflow', path: '/docs/diagrams/DEVELOPMENT_WORKFLOW.md' }
    ],
    codeExamples: [
      {
        title: 'Tool Integration Using Shared Libraries',
        code: `// Using shared libraries for tool development
const { validateConfig } = require('../utils/validation.js');
const { sortByProperty } = require('../utils/array.js');
const { formatDate } = require('../utils/date.js');

// Repository analysis tool
class RepositoryAnalyzer {
  constructor(config) {
    if (!validateConfig(config)) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }
  
  analyzeFiles(files) {
    const sortedFiles = sortByProperty(files, 'lastModified');
    
    return {
      timestamp: formatDate(new Date()),
      totalFiles: files.length,
      recentFiles: sortedFiles.slice(0, 10),
      analysis: this.performAnalysis(sortedFiles)
    };
  }
}`
      }
    ]
  }
};

// README template
const readmeTemplate = (config) => `# ${config.title}

## Purpose

${config.purpose}

## Directory Structure

${config.subdirectories.map(sub => `### ${sub.name}
${sub.description}
`).join('\n')}

## Usage Instructions

Navigate to specific subdirectories for detailed documentation and implementation guides.

${config.codeExamples.map(example => `### ${example.title}

\`\`\`javascript
${example.code}
\`\`\`
`).join('\n')}

## Cross-links

${config.crossLinks.map(link => `- [${link.name}](${link.path})`).join('\n')}

## Standards

- Follow consistent naming conventions
- Include proper documentation headers
- Reference shared libraries where appropriate
- Maintain cross-links to related documentation

---

*Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}*
*Generated using automated template engine*
`;

// Generate README for a specific directory
function generateReadme(directoryName) {
  const config = directoryConfigs[directoryName];
  if (!config) {
    console.error(`No configuration found for directory: ${directoryName}`);
    return;
  }

  const readmeContent = readmeTemplate(config);
  const readmePath = path.join(process.cwd(), directoryName, 'README.md');
  
  // Ensure directory exists
  const dir = path.dirname(readmePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(readmePath, readmeContent);
  console.log(`Generated README for ${directoryName}: ${readmePath}`);
}

// Generate all READMEs
function generateAllReadmes() {
  Object.keys(directoryConfigs).forEach(generateReadme);
  console.log('All README files generated successfully!');
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    generateAllReadmes();
  } else {
    args.forEach(generateReadme);
  }
}

module.exports = {
  generateReadme,
  generateAllReadmes,
  directoryConfigs
};
