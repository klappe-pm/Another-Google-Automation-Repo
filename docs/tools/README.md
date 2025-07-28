# Repository Management Tools

## Overview
Comprehensive tools for managing the AGAR (Another Google Automation Repository) lifecycle, including review, reporting, and version management.

## Tools

### 1. Repository Review (`repo-review.js`)
**Purpose**: Comprehensive publication readiness analysis

**Features**:
- Security vulnerability scanning
- Documentation coverage analysis
- Code quality assessment
- File organization review
- Licensing compliance check

**Usage**:
```bash
# Run full review
npm run repo:review

# Direct execution
node tools/repository/repo-review.js
```

**Output**:
- Console report with scores and recommendations
- JSON report saved to `reports/repo-review-[timestamp].json`
- Exit code 0 if ready for publication, 1 if not

### 2. Repository Reporter (`repo-reporter.js`)
**Purpose**: Generate comprehensive status reports and analytics

**Features**:
- Overview report with key metrics
- Security analysis and vulnerability tracking
- Code statistics and language breakdown
- Documentation coverage analysis
- Historical trend analysis
- Executive dashboard generation

**Usage**:
```bash
# Generate all reports
npm run repo:report

# Generate specific reports
npm run repo:report-overview
npm run repo:report-security
npm run repo:report-code

# Direct execution
node tools/repository/repo-reporter.js [overview|security|code|docs|all]
```

**Output**:
- Individual JSON reports in `reports/` directory
- Executive dashboard JSON
- Markdown summary report

### 3. Version Manager (`version-manager.js`)
**Purpose**: Semantic versioning and release management

**Features**:
- Automatic version bumping (major/minor/patch)
- Changelog generation and maintenance
- Release notes creation
- Git tag management
- Version history tracking

**Usage**:
```bash
# Check current version
npm run version:current

# Bump version
npm run version:bump          # patch (2.0.0 → 2.0.1)
npm run version:bump-minor    # minor (2.0.0 → 2.1.0)
npm run version:bump-major    # major (2.0.0 → 3.0.0)

# View version history
npm run version:history

# Prepare release
npm run version:release

# Generate release notes
npm run version:notes

# Direct execution
node tools/repository/version-manager.js <command> [options]
```
## Cross-links

- [Main README](/README.md)
- [Repository Review Guide](repo-review.md)

## Workflow Scripts

### Publication Readiness Check

```bash
# Complete publication readiness assessment
npm run publication:check
```
This runs:
1. Repository review (`repo:review`)
2. Comprehensive reporting (`repo:report`)

### Prepare for Publication

```bash
# Automated publication preparation
npm run publication:prepare
```
This runs:
1. Repository review
2. Version bump (minor)
3. Generate reports
4. Update changelog
5. Create release notes
## Reports Structure

All reports are saved to the `reports/` directory:

```
reports/
├── repo-review-[timestamp].json         # Review results
├── overview-report-[timestamp].json     # Repository overview
├── security-report-[timestamp].json     # Security analysis
├── code-stats-report-[timestamp].json   # Code statistics
├── documentation-report-[timestamp].json # Doc analysis
├── history-report-[timestamp].json      # Git history
├── dashboard-[timestamp].json           # Executive dashboard
├── summary-[timestamp].md               # Markdown summary
├── version-history.json                 # Version tracking
└── release-notes-[version].md           # Release notes
```

## Scoring System

### Repository Review Scores (0-10)
- **Security**: Vulnerability scanning, sensitive file checks
- **Documentation**: README coverage, consistency, completeness
- **Organization**: File structure, naming conventions, cleanliness
- **Code Quality**: ESLint issues, script headers, standards
- **Licensing**: License files, attribution, compliance

### Overall Publication Readiness
- **9.0-10.0**: � Excellent - Ready for Publication
- **8.0-8.9**: � Good - Nearly Ready for Publication
- **7.0-7.9**:  Fair - Minor Issues to Address
- **5.0-6.9**:  Needs Work - Several Issues to Fix
- **0.0-4.9**: � Not Ready - Major Issues Present

## Integration with CI/CD

These tools can be integrated into GitHub Actions or other CI/CD systems:

```yaml
# Example GitHub Action step
- name: Repository Review
  run: |
    npm run repo:review
    npm run repo:report
  continue-on-error: false
```

## Configuration

### Environment Variables
- `NODE_ENV`: Set to 'production' for release builds
- `SKIP_SECURITY_SCAN`: Set to 'true' to skip security scanning (testing only)

### File Exclusions
The tools automatically exclude:
- `node_modules/`
- `.git/`
- Hidden files (starting with `.`)
- Temporary files (`*.tmp`, `*.temp`)
- System files (`.DS_Store`, `Thumbs.db`)

## Troubleshooting

### Common Issues

#### Security Scan Fails
- Ensure `npm audit` is available
- Check if Snyk is properly configured
- Verify network connectivity for vulnerability databases

#### Git Commands Fail
- Ensure the directory is a git repository
- Check git is installed and accessible
- Verify proper git configuration

#### Permission Errors
- Check file system permissions
- Ensure write access to `reports/` directory
- Verify Node.js has necessary system access

### Debug Mode
Run tools with debug output:
```bash
DEBUG=true node tools/repository/repo-review.js
```

## Development

### Adding New Checks
To add new review criteria:

1. Add check method to `RepositoryReviewer` class
2. Call from appropriate category method (`checkSecurity`, etc.)
3. Update scoring calculations
4. Add documentation

### Adding New Reports
To add new report types:

1. Add report method to `RepositoryReporter` class
2. Update `generateAllReports()` method
3. Add CLI command handling
4. Update package.json scripts

## License
MIT License - Same as main repository

## Contact
kevin@averageintelligence.ai

## Integration Date
2025-07-19

## Repository
Part of Workspace Automation (AGAR) project.
