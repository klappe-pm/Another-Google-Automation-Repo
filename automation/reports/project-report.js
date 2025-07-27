#!/usr/bin/env node

/**
 * Project Report Generator
 * Generates comprehensive reports about the repository
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

class ProjectReporter {
  constructor() {
    this.repoRoot = execSync('git rev-parse --show-toplevel').toString().trim();
    this.stats = {
      projects: {},
      totals: {
        files: 0,
        lines: 0,
        functions: 0
      }
    };
  }

  analyzeProject(projectPath, projectName) {
    const files = glob.sync('**/*.gs', {
      cwd: projectPath,
      ignore: ['node_modules/**']
    });

    let totalLines = 0;
    let totalFunctions = 0;

    files.forEach(file => {
      const content = fs.readFileSync(path.join(projectPath, file), 'utf8');
      const lines = content.split('\n').length;
      const functions = (content.match(/function\s+\w+/g) || []).length;
      
      totalLines += lines;
      totalFunctions += functions;
    });

    return {
      files: files.length,
      lines: totalLines,
      functions: totalFunctions
    };
  }

  generateReport() {
    console.log('Generating project report...\n');

    // Analyze each project
    const projectsDir = path.join(this.repoRoot, 'apps');
    const projects = fs.readdirSync(projectsDir).filter(f => {
      return fs.statSync(path.join(projectsDir, f)).isDirectory();
    });

    projects.forEach(project => {
      const projectPath = path.join(projectsDir, project);
      this.stats.projects[project] = this.analyzeProject(projectPath, project);
      
      this.stats.totals.files += this.stats.projects[project].files;
      this.stats.totals.lines += this.stats.projects[project].lines;
      this.stats.totals.functions += this.stats.projects[project].functions;
    });

    // Generate report
    const report = this.formatReport();
    
    // Save report
    const reportPath = path.join(this.repoRoot, 'docs/reports', `project-report-${new Date().toISOString().split('T')[0]}.md`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report);
    
    console.log(report);
    console.log(`\nReport saved to: ${reportPath}`);
  }

  formatReport() {
    const date = new Date().toISOString().split('T')[0];
    
    let report = `# Project Report - ${date}\n\n`;
    report += `## Summary\n\n`;
    report += `- Total Projects: ${Object.keys(this.stats.projects).length}\n`;
    report += `- Total Files: ${this.stats.totals.files}\n`;
    report += `- Total Lines: ${this.stats.totals.lines.toLocaleString()}\n`;
    report += `- Total Functions: ${this.stats.totals.functions.toLocaleString()}\n\n`;
    
    report += `## Projects\n\n`;
    report += `| Project | Files | Lines | Functions |\n`;
    report += `|---------|-------|-------|----------|\n`;
    
    Object.entries(this.stats.projects)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([project, stats]) => {
        report += `| ${project} | ${stats.files} | ${stats.lines.toLocaleString()} | ${stats.functions} |\n`;
      });
    
    report += `\n## File Types\n\n`;
    
    // Count file types
    const fileTypes = {};
    Object.values(this.stats.projects).forEach(project => {
      if (!fileTypes['.gs']) fileTypes['.gs'] = 0;
      fileTypes['.gs'] += project.files;
    });
    
    report += `| Extension | Count |\n`;
    report += `|-----------|-------|\n`;
    Object.entries(fileTypes).forEach(([ext, count]) => {
      report += `| ${ext} | ${count} |\n`;
    });
    
    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const reporter = new ProjectReporter();
  reporter.generateReport();
}

module.exports = ProjectReporter;