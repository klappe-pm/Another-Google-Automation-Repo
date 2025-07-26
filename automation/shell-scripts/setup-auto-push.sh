#!/bin/bash
# Setup script for automatic git push on file save

echo "🚀 Setting up automatic git push on file save"
echo "============================================"

# Check if fswatch is installed
if ! command -v fswatch &> /dev/null; then
    echo "📦 Installing fswatch..."
    if command -v brew &> /dev/null; then
        brew install fswatch
    else
        echo "❌ Homebrew not found. Please install fswatch manually:"
        echo "   brew install fswatch"
        exit 1
    fi
fi

# Create the auto-commit script
cat > auto-commit-push.sh << 'EOF'
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
EOF

chmod +x auto-commit-push.sh

# Create a git hook for pre-commit validation
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook to validate Google Apps Script files

echo "🔍 Validating Google Apps Script files..."

# Check for syntax errors in .gs files
for file in $(git diff --cached --name-only | grep "\.gs$"); do
    if [ -f "$file" ]; then
        # Basic syntax check - ensure file is not empty and has valid structure
        if [ ! -s "$file" ]; then
            echo "❌ Error: $file is empty"
            exit 1
        fi
        
        # Check for common syntax errors
        if grep -E "^\s*\}" "$file" | head -1 | grep -q "^\}"; then
            echo "⚠️  Warning: $file might have unmatched braces"
        fi
    fi
done

echo "✅ Validation passed"
exit 0
EOF

chmod +x .git/hooks/pre-commit

# Create systemd service for macOS launchd (optional, for background running)
cat > com.workspace-automation.watcher.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.workspace-automation.watcher</string>
    <key>ProgramArguments</key>
    <array>
        <string>$(pwd)/auto-commit-push.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$(pwd)</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$(pwd)/auto-commit.log</string>
    <key>StandardErrorPath</key>
    <string>$(pwd)/auto-commit-error.log</string>
</dict>
</plist>
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run the watcher manually:"
echo "   ./auto-commit-push.sh"
echo ""
echo "2. Or install as a background service (optional):"
echo "   launchctl load com.workspace-automation.watcher.plist"
echo ""
echo "3. To stop the background service:"
echo "   launchctl unload com.workspace-automation.watcher.plist"
echo ""
echo "⚠️  Note: The watcher will:"
echo "   - Monitor all .gs, .json, .html, and .js files in projects/"
echo "   - Wait 10 seconds after the last change before committing"
echo "   - Automatically push to GitHub main branch"
echo "   - Include changed file list in commit messages"