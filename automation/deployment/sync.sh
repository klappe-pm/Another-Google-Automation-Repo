#!/bin/bash
set -euo pipefail

# Git sync script - simplified version

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default values
AUTO_MODE=false
COMMIT_MSG=""

# Usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Sync repository with remote (pull, commit, push)

OPTIONS:
    -a, --auto          Auto mode (no prompts)
    -m, --message MSG   Commit message
    -h, --help          Show this help

EXAMPLES:
    $0                                  # Interactive sync
    $0 -a -m "Update documentation"    # Auto sync with message
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--auto)
            AUTO_MODE=true
            shift
            ;;
        -m|--message)
            COMMIT_MSG="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}Uncommitted changes found${NC}"
    git status -s
    
    if [[ "$AUTO_MODE" == false ]]; then
        read -p "Commit these changes? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Sync cancelled"
            exit 0
        fi
    fi
    
    # Get commit message if not provided
    if [[ -z "$COMMIT_MSG" ]]; then
        if [[ "$AUTO_MODE" == true ]]; then
            COMMIT_MSG="Auto-sync: $(date +'%Y-%m-%d %H:%M:%S')"
        else
            read -p "Enter commit message: " COMMIT_MSG
        fi
    fi
    
    # Commit changes
    git add -A
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✓ Changes committed${NC}"
fi

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes...${NC}"
if git pull --rebase origin main; then
    echo -e "${GREEN}✓ Successfully pulled latest changes${NC}"
else
    echo -e "${RED}✗ Failed to pull changes${NC}"
    echo "Please resolve conflicts and try again"
    exit 1
fi

# Push changes
echo -e "${YELLOW}Pushing to remote...${NC}"
if git push origin main; then
    echo -e "${GREEN}✓ Successfully pushed to remote${NC}"
else
    echo -e "${RED}✗ Failed to push changes${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Sync completed successfully!${NC}"