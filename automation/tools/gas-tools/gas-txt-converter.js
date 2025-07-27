#!/usr/bin/env node

/**
 * Google Apps Script Text File Converter
 * Converts raw text files to properly formatted .gs files
 */

const fs = require('fs').promises;
const path = require('path');

class GASTxtConverter {
  constructor() {
    this.repoRoot = path.join(__dirname, '../..');
    this.txtDir = path.join(this.repoRoot, 'txt to convert');
    this.tempDir = path.join(this.repoRoot, 'temp', 'converted-scripts');
    this.convertedFiles = [];
  }

  async convertAll() {
    console.log('📄 Starting text file conversion...\n');
    
    try {
      // Create temp directory
      await fs.mkdir(this.tempDir, { recursive: true });
      
      // Get all txt files
      const files = await fs.readdir(this.txtDir);
      const txtFiles = files.filter(f => f.endsWith('.txt'));
      
      console.log(`Found ${txtFiles.length} text files to convert\n`);
      
      // Process each file
      for (const file of txtFiles) {
        await this.convertFile(file);
      }
      
      // Generate conversion report
      await this.generateReport();
      
      console.log(`\n✅ Conversion complete! ${this.convertedFiles.length} files processed`);
      console.log(`📁 Output directory: ${this.tempDir}`);
      
    } catch (error) {
      console.error('❌ Error during conversion:', error.message);
      throw error;
    }
  }

  async convertFile(filename) {
    console.log(`📝 Converting: ${filename}`);
    
    try {
      const filePath = path.join(this.txtDir, filename);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Generate standard filename
      const gsFilename = this.generateGSFilename(filename);
      
      // Parse content to extract metadata
      const metadata = this.extractMetadata(content);
      
      // Detect primary service
      const service = this.detectService(content);
      
      // Create converted file info
      const fileInfo = {
        originalName: filename,
        gsFilename: gsFilename,
        service: service,
        hasHeader: metadata.hasHeader,
        title: metadata.title || this.titleFromFilename(filename),
        purpose: metadata.purpose,
        content: content,
        convertedAt: new Date().toISOString()
      };
      
      // Save converted file
      const outputPath = path.join(this.tempDir, gsFilename);
      await fs.writeFile(outputPath, content);
      
      // Save metadata
      const metadataPath = path.join(this.tempDir, gsFilename.replace('.gs', '-metadata.json'));
      await fs.writeFile(metadataPath, JSON.stringify(fileInfo, null, 2));
      
      this.convertedFiles.push(fileInfo);
      
      console.log(`  ✅ Converted to: ${gsFilename} (${service} service)`);
      
    } catch (error) {
      console.error(`  ❌ Failed to convert ${filename}: ${error.message}`);
    }
  }

  generateGSFilename(txtFilename) {
    // Remove .txt extension
    let base = txtFilename.replace('.txt', '');
    
    // Handle special characters and spaces
    base = base
      .replace(/\s+/g, '-')           // Replace spaces with dashes
      .replace(/[,()]/g, '')          // Remove commas, parentheses
      .replace(/-+/g, '-')            // Replace multiple dashes with single
      .replace(/^-|-$/g, '')          // Remove leading/trailing dashes
      .toLowerCase();
    
    // Ensure it follows service-function-description pattern
    if (!base.includes('-')) {
      // If no dashes, try to add them based on camelCase
      base = base.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
    
    return base + '.gs';
  }

  extractMetadata(content) {
    const metadata = {
      hasHeader: false,
      title: null,
      purpose: null,
      summary: null
    };
    
    // Check for existing header
    if (content.startsWith('/**')) {
      metadata.hasHeader = true;
      
      // Extract title
      const titleMatch = content.match(/\*\s*(?:Script\s+)?Title:\s*(.+)/i);
      if (titleMatch) {
        metadata.title = titleMatch[1].trim();
      }
      
      // Extract purpose
      const purposeMatch = content.match(/\*\s*Purpose:\s*([^*]+)/i);
      if (purposeMatch) {
        metadata.purpose = purposeMatch[1].trim().replace(/\n\s*\*/g, ' ');
      }
      
      // Extract summary
      const summaryMatch = content.match(/\*\s*(?:Script\s+)?Summary:\s*([^*]+)/i);
      if (summaryMatch) {
        metadata.summary = summaryMatch[1].trim().replace(/\n\s*\*/g, ' ');
      }
    }
    
    return metadata;
  }

  detectService(content) {
    const servicePatterns = {
      gmail: /GmailApp\.|Gmail\.|getLabel|getInboxThreads|sendEmail/i,
      drive: /DriveApp\.|Drive\.|getFolderById|createFile|getFiles/i,
      sheets: /SpreadsheetApp\.|Sheets\.|getActiveSpreadsheet|getRange/i,
      calendar: /CalendarApp\.|Calendar\.|getCalendarById|createEvent/i,
      docs: /DocumentApp\.|Docs\.|getActiveDocument|getParagraphs/i,
      slides: /SlidesApp\.|Slides\.|getActivePresentation/i,
      tasks: /Tasks\.|taskslists|tasks\.insert/i,
      chat: /Chat\.|spaces\.messages/i,
      photos: /Photos\.|mediaItems/i
    };
    
    // Count occurrences of each service
    const serviceCounts = {};
    
    for (const [service, pattern] of Object.entries(servicePatterns)) {
      const matches = content.match(new RegExp(pattern, 'g'));
      if (matches) {
        serviceCounts[service] = matches.length;
      }
    }
    
    // Return service with most matches
    if (Object.keys(serviceCounts).length > 0) {
      return Object.entries(serviceCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
    }
    
    return 'utility'; // Default if no service detected
  }

  titleFromFilename(filename) {
    // Convert filename to title
    return filename
      .replace('.txt', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  async generateReport() {
    const reportPath = path.join(this.tempDir, 'conversion-report.md');
    
    // Group by service
    const byService = {};
    for (const file of this.convertedFiles) {
      if (!byService[file.service]) {
        byService[file.service] = [];
      }
      byService[file.service].push(file);
    }
    
    const report = `# Text File Conversion Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Files**: ${this.convertedFiles.length}
- **Output Directory**: \`${path.relative(this.repoRoot, this.tempDir)}\`

## Converted Files by Service

${Object.entries(byService).map(([service, files]) => `### ${service} (${files.length} files)

| Original Name | Converted Name | Has Header |
|---------------|----------------|------------|
${files.map(f => 
  `| ${f.originalName} | ${f.gsFilename} | ${f.hasHeader ? '✅' : '❌'} |`
).join('\n')}
`).join('\n')}

## Next Steps

1. Review converted files in \`${path.relative(this.repoRoot, this.tempDir)}\`
2. Run duplicate detection: \`npm run gas:duplicates\`
3. Apply smart formatting: \`npm run format:smart ${this.tempDir}/*.gs\`
4. Migrate to appropriate service directories
5. Update script catalog

## Files Needing Attention

${this.convertedFiles
  .filter(f => !f.hasHeader)
  .map(f => `- **${f.gsFilename}**: Missing header documentation`)
  .join('\n') || 'All files have headers! ✅'}
`;

    await fs.writeFile(reportPath, report);
    console.log(`\n📊 Conversion report: ${reportPath}`);
  }
}

// Run if called directly
if (require.main === module) {
  const converter = new GASTxtConverter();
  converter.convertAll().catch(console.error);
}

module.exports = GASTxtConverter;