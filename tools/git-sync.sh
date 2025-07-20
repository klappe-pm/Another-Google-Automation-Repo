#!/bin/bash

/**
 * Git Sync and Push Automation Script
 * 
 * Title: Automated Git Sync, Merge, and Push Handler
 * Purpose: Handle repeated git sync, merge conflicts, and push operations
 * Created: 2025-07-19
 * Updated: 2025-07-19
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Version: 1.0.0
 */

# Configuration
BRANCH="main"
REMOTE="origin"
MAX_RETRIES=3
REPO_DIR="/Users/kevinlappe/Documents/GitHub/Workspace Automation"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌${NC} $1"
}

info() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')] 📋${NC} $1"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not a git repository. Please run this script from the repository root."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "scripts" ]; then
        warning "This doesn't look like the workspace-automation repository."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Display current git status
show_status() {
    log "Current git status:"
    echo "----------------------------------------"
    git status --porcelain | head -20
    echo "----------------------------------------"
    
    # Show current branch
    current_branch=$(git branch --show-current)
    info "Current branch: $current_branch"
    
    # Show last few commits
    info "Recent commits:"
    git log --oneline -5
    echo "----------------------------------------"
}

# Stage changes with smart detection
stage_changes() {
    log "🔍 Detecting and staging changes..."
    
    # Check if there are any changes to stage
    if git diff --quiet && git diff --cached --quiet; then
        info "No changes to stage"
        return 0
    fi
    
    # Show what will be staged
    info "Files to be staged:"
    git status --porcelain | while read status file; do
        echo "  $status $file"
    done
    
    # Ask for confirmation unless auto mode
    if [ "$AUTO_MODE" != "true" ]; then
        echo
        read -p "Stage all changes? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            log "Selective staging mode..."
            git add -i
        else
            git add .
        fi
    else
        git add .
    fi
    
    success "Changes staged"
}

# Create commit with smart message generation
create_commit() {
    log "📝 Creating commit..."
    
    # Check if there are staged changes
    if git diff --cached --quiet; then
        info "No staged changes to commit"
        return 0
    fi
    
    # Show staged changes
    info "Staged changes:"
    git diff --cached --name-status
    
    # Generate smart commit message if not provided
    if [ -z "$COMMIT_MESSAGE" ]; then
        # Detect type of changes
        local has_workflows=$(git diff --cached --name-only | grep -q "\.github/workflows" && echo "true" || echo "false")
        local has_tools=$(git diff --cached --name-only | grep -q "tools/" && echo "true" || echo "false")
        local has_scripts=$(git diff --cached --name-only | grep -q "scripts/" && echo "true" || echo "false")
        local has_docs=$(git diff --cached --name-only | grep -q "README\|\.md" && echo "true" || echo "false")
        local has_config=$(git diff --cached --name-only | grep -q "package\.json\|\.yml\|\.yaml" && echo "true" || echo "false")
        
        # Generate commit type and message
        local commit_type="feat"
        local commit_desc="Repository updates"
        
        if [ "$has_workflows" = "true" ]; then
            commit_type="feat"
            commit_desc="Add/update GitHub Actions automation"
        elif [ "$has_tools" = "true" ]; then
            commit_type="feat"
            commit_desc="Update repository management tools"
        elif [ "$has_scripts" = "true" ]; then
            commit_type="feat"
            commit_desc="Update automation scripts"
        elif [ "$has_docs" = "true" ]; then
            commit_type="docs"
            commit_desc="Update documentation"
        elif [ "$has_config" = "true" ]; then
            commit_type="chore"
            commit_desc="Update configuration"
        fi
        
        COMMIT_MESSAGE="$commit_type: $commit_desc

$(date '+%Y-%m-%d %H:%M:%S') - Automated commit
- $(git diff --cached --name-only | wc -l | xargs) files modified
- Repository sync and maintenance update"
    fi
    
    # Show proposed commit message
    info "Proposed commit message:"
    echo "----------------------------------------"
    echo "$COMMIT_MESSAGE"
    echo "----------------------------------------"
    
    # Ask for confirmation unless auto mode
    if [ "$AUTO_MODE" != "true" ]; then
        echo
        read -p "Use this commit message? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            read -p "Enter custom commit message: " CUSTOM_MESSAGE
            COMMIT_MESSAGE="$CUSTOM_MESSAGE"
        fi
    fi
    
    # Create commit
    if git commit -m "$COMMIT_MESSAGE"; then
        success "Commit created successfully"
        return 0
    else
        error "Failed to create commit"
        return 1
    fi
}

