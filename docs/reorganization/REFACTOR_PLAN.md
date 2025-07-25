# Refactoring Plan - Post Reorganization

## Critical Issues

### 1. Cloud Build Configuration (HIGHEST PRIORITY)
**Problem**: Cloud Build expects `cloudbuild.yaml` in root directory
**Solution**: Create symlink in root pointing to `config/cloudbuild.yaml`
```bash
ln -s config/cloudbuild.yaml cloudbuild.yaml
```

## Files to Update

### 2. Architecture Documentation
**File**: `diagrams/ARCHITECTURE.md`
**Changes**: Update mermaid diagram paths
- `projects/calendar/` → `apps/calendar/`
- `projects/gmail/` → `apps/gmail/`
- `projects/drive/` → `apps/drive/`
- etc.

### 3. Log File Paths
**File**: `automation/auto-sync-full.sh`
**Line 8**: 
```bash
LOG_FILE="auto-sync.log"  →  LOG_FILE="logs/auto-sync.log"
```

**File**: `automation/deploy-local.sh`
**Lines 80-81**: Update to create logs in `logs/` directory
```bash
echo "Deployment completed at: $TIMESTAMP" > "logs/deployment-$TIMESTAMP.log"
```

### 4. Makefile Path
**File**: `Makefile`
**Line 49**: 
```bash
./unified_setup.sh  →  ./tools/shell-scripts/unified_setup.sh
```

### 5. Migration Tool
**File**: `tools/migrate-projects.js`
**Line 10**: 
```javascript
const projectsDir = path.join(__dirname, '../projects');  →  '../apps'
```

## Additional Considerations

### GitHub Actions
- Check `.github/workflows/` for any hardcoded paths
- Verify they use the correct paths or environment variables

### Documentation Updates
- Update any remaining references in documentation
- Ensure all READMEs have correct paths

## Execution Order
1. Fix Cloud Build (symlink) - IMMEDIATE
2. Update log paths in automation scripts
3. Fix Makefile path
4. Update architecture diagrams
5. Update migration tool
6. Review and test all changes