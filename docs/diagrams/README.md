# System Architecture Diagrams

## Purpose

Visual documentation and architecture diagrams using Mermaid.js and ASCII art for system understanding.

## Directory Structure

### ARCHITECTURE.md
System architecture overview with component relationships

### DEPLOYMENT_FLOW.md
Deployment pipeline visualization and error handling

### REPOSITORY_STRUCTURE.md
Directory organization and file naming conventions

### MULTI_AGENT_FRAMEWORK.md
Complete agent system architecture

## Usage Instructions

Navigate to specific subdirectories for detailed documentation and implementation guides.

### Diagram Generation Using Shared Libraries

```javascript
// Using shared libraries for diagram metadata
const { formatDate } = require('../../utils/date.js');
const { capitalizeWords } = require('../../utils/string.js');

// Generate Mermaid diagram with metadata
function generateSystemDiagram(components) {
  const header = `# System Architecture
**Generated**: ${formatDate(new Date())}
**Components**: ${components.length}

\`\`\`mermaid
graph TD`;

  const nodes = components.map(comp =>
    `    ${comp.id}[${capitalizeWords(comp.name)}]`
  ).join('\n');

  return header + nodes + '\n\`\`\`';
}
```

## Cross-links

- [Main README](/README.md)
- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [Agent Framework](MULTI_AGENT_FRAMEWORK.md)
- [Development Workflow](DEVELOPMENT_WORKFLOW.md)

## Standards

- Follow consistent naming conventions
- Include proper documentation headers
- Reference shared libraries where appropriate
- Maintain cross-links to related documentation

---

*Last Updated: July 2025*
*Generated using automated template engine*