# Handle merge conflicts interactively
handle_merge_conflicts() {
    log "🔧 Handling merge conflicts..."
    
    # List conflicted files
    local conflicted_files=$(git diff --name-only --diff-filter=U)
    
    if [ -z "$conflicted_files" ]; then
        success "No merge conflicts to resolve"
        return 0
    fi
    
    error "Merge conflicts detected in the following files:"
    echo "$conflicted_files" | while read file; do
        echo "  📄 $file"
    done
    
    echo
    info "Conflict resolution options:"
    echo "1. Open files in editor to resolve manually"
    echo "2. Keep local changes (use ours)"
    echo "3. Keep remote changes (use theirs)"
    echo "4. Abort merge and exit"
    
    read -p "Choose option (1-4): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            log "Opening files for manual resolution..."
            echo "$conflicted_files" | while read file; do
                info "Opening $file..."
                # Try different editors
                if command -v code > /dev/null; then
                    code "$file"
                elif command -v nano > /dev/null; then
                    nano "$file"
                elif command -v vim > /dev/null; then
                    vim "$file"
                else
                    warning "No suitable editor found. Please edit $file manually."
                fi
            done
            
            echo
            read -p "Press Enter after resolving all conflicts..."
            
            # Mark files as resolved
            echo "$conflicted_files" | while read file; do
                git add "$file"
            done
            ;;
        2)
            log "Keeping local changes..."
            echo "$conflicted_files" | while read file; do
                git checkout --ours "$file"
                git add "$file"
            done
            ;;
        3)
            log "Keeping remote changes..."
            echo "$conflicted_files" | while read file; do
                git checkout --theirs "$file"
                git add "$file"
            done
            ;;
        4)
            warning "Aborting merge..."
            git merge --abort
            exit 1
            ;;
        *)
            error "Invalid option"
            return 1
            ;;
    esac
    
    # Complete the merge
    if git commit --no-edit; then
        success "Merge conflicts resolved and committed"
        return 0
    else
        error "Failed to complete merge"
        return 1
    fi
}

# Sync with remote repository
sync_with_remote() {
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log "🔄 Syncing with remote (attempt $((retry_count + 1))/$MAX_RETRIES)..."
        
        # Fetch latest changes
        log "Fetching remote changes..."
        if ! git fetch $REMOTE; then
            error "Failed to fetch from remote"
            ((retry_count++))
            continue
        fi
        
        # Check if remote has new commits
        local behind=$(git rev-list --count HEAD..$REMOTE/$BRANCH)
        local ahead=$(git rev-list --count $REMOTE/$BRANCH..HEAD)
        
        info "Repository status: $ahead ahead, $behind behind"
        
        if [ "$behind" -eq 0 ]; then
            success "Repository is up to date with remote"
            return 0
        fi
        
        # Pull remote changes
        log "Pulling remote changes..."
        if git pull $REMOTE $BRANCH; then
            success "Successfully synced with remote"
            return 0
        else
            warning "Pull failed, likely due to merge conflicts"
            
            # Handle merge conflicts
            if ! handle_merge_conflicts; then
                error "Failed to resolve merge conflicts"
                ((retry_count++))
                continue
            fi
            
            success "Sync completed with conflict resolution"
            return 0
        fi
    done
    
    error "Failed to sync after $MAX_RETRIES attempts"
    return 1
}

