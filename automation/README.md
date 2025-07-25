# Automation Scripts

Shell scripts for deployment automation and file synchronization.

## Overview

This directory contains the core automation scripts that enable the CI/CD pipeline for Google Apps Script development. These scripts handle file watching, automatic commits, deployment, and process management.

## Scripts

| Script Name | Purpose | Usage |
|-------------|---------|-------|
| deploy-local.sh | Deploy all Apps Script projects | `./deploy-local.sh` |
| auto-sync-full.sh | File watcher with auto-deployment | Called by sync-control.sh |
| sync-control.sh | Process control for sync operations | `./sync-control.sh {start|stop|status}` |
| test-deployment.sh | Validate deployment configuration | `./test-deployment.sh` |
| auto-commit-push.sh | Auto-commit and push changes | Standalone auto-commit tool |

## Script Details

### deploy-local.sh

Deploys all 10 Google Apps Script projects using the local clasp CLI.

**Features:**
- Validates clasp authentication
- Deploys projects in sequence
- Provides detailed success/failure reporting
- Creates deployment timestamp logs

**Requirements:**
- clasp CLI installed (`npm install -g @google/clasp`)
- Authenticated with `clasp login`

### auto-sync-full.sh

Complete automation pipeline that watches for file changes and automatically commits, pushes, and deploys.

**Features:**
- Monitors file changes in apps/ directory
- 10-second debounce to batch changes
- Automatic commit with descriptive messages
- Push to GitHub main branch
- Trigger deployment after push

**Watched File Types:**
- `*.gs` - Google Apps Script files
- `*.json` - Configuration files
- `*.html` - HTML templates
- `*.js` - JavaScript files

### sync-control.sh

Process management script for controlling the auto-sync service.

**Commands:**
- `start` - Run sync in foreground
- `start-background` - Run sync as background process
- `stop` - Stop background sync
- `status` - Check sync status
- `logs` - View sync logs
- `test` - Make test change to verify sync

### test-deployment.sh

Pre-flight validation script that checks deployment readiness.

**Validates:**
- Google Cloud configuration
- Required configuration files
- Apps Script project configurations
- Cloud Build setup

## Usage Examples

### Start Development Session

```bash
# Start file watcher in foreground (recommended for active development)
./sync-control.sh start

# Or run in background
./sync-control.sh start-background

# Check status
./sync-control.sh status
```

### Manual Deployment

```bash
# Deploy all projects immediately
./deploy-local.sh
```

### Test Configuration

```bash
# Validate everything is configured correctly
./test-deployment.sh
```

## Configuration

### Environment Variables

Scripts use relative paths and auto-detect the working directory. No environment variables required.

### File Paths

- **Watch Directory**: `apps/`
- **Log File**: `auto-sync.log`
- **PID File**: `.sync-pid` (for background mode)

### Timing Configuration

- **Commit Delay**: 10 seconds after last change
- **No timeout**: Scripts run until manually stopped

## Troubleshooting

### Sync Not Detecting Changes

1. Verify you're editing files in `apps/` directory
2. Check file extension matches watch patterns
3. Confirm process is running: `./sync-control.sh status`

### Deployment Failures

1. Run `./test-deployment.sh` to validate configuration
2. Check `clasp login --status` for authentication
3. Review deployment logs for specific errors

### Background Process Issues

1. Check if PID file exists: `ls -la .sync-pid`
2. Verify process: `ps -p $(cat .sync-pid)`
3. Stop and restart: `./sync-control.sh stop && ./sync-control.sh start-background`

## Best Practices

1. **Use Foreground Mode** for active development to see real-time feedback
2. **Check Logs** regularly when using background mode
3. **Test Changes** with small edits first to verify pipeline
4. **Monitor Quotas** in Google Cloud Console for API limits

## Integration with CI/CD

These scripts integrate with:
- **GitHub Actions**: Alternative deployment pipeline
- **Cloud Build**: Production deployment (when Docker issues resolved)
- **Git Hooks**: Pre-commit validation (if configured)

---

Last Updated: July 2025