# Google Apps Script Development Tools

This document describes the comprehensive toolset for developing, formatting, linting, and managing Google Apps Scripts in this repository.

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Formatting Tools](#formatting-tools)
4. [Linting Tools](#linting-tools)
5. [Catalog Generation](#catalog-generation)
6. [Batch Processing](#batch-processing)
7. [Git Integration](#git-integration)
8. [NPM Scripts Reference](#npm-scripts-reference)

## Overview

The GAS Development Tools provide:
- **Automated formatting** with intelligent header generation
- **Comprehensive linting** against style guidelines
- **Script catalogs** for tracking documentation coverage
- **Batch refactoring** capabilities
- **Pre-commit hooks** for quality enforcement
- **CI/CD integration** for automated checks

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up git hooks:
   ```bash
   npm run setup:git-hooks
   ```

## Formatting Tools

### Basic Formatter
Adds standard headers and fixes formatting issues:

```bash
# Format single file
npm run format apps/gmail/src/example.gs

# Format all files
npm run format:all
```

### Smart Formatter
Intelligently analyzes scripts and generates meaningful documentation:

```bash
# Smart format single file
npm run format:smart apps/gmail/src/example.gs

# Smart format all files
npm run format:smart:all
```

The smart formatter:
- Detects services used (Gmail, Drive, Sheets, etc.)
- Infers script purpose from code analysis
- Generates relevant setup instructions
- Creates meaningful function documentation
- Identifies key features automatically

## Linting Tools

### GAS Linter
Validates scripts against the style guide:

```bash
# Lint single file
npm run lint:gas apps/gmail/src/example.gs

# Lint all files
npm run lint:all

# Lint staged files (for git hooks)
npm run lint:staged

# Auto-fix issues
npm run lint:fix
```

Linting rules include:
- Header completeness
- Script summary requirements
- Function documentation
- Code formatting standards
- Performance patterns
- Naming conventions

### Severity Levels
- **ERROR**: Must fix (blocks commit)
- **WARNING**: Should fix (allows commit)
- **INFO**: Suggestions for improvement

## Catalog Generation

### Script Catalog
Generates a comprehensive inventory of all Google Apps Scripts:

```bash
# Generate catalog
npm run catalog

# Watch for changes
npm run catalog:watch

# Generate JSON format
npm run catalog:json
```

The catalog includes:
- Total script count by service
- Documentation coverage metrics
- Setup instruction completeness
- Recently updated scripts
- Scripts needing attention

### Shell Script Catalog
Similar catalog for shell scripts:

```bash
# Generate shell script catalog
npm run shell:catalog

# Watch mode
npm run shell:catalog:watch

# JSON format
npm run shell:catalog:json
```

## Batch Processing

### Refactor Batch Tool
Process multiple scripts systematically:

```bash
# Interactive mode
npm run refactor:batch

# Process specific service
npm run refactor:batch -- --service gmail

# Dry run (preview changes)
npm run refactor:batch -- --dry-run

# Process all scripts
npm run refactor:batch -- --all
```

Interactive options:
1. Process all scripts
2. Process by service
3. Process low documentation scores (<50%)
4. Process scripts without headers
5. Custom selection

## Git Integration

### Pre-commit Hook
Automatically runs linting on staged .gs files:
- Validates against style guide
- Blocks commit if errors exist
- Provides fix suggestions

### Post-commit Hook
Updates script catalog after commits:
- Detects changes to .gs files
- Regenerates catalog
- Reminds to commit catalog updates

### Disable/Enable Hooks
```bash
# Temporarily disable
git config --unset core.hooksPath

# Re-enable
npm run setup:git-hooks
```

## NPM Scripts Reference

### Linting
```bash
npm run lint:gas [file]      # Lint single file
npm run lint:all             # Lint all files
npm run lint:staged          # Lint git staged files
npm run lint:fix             # Auto-fix issues
```

### Formatting
```bash
npm run format [file]        # Basic format single file
npm run format:all           # Basic format all files
npm run format:smart [file]  # Smart format single file
npm run format:smart:all     # Smart format all files
```

### Catalogs
```bash
npm run catalog              # Generate GAS catalog
npm run catalog:watch        # Watch mode
npm run catalog:json         # JSON format
npm run shell:catalog        # Shell script catalog
npm run catalog:all          # Both catalogs
```

### Combined Operations
```bash
npm run gas:check            # Lint all + catalog
npm run gas:fix              # Format + lint fix + catalog
```

### Batch Processing
```bash
npm run refactor:batch       # Interactive batch refactor
```

## Style Guide Compliance

All tools enforce the standards defined in:
- `docs/standards/gas-style-guide.md`
- `docs/standards/coding-standards.md`

Key requirements:
- Complete script headers with metadata
- Comprehensive script summaries
- Function documentation
- Setup instructions (minimum 3 steps)
- Consistent formatting

## CI/CD Integration

GitHub Actions workflows:
- **gas-lint.yml**: Runs on PRs affecting .gs files
- **gas-catalog.yml**: Daily catalog updates
- **gas-format-check.yml**: Formatting validation

## Troubleshooting

### Common Issues

1. **Linting errors blocking commit**
   ```bash
   npm run lint:fix
   npm run format:smart [file]
   ```

2. **Catalog not updating**
   ```bash
   npm run catalog
   git add docs/SCRIPT_CATALOG.md
   git commit -m "Update script catalog"
   ```

3. **Hooks not running**
   ```bash
   npm run setup:git-hooks
   ```

## Best Practices

1. **Before committing:**
   - Run `npm run gas:check` to validate all scripts
   - Fix any linting errors
   - Update documentation if needed

2. **When adding new scripts:**
   - Use `npm run format:smart [file]` for intelligent headers
   - Complete any remaining TODOs
   - Test setup instructions

3. **Regular maintenance:**
   - Run `npm run catalog:all` weekly
   - Review scripts with low documentation scores
   - Update setup instructions as needed

## Contributing

When contributing new tools:
1. Follow the existing pattern in `automation/dev-tools/`
2. Add corresponding npm scripts
3. Update this documentation
4. Add tests if applicable

## Future Enhancements

Planned improvements:
- Visual Studio Code extension
- Web-based dashboard
- Automated documentation generation
- Integration with Google Cloud Build
- Performance profiling tools