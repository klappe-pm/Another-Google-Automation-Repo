#!/bin/bash

# Quick Git Sync - Simple wrapper for the main git-sync script
# Just run: ./quick-sync.sh

cd "/Users/kevinlappe/Documents/GitHub/Workspace Automation"

# Auto-detect the type of operation needed and run accordingly
if [ "$1" = "auto" ]; then
    echo "🤖 Running automated git sync..."
    ./tools/git-sync.sh auto "Automated repository sync - $(date '+%Y-%m-%d %H:%M')"
elif [ "$1" = "interactive" ] || [ -z "$1" ]; then
    echo "🎯 Running interactive git sync..."
    ./tools/git-sync.sh interactive
else
    # Pass through any other arguments
    ./tools/git-sync.sh "$@"
fi
