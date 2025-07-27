# Automation Scripts

This directory contains all automation scripts for the Google Workspace Automation project.

## Structure

```
automation/
├── precommit/           # Pre-commit validation scripts
├── fixers/              # Automatic fixing scripts
├── deployment/          # Deployment and sync scripts
├── setup/               # Setup and verification scripts
└── reports/             # Reporting and analysis scripts
```

## Quick Start

### Initial Setup
```bash
npm run setup        # Run initial setup
npm run verify       # Verify setup is correct
```

### Daily Development
```bash
npm run fix          # Fix all issues automatically
npm run lint         # Check for linting issues
npm run sync         # Sync with remote repository
```

### Deployment
```bash
npm run deploy -- -p calendar     # Deploy single project
npm run deploy -- -a              # Deploy all projects
```

## Scripts Reference

### Pre-commit Checks
- `precommit/check-all.js` - Master validation script
- `precommit/lint-gas.js` - Lint Google Apps Scripts
- `precommit/lint-readme.js` - Lint README files

### Fixers
- `fixers/fix-all.js` - Run all fixes
- `fixers/fix-gas-headers.js` - Fix GAS headers
- `fixers/fix-gas-formatting.js` - Fix GAS formatting
- `fixers/fix-readme.js` - Fix README issues

### Deployment
- `deployment/deploy.sh` - Deploy projects
- `deployment/sync.sh` - Git sync operations

### Setup
- `setup/setup.sh` - Initial setup
- `setup/verify.sh` - Verify configuration

### Reports
- `reports/project-report.js` - Generate project reports

## Git Hooks

Pre-commit hooks are automatically installed during setup. They run validation checks on all staged files before allowing commits.

## Requirements

- Node.js 18+
- npm
- git
- Google clasp CLI

## License

MIT