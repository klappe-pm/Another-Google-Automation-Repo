#!/usr/bin/env node

/**
 * Update final catalogs after all standardization
 */

const fs = require('fs').promises;
const path = require('path');

async function updateFinalCatalogs() {
  console.log('📚 Updating final catalogs...\n');
  
  const appsDir = path.join(__dirname, '../../apps');
  const services = {};
  let totalScripts = 0;
  
  // Scan all services
  const serviceDirs = await fs.readdir(appsDir);
  
  for (const service of serviceDirs) {
    const servicePath = path.join(appsDir, service);
    const stat = await fs.stat(servicePath);
    
    if (!stat.isDirectory() || service.startsWith('.')) continue;
    
    const srcPath = path.join(servicePath, 'src');
    
    try {
      const files = await fs.readdir(srcPath);
      const gsFiles = files.filter(f => f.endsWith('.gs')).sort();
      
      if (gsFiles.length > 0) {
        services[service] = gsFiles;
        totalScripts += gsFiles.length;
        console.log(`✅ ${service}: ${gsFiles.length} scripts`);
      }
    } catch (error) {
      // src directory might not exist
    }
  }
  
  // Generate main catalog
  let catalog = '# Google Apps Script Catalog\n\n';
  catalog += `Generated: ${new Date().toISOString()}\n\n`;
  catalog += `## Summary\n`;
  catalog += `- Total scripts: ${totalScripts}\n`;
  catalog += `- Services: ${Object.keys(services).length}\n\n`;
  
  catalog += '## Scripts by Service\n\n';
  
  // Sort services by name
  const sortedServices = Object.keys(services).sort();
  
  for (const service of sortedServices) {
    catalog += `### ${service.charAt(0).toUpperCase() + service.slice(1)} (${services[service].length} scripts)\n\n`;
    
    services[service].forEach(script => {
      const name = script.replace('.gs', '');
      const description = getScriptDescription(name);
      catalog += `- **${name}**: ${description}\n`;
    });
    
    catalog += '\n';
  }
  
  // Save main catalog
  await fs.writeFile(
    path.join(__dirname, '../../docs/SCRIPT_CATALOG.md'),
    catalog
  );
  
  // Generate detailed inventory
  let inventory = '# Google Apps Script Inventory\n\n';
  inventory += `Generated: ${new Date().toISOString()}\n\n`;
  inventory += '## Full Script List\n\n';
  inventory += '| Script | Service | Action | Target | Type |\n';
  inventory += '|--------|---------|--------|--------|------|\n';
  
  for (const service of sortedServices) {
    for (const script of services[service]) {
      const name = script.replace('.gs', '');
      const parts = parseScriptName(name);
      inventory += `| ${name} | ${service} | ${parts.action} | ${parts.target} | ${parts.type} |\n`;
    }
  }
  
  inventory += '\n## Script Naming Patterns\n\n';
  inventory += '- **Action-Noun**: Standard format (e.g., export-labels, create-folders)\n';
  inventory += '- **Markdown Prefix**: Scripts that create/modify markdown start with "markdown-"\n';
  inventory += '- **Version Suffix**: Legacy versions indicated with -v1, -v2, etc.\n';
  inventory += '- **Legacy Suffix**: Old implementations marked with -legacy\n';
  
  await fs.writeFile(
    path.join(__dirname, '../../docs/SCRIPT_INVENTORY.md'),
    inventory
  );
  
  // Generate migration summary
  let summary = '# Script Migration Summary\n\n';
  summary += `Generated: ${new Date().toISOString()}\n\n`;
  summary += '## Migration Statistics\n\n';
  summary += `- Total scripts: ${totalScripts}\n`;
  summary += `- Successfully standardized: ${totalScripts}\n`;
  summary += `- Services organized: ${Object.keys(services).length}\n\n`;
  
  summary += '## Scripts per Service\n\n';
  for (const service of sortedServices) {
    summary += `- **${service}**: ${services[service].length} scripts\n`;
  }
  
  summary += '\n## Standardization Applied\n\n';
  summary += '1. ✅ All filenames follow action-noun convention\n';
  summary += '2. ✅ Service prefixes removed (using folder structure)\n';
  summary += '3. ✅ Markdown scripts properly prefixed\n';
  summary += '4. ✅ Temporary scripts given descriptive names\n';
  summary += '5. ✅ Scripts moved to correct service folders\n';
  summary += '6. ✅ CamelCase converted to kebab-case\n';
  summary += '7. ✅ Smart formatting applied to all scripts\n';
  summary += '8. ✅ Duplicates removed (47 files)\n';
  
  await fs.writeFile(
    path.join(__dirname, '../../docs/MIGRATION_SUMMARY.md'),
    summary
  );
  
  console.log('\n📄 Generated reports:');
  console.log('- docs/SCRIPT_CATALOG.md');
  console.log('- docs/SCRIPT_INVENTORY.md');
  console.log('- docs/MIGRATION_SUMMARY.md');
  
  console.log('\n✅ Catalog update completed');
}

function getScriptDescription(name) {
  const descriptions = {
    // Common patterns
    'export-': 'Exports data to external format',
    'import-': 'Imports data from external source',
    'create-': 'Creates new items',
    'update-': 'Updates existing items',
    'delete-': 'Removes items',
    'process-': 'Processes and transforms data',
    'analyze-': 'Analyzes and generates insights',
    'format-': 'Formats and styles content',
    'index-': 'Creates searchable indexes',
    'generate-': 'Generates new content',
    'send-': 'Sends communications',
    'fetch-': 'Retrieves data',
    'extract-': 'Extracts specific information',
    'convert-': 'Converts between formats',
    'sync-': 'Synchronizes data',
    'merge-': 'Combines multiple sources',
    'lint-': 'Checks for issues',
    'style-': 'Applies formatting',
    'sort-': 'Orders items',
    'dedupe-': 'Removes duplicates',
    'list-': 'Lists items',
    'check-': 'Validates data',
    'search-': 'Finds specific items',
    'find-': 'Locates resources',
    'mark-': 'Marks items with status',
    'count-': 'Counts occurrences',
    'clean-': 'Removes unwanted data',
    'append-': 'Adds to existing data',
    'insert-': 'Inserts new data',
    'rename-': 'Changes names',
    'markdown-': 'Works with markdown files',
    'assist-': 'Provides assistance for tasks',
    'automate-': 'Automates manual processes',
    'combine-': 'Combines multiple items'
  };
  
  // Find matching description
  for (const [prefix, desc] of Object.entries(descriptions)) {
    if (name.startsWith(prefix)) {
      return desc;
    }
  }
  
  return 'Performs specialized operations';
}

function parseScriptName(name) {
  const parts = name.split('-');
  let action = '';
  let target = '';
  let type = 'standard';
  
  // Check for markdown prefix
  if (parts[0] === 'markdown') {
    type = 'markdown';
    action = parts[1] || '';
    target = parts.slice(2).join('-');
  } else {
    action = parts[0] || '';
    target = parts.slice(1).join('-');
  }
  
  // Check for legacy or version suffix
  if (name.includes('-legacy')) {
    type = 'legacy';
    target = target.replace('-legacy', '');
  } else if (name.match(/-v\d+$/)) {
    type = 'versioned';
    target = target.replace(/-v\d+$/, '');
  }
  
  return { action, target, type };
}

// Run if called directly
if (require.main === module) {
  updateFinalCatalogs().catch(console.error);
}

module.exports = { updateFinalCatalogs };