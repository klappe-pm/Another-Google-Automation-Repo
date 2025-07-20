# Git Automation Tools

## 🚀 Automated Git Sync and Push Scripts

### Quick Usage

```bash
# Interactive mode (recommended for first use)
./quick-sync.sh

# Fully automated mode
./quick-sync.sh auto

# Using npm scripts
npm run git:quick-sync        # Interactive mode
npm run git:sync-auto         # Automated mode
npm run git:push-safe         # Safe push with auto-sync
```

## 📁 Scripts

### 1. `git-sync.sh` - Main Git Automation Script
**Full-featured git automation with intelligent conflict resolution**

**Features**:
- 🔍 Smart change detection and staging
- 📝 Automated commit message generation
- 🔄 Intelligent merge conflict resolution
- 🚀 Retry logic for network issues
- 🎯 Interactive and automated modes
- ✅ Comprehensive error handling

**Usage**:
```bash
./tools/git-sync.sh [mode] [commit-message]

# Modes:
interactive    # Interactive mode with prompts (default)
auto          # Fully automated mode
stage-only    # Only stage changes
commit-only   # Only create commit
sync-only     # Only sync with remote
push-only     # Only push to remote
```

### 2. `quick-sync.sh` - Simple Wrapper
**Easy-to-use wrapper for common operations**

```bash
./quick-sync.sh              # Interactive mode
./quick-sync.sh auto         # Automated mode
```

## 🎯 Common Scenarios

### Scenario 1: You Have Local Changes to Push
```bash
# Interactive mode - will walk you through each step
npm run git:sync

# Auto mode - handles everything automatically
npm run git:sync-auto
```

### Scenario 2: Remote Has Changes (Push Rejected)
```bash
# Safe push that handles remote changes
npm run git:push-safe
```

### Scenario 3: Merge Conflicts
The script will detect conflicts and offer options:
1. **Manual resolution** - Opens files in editor
2. **Keep local changes** - Use your version
3. **Keep remote changes** - Use remote version
4. **Abort merge** - Cancel operation

### Scenario 4: Just Stage Changes
```bash
./tools/git-sync.sh stage-only
```

## 🔧 Features

### Smart Commit Messages
The script automatically generates appropriate commit messages based on file changes:
- **Workflows**: `feat: Add/update GitHub Actions automation`
- **Tools**: `feat: Update repository management tools`
- **Scripts**: `feat: Update automation scripts`
- **Docs**: `docs: Update documentation`
- **Config**: `chore: Update configuration`

### Conflict Resolution Options
When merge conflicts occur:
1. **Interactive editor** - Edit files manually
2. **Keep yours** - Preserve local changes
3. **Keep theirs** - Accept remote changes
4. **Abort** - Cancel the operation

### Retry Logic
- Automatically retries failed operations up to 3 times
- Handles network timeouts and temporary issues
- Smart detection of different failure types

### Safety Features
- Shows what will be changed before committing
- Confirms actions in interactive mode
- Validates git repository status
- Backup and recovery options

## 📊 Output Example

```
🚀 Starting Git Sync and Push Automation
========================================
📋 Current branch: main
📋 Recent commits:
46f9f67 feat: Add enterprise-grade GitHub Actions automation
784edc8 feat: Add comprehensive repository management system

🔍 Detecting and staging changes...
✅ Changes staged

📝 Creating commit...
📋 Proposed commit message:
feat: Update repository management tools
2025-07-19 14:30:15 - Automated commit
- 3 files modified
- Repository sync and maintenance update

✅ Commit created successfully

🔄 Syncing with remote (attempt 1/3)...
✅ Successfully synced with remote

🚀 Pushing to remote (attempt 1/3)...
✅ Successfully pushed to remote

🎉 Git sync and push completed successfully!
```

## 🛠️ Troubleshooting

### Script Won't Run
```bash
# Make scripts executable
chmod +x tools/git-sync.sh
chmod +x quick-sync.sh
```

### Permission Errors
```bash
# Fix permissions for all scripts
find . -name "*.sh" -exec chmod +x {} \;
```

### Script Not Found
```bash
# Run from repository root
cd "/Users/kevinlappe/Documents/GitHub/Workspace Automation"
./quick-sync.sh
```

## 🎯 Best Practices

### For Regular Development
1. Use **interactive mode** for important changes
2. Use **auto mode** for routine updates
3. Always review the proposed commit message
4. Let the script handle merge conflicts when possible

### For Automation
1. Use **auto mode** in scripts and CI/CD
2. Set custom commit messages for specific operations
3. Use **push-safe** for reliable automated pushes

### For Teams
1. Use **interactive mode** for collaborative changes
2. Be careful with automatic conflict resolution
3. Review changes before pushing to shared branches

## 📋 Integration with Repository Tools

The git scripts work seamlessly with your repository management tools:

```bash
# Complete workflow: check, update, and push
npm run repo:review && npm run git:sync-auto

# Prepare release and push
npm run publication:prepare && npm run git:push-safe

# Quick daily maintenance
npm run git:quick-sync
```

---

**Created**: 2025-07-19  
**Repository**: AGAR (Another Google Automation Repository)  
**License**: MIT
