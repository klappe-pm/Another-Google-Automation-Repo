# GitHub Commands Appendix - Organized by Task

## Table of Contents
1. [Repository Setup](#repository-setup)
2. [File Management](#file-management)
3. [Branch Operations](#branch-operations)
4. [Collaboration & Pull Requests](#collaboration--pull-requests)
5. [Status Management](#status-management)
6. [Automation & Deployment](#automation--deployment)
7. [Quality Assurance](#quality-assurance)
8. [Troubleshooting](#troubleshooting)

---

## Repository Setup

### Initial Repository Configuration
```bash
# Initialize new repository
git init
git remote add origin https://github.com/username/workspace-automation.git
git branch -M main

# First commit and push
git add .
git commit -m "🎉 Initial commit: Workspace Automation Suite"
git push -u origin main

# Verify setup
git remote -v
git status
git log --oneline
```

### Repository Information
```bash
# Check repository status
git status                    # Show working directory status
git log --oneline            # Show commit history
git remote -v                # Show remote repositories
git branch -a                # Show all branches
git config --list           # Show git configuration

# Repository statistics
git shortlog -sn             # Contributors by commit count
git rev-list --count HEAD    # Total number of commits
git ls-files | wc -l         # Total number of tracked files
```

### Authentication Setup
```bash
# Configure git identity
git config --global user.name "Kevin Lappe"
git config --global user.email "kevin@averageintelligence.ai"

# Setup SSH key (if needed)
ssh-keygen -t ed25519 -C "kevin@averageintelligence.ai"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Test SSH connection
ssh -T git@github.com
```

---

## File Management

### Adding and Committing Files
```bash
# Stage specific files
git add filename.js
git add scripts/gmail/
git add *.md

# Stage all changes
git add .
git add -A

# Commit with message
git commit -m "feat: Add new Gmail automation script"
git commit -m "docs: Update README with installation guide"
git commit -m "fix: Resolve authentication timeout issue"

# Commit with detailed message
git commit -m "feat: Implement deployment status system

- Add status management for idea/draft/beta/public
- Create automated deployment pipeline
- Update GitHub Actions workflows
- Add status dashboard in config/deployment-status.json

Closes #123"
```

### File Operations
```bash
# Remove files
git rm filename.js           # Remove file and stage deletion
git rm -r folder/            # Remove directory and contents
git rm --cached file.json    # Remove from tracking but keep locally

# Move/rename files
git mv oldname.js newname.js
git mv scripts/old-folder/ scripts/new-folder/

# Show file differences
git diff                     # Show unstaged changes
git diff --staged            # Show staged changes
git diff HEAD~1              # Compare with previous commit
git diff branch1..branch2    # Compare branches
```

### Handling Large Files
```bash
# Track file sizes
git ls-files | xargs du -h | sort -h

# Setup Git LFS for large files (if needed)
git lfs install
git lfs track "*.zip"
git lfs track "*.pdf"
git add .gitattributes
```

---

## Branch Operations

### Branch Management
```bash
# Create and switch branches
git checkout -b feature/gmail-bulk-export
git checkout -b fix/authentication-bug
git checkout -b docs/readme-update

# Switch between branches
git checkout main
git checkout feature/gmail-bulk-export
git switch main                # Alternative syntax

# List branches
git branch                   # Local branches
git branch -r                # Remote branches
git branch -a                # All branches
```

### Merging and Integration
```bash
# Merge feature branch to main
git checkout main
git merge feature/gmail-bulk-export

# Rebase feature branch
git checkout feature/gmail-bulk-export
git rebase main

# Squash commits before merge
git checkout main
git merge --squash feature/gmail-bulk-export
git commit -m "feat: Add Gmail bulk export functionality"

# Delete merged branches
git branch -d feature/gmail-bulk-export    # Local delete
git push origin --delete feature/gmail-bulk-export  # Remote delete
```

### Sync with Remote
```bash
# Fetch latest changes
git fetch origin
git fetch --all

# Pull latest changes
git pull origin main
git pull --rebase origin main

# Push changes
git push origin main
git push origin feature/new-feature
git push --set-upstream origin feature/new-feature

# Force push (use carefully)
git push --force-with-lease origin main
```

---

## Collaboration & Pull Requests

### Creating Pull Requests
```bash
# Push feature branch
git push origin feature/gmail-improvements

# Create PR using GitHub CLI
gh pr create --title "feat: Improve Gmail automation scripts" \
             --body "Enhanced error handling and added batch processing"

# List and manage PRs
gh pr list
gh pr view 123
gh pr checkout 123
gh pr merge 123
```

### Code Review Process
```bash
# Fetch PR for review
gh pr checkout 123
git log --oneline origin/main..HEAD

# Test changes locally
npm test
npm run lint
npm run security-scan

# Add review comments
gh pr review 123 --approve
gh pr review 123 --request-changes --body "Please add error handling"
```

### Collaborative Development
```bash
# Fork repository (using GitHub CLI)
gh repo fork original-owner/workspace-automation

# Add upstream remote
git remote add upstream https://github.com/original-owner/workspace-automation.git

# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Status Management

### Deployment Status Commands
```bash
# Check current project statuses
npm run status:check

# Set project status
npm run status:set gmail beta
npm run status:set drive public
npm run status:set calendar draft

# Promote project through pipeline
npm run status:promote gmail       # draft → beta → public
npm run status:demote drive        # public → beta → draft

# Bulk status operations
npm run status:set-all-beta
npm run status:promote-ready       # Promote all beta projects ready for production
```

### Status-Aware Git Operations
```bash
# Commit with status change
git add config/deployment-status.json
git commit -m "status: Promote Gmail scripts to production

- gmail-analysis-tools: beta → public
- gmail-export-suite: beta → public
- Ready for production deployment"

# Tag release with status
git tag -a v1.2.0 -m "Release v1.2.0: Gmail tools now public"
git push origin v1.2.0
```

### Environment Management
```bash
# Deploy to specific environments
npm run deploy:beta             # Deploy all beta-status projects
npm run deploy:production       # Deploy all public-status projects
npm run deploy:service gmail    # Deploy specific service

# Environment status check
npm run env:status
npm run env:health-check
```

---

## Automation & Deployment

### Automated Sync Commands
```bash
# Quick sync (automated commit and push)
./quick-sync.sh auto           # Automatic mode with generated message
./quick-sync.sh interactive    # Interactive mode with custom message
./quick-sync.sh push-safe      # Safe push with conflict resolution

# Manual sync operations
npm run git:sync-auto          # Automated git sync
npm run git:push-safe          # Safe push with retries
npm run git:pull-sync          # Pull and merge latest changes
```

### GitHub Actions Integration
```bash
# Trigger workflows manually
gh workflow run "Deploy to Google Apps Script"
gh workflow run "Daily Health Check"
gh workflow run "Security Scan"

# Check workflow status
gh workflow list
gh run list
gh run view 123456789

# Download workflow artifacts
gh run download 123456789
```

### Deployment Pipeline
```bash
# Full deployment workflow
npm run deploy:prepare         # Prepare for deployment
npm run deploy:validate        # Validate deployment readiness
npm run deploy:execute         # Execute deployment
npm run deploy:verify          # Verify successful deployment

# Rollback operations
npm run deploy:rollback        # Rollback to previous version
npm run deploy:rollback:tag v1.1.0  # Rollback to specific version
```

---

## Quality Assurance

### Automated Quality Checks
```bash
# Run all quality checks
npm run qa:full                # Complete quality assessment
npm run qa:quick               # Quick quality check
npm run qa:security            # Security vulnerability scan

# Specific quality checks
npm run lint                   # Code linting
npm run format                 # Code formatting
npm run security-scan          # Security analysis
npm run dependency-check       # Dependency audit
```

### Code Quality Git Hooks
```bash
# Setup git hooks
npm run setup:githooks

# Pre-commit hooks (automatically run)
# - Code formatting
# - Lint checking
# - Security scanning
# - Documentation validation

# Pre-push hooks (automatically run)
# - Full test suite
# - Security audit
# - Status validation
```

### Documentation Quality
```bash
# Documentation validation
npm run docs:validate          # Validate all documentation
npm run docs:generate          # Generate missing documentation
npm run docs:update            # Update outdated documentation

# Function inventory
npm run functions:scan         # Scan for all functions
npm run functions:document     # Generate function documentation
npm run functions:validate     # Validate function documentation
```

---

## Troubleshooting

### Common Issues Resolution
```bash
# Authentication problems
git config --global credential.helper store
git credential-manager delete

# Repository state issues
git status                     # Check current state
git stash                      # Temporarily save changes
git stash pop                  # Restore stashed changes
git reset --hard HEAD          # Reset to last commit (destructive)

# Remote sync issues
git fetch --prune              # Clean up deleted remote branches
git remote prune origin        # Remove stale remote references
git pull --rebase              # Rebase instead of merge on pull
```

### Conflict Resolution
```bash
# Handle merge conflicts
git status                     # Show conflicted files
git diff                       # Show conflict details
git add resolved-file.js       # Mark conflict as resolved
git commit -m "resolve: Fix merge conflicts in Gmail scripts"

# Abort merge if needed
git merge --abort
git rebase --abort
```

### Repository Maintenance
```bash
# Clean up repository
git gc                         # Garbage collection
git prune                      # Remove unreachable objects
git fsck                       # File system check

# Reset to clean state
git clean -fd                  # Remove untracked files and directories
git reset --hard HEAD          # Reset working directory
git pull origin main           # Get latest changes
```

### Emergency Recovery
```bash
# Recover deleted commits
git reflog                     # Show reference log
git checkout <commit-hash>     # Checkout specific commit
git cherry-pick <commit-hash>  # Apply specific commit

# Recover deleted files
git checkout HEAD~1 -- deleted-file.js
git reset HEAD~1               # Undo last commit (keep changes)
git reset --hard HEAD~1        # Undo last commit (lose changes)
```

---

## Advanced Operations

### Repository Analytics
```bash
# Contribution statistics
git shortlog -sn --since="1 month ago"
git log --author="Kevin Lappe" --oneline
git log --stat                 # Show files changed per commit

# Repository health metrics
npm run repo:review            # Comprehensive repository review
npm run repo:report            # Generate repository report
npm run repo:metrics           # Repository metrics and statistics
```

### Automated Reporting
```bash
# Generate reports
npm run report:daily           # Daily health report
npm run report:weekly          # Weekly analysis report
npm run report:security        # Security assessment report
npm run report:deployment      # Deployment status report

# Export reports
npm run report:export:json     # Export to JSON
npm run report:export:csv      # Export to CSV
npm run report:export:pdf      # Export to PDF
```

### Batch Operations
```bash
# Batch file operations
find scripts/ -name "*.gs" -exec git add {} \;
find scripts/ -name "*-legacy.gs" -exec git rm {} \;

# Batch commit operations
git add scripts/gmail/ && git commit -m "feat: Update Gmail scripts"
git add scripts/drive/ && git commit -m "feat: Update Drive scripts"
git add scripts/calendar/ && git commit -m "feat: Update Calendar scripts"

# Batch status management
npm run status:batch-update    # Update multiple project statuses
npm run status:batch-promote   # Promote ready projects
npm run status:batch-validate  # Validate all project statuses
```

---

## Quick Reference Commands

### Daily Development Workflow
```bash
# Start work
git pull origin main
git checkout -b feature/new-improvement

# During work
git add .
git commit -m "feat: Add new functionality"
git push origin feature/new-improvement

# End work
git checkout main
git merge feature/new-improvement
git push origin main
git branch -d feature/new-improvement
```

### Quick Status Check
```bash
# One-liner status check
git status && npm run status:check && npm run qa:quick
```

### Emergency Commands
```bash
# Quick backup
git stash push -m "Emergency backup $(date)"

# Quick sync
./quick-sync.sh auto

# Quick rollback
git reset --hard HEAD~1 && git push --force-with-lease origin main
```

---

**Created**: 2025-07-20  
**Repository**: AGAR (Another Google Automation Repository)  
**Total Commands**: 100+  
**Categories**: 8 major workflow areas  
**Skill Level**: Beginner to Advanced