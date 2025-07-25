#!/bin/bash
# Auto-commit and push script for Google Apps Script files

# Configuration
WATCH_DIR="$(pwd)/projects"
COMMIT_DELAY=10  # Wait 10 seconds after last change before committing
LAST_CHANGE_FILE="/tmp/workspace-automation-last-change"

# Function to handle file changes
handle_change() {
    # Update last change timestamp
    date +%s > "$LAST_CHANGE_FILE"
    
    # Wait for changes to settle
    sleep $COMMIT_DELAY
    
    # Check if this is still the most recent change
    LAST_CHANGE=$(cat "$LAST_CHANGE_FILE" 2>/dev/null || echo 0)
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_CHANGE))
    
    if [ $TIME_DIFF -lt $COMMIT_DELAY ]; then
        # Another change occurred, skip this commit
        return
    fi
    
    # Check if there are actually changes to commit
    if ! git diff --quiet || ! git diff --cached --quiet; then
        echo "📝 Changes detected, auto-committing..."
        
        # Add all changed files in projects directory
        git add projects/
        
        # Generate commit message with changed files
        CHANGED_FILES=$(git diff --cached --name-only | head -5 | sed 's/^/  - /')
        FILE_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')
        
        if [ $FILE_COUNT -gt 5 ]; then
            CHANGED_FILES="$CHANGED_FILES"$'\n'"  ... and $((FILE_COUNT - 5)) more files"
        fi
        
        COMMIT_MSG="auto: update scripts ($(date '+%Y-%m-%d %H:%M:%S'))

Changed files:
$CHANGED_FILES

[auto-commit on save]"
        
        # Commit changes
        git commit -m "$COMMIT_MSG"
        
        # Push to remote
        echo "🔄 Pushing to GitHub..."
        if git push origin main; then
            echo "✅ Successfully pushed to GitHub"
            echo "⏳ Waiting for GitHub Actions to deploy to Google Apps Script..."
        else
            echo "❌ Push failed. Changes are committed locally."
        fi
    fi
}

echo "👀 Watching for changes in: $WATCH_DIR"
echo "⏱️  Will auto-commit $COMMIT_DELAY seconds after last change"
echo "🛑 Press Ctrl+C to stop"
echo ""

# Watch for changes in .gs, .gs, .json, and .html files
fswatch -r -e ".*" -i "\\.gs$" -i "\\.json$" -i "\\.html$" -i "\\.js$" \
    --exclude ".git" \
    --exclude "node_modules" \
    "$WATCH_DIR" | while read file; do
    echo "🔔 Change detected: $file"
    handle_change &
done