# Push changes to remote
push_to_remote() {
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log "🚀 Pushing to remote (attempt $((retry_count + 1))/$MAX_RETRIES)..."
        
        if git push $REMOTE $BRANCH; then
            success "Successfully pushed to remote"
            return 0
        else
            warning "Push failed, likely due to new remote changes"
            
            # Sync again and retry
            if sync_with_remote; then
                info "Retrying push after sync..."
                ((retry_count++))
                continue
            else
                error "Failed to sync before retry"
                return 1
            fi
        fi
    done
    
    error "Failed to push after $MAX_RETRIES attempts"
    return 1
}

# Main workflow
main() {
    log "🚀 Starting Git Sync and Push Automation"
    echo "========================================"
    
    # Check environment
    check_git_repo
    
    # Show current status
    show_status
    
    # Handle command line arguments
    case "${1:-interactive}" in
        "auto")
            AUTO_MODE="true"
            COMMIT_MESSAGE="${2:-Automated repository sync and update}"
            log "🤖 Running in AUTO mode"
            ;;
        "stage-only")
            stage_changes
            success "Staging complete. Run script again to commit and push."
            exit 0
            ;;
        "commit-only")
            create_commit
            success "Commit complete. Run script again to sync and push."
            exit 0
            ;;
        "sync-only")
            sync_with_remote
            success "Sync complete. Run script again to push changes."
            exit 0
            ;;
        "push-only")
            push_to_remote
            exit $?
            ;;
        "interactive"|*)
            AUTO_MODE="false"
            log "🎯 Running in INTERACTIVE mode"
            ;;
    esac
    
    # Main workflow steps
    echo
    log "Step 1: Stage changes"
    if ! stage_changes; then
        error "Failed to stage changes"
        exit 1
    fi
    
    echo
    log "Step 2: Create commit"
    if ! create_commit; then
        error "Failed to create commit"
        exit 1
    fi
    
    echo
    log "Step 3: Sync with remote"
    if ! sync_with_remote; then
        error "Failed to sync with remote"
        exit 1
    fi
    
    echo
    log "Step 4: Push to remote"
    if ! push_to_remote; then
        error "Failed to push to remote"
        exit 1
    fi
    
    echo
    success "🎉 Git sync and push completed successfully!"
    
    # Show final status
    echo
    info "Final repository status:"
    git log --oneline -3
    
    # Show GitHub Actions link
    if grep -q "github.com" .git/config 2>/dev/null; then
        local repo_url=$(git config --get remote.origin.url | sed 's/\.git$//')
        info "🔗 Check GitHub Actions: ${repo_url}/actions"
    fi
}

# Help function
show_help() {
    cat << EOF
Git Sync and Push Automation Script

USAGE:
    $0 [mode] [commit-message]

MODES:
    interactive    Interactive mode with prompts (default)
    auto          Fully automated mode with default commit message
    stage-only    Only stage changes, don't commit or push
    commit-only   Only create commit, don't sync or push
    sync-only     Only sync with remote, don't push
    push-only     Only push to remote (assumes local commits exist)

EXAMPLES:
    $0                                          # Interactive mode
    $0 auto                                     # Auto mode with default message
    $0 auto "Custom commit message"             # Auto mode with custom message
    $0 stage-only                               # Just stage changes
    $0 sync-only                                # Just sync with remote

FEATURES:
    ✅ Smart change detection and staging
    ✅ Automated commit message generation
    ✅ Intelligent merge conflict resolution
    ✅ Retry logic for network issues
    ✅ Interactive and automated modes
    ✅ Comprehensive error handling
    ✅ Colored output and progress tracking

AUTHOR: Kevin Lappe <kevin@averageintelligence.ai>
LICENSE: MIT
EOF
}

# Handle script arguments
case "${1:-}" in
    "-h"|"--help"|"help")
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
