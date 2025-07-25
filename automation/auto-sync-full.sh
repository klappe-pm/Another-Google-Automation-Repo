#!/bin/bash
# Full automation script: File watch → Git push → Apps Script deployment

# Configuration
WATCH_DIR="$(pwd)/apps"
COMMIT_DELAY=10
LAST_CHANGE_FILE="/tmp/workspace-automation-last-change"
LOG_FILE="logs/auto-sync.log"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to deploy to Google Apps Script
deploy_to_apps_script() {
    log "🚀 Starting Google Apps Script deployment..."
    
    # Run local deployment script
    if ./deploy-local.sh > /tmp/deploy-output.log 2>&1; then
        # Check if all projects deployed successfully
        if grep -q "ALL DEPLOYMENTS COMPLETED SUCCESSFULLY" /tmp/deploy-output.log; then
            log "✅ All Google Apps Script projects deployed successfully!"
            return 0
        else
            log "⚠️  Some deployments may have failed. Check logs."
            cat /tmp/deploy-output.log >> "$LOG_FILE"
            return 1
        fi
    else
        log "❌ Deployment failed!"
        cat /tmp/deploy-output.log >> "$LOG_FILE"
        return 1
    fi
}

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
        return
    fi
    
    # Check if there are actually changes to commit
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log "📝 Changes detected, processing..."
        
        # Add all changed files in apps directory
        git add apps/
        
        # Generate commit message
        CHANGED_FILES=$(git diff --cached --name-only | head -5 | sed 's/^/  - /')
        FILE_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')
        
        if [ $FILE_COUNT -gt 5 ]; then
            CHANGED_FILES="$CHANGED_FILES"$'\n'"  ... and $((FILE_COUNT - 5)) more files"
        fi
        
        # Extract service names from changed files
        SERVICES=$(git diff --cached --name-only | grep "^apps/" | cut -d'/' -f2 | sort -u | tr '\n' ', ' | sed 's/,$//')
        
        COMMIT_MSG="auto: update scripts in $SERVICES

Changed files:
$CHANGED_FILES

[auto-sync: save → commit → push → deploy]"
        
        # Commit changes
        if git commit -m "$COMMIT_MSG"; then
            log "✅ Changes committed"
            
            # Push to GitHub
            log "🔄 Pushing to GitHub..."
            if git push origin main; then
                log "✅ Successfully pushed to GitHub"
                
                # Deploy to Google Apps Script
                deploy_to_apps_script
                
                # Show summary
                echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo -e "${GREEN}✅ FULL SYNC COMPLETE${NC}"
                echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo "📁 Changed: $FILE_COUNT files in $SERVICES"
                echo "📤 Pushed to: GitHub (main branch)"
                echo "🚀 Deployed to: Google Apps Script"
                echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
            else
                log "❌ Push to GitHub failed"
            fi
        else
            log "❌ Commit failed"
        fi
    fi
}

# Main execution
clear
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🤖 WORKSPACE AUTOMATION - FULL SYNC MODE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📁 Watching: $WATCH_DIR"
echo "⏱️  Commit delay: $COMMIT_DELAY seconds"
echo "📝 Log file: $LOG_FILE"
echo ""
echo -e "${YELLOW}Workflow:${NC}"
echo "1. 💾 Save file → Detected by watcher"
echo "2. ⏱️  Wait $COMMIT_DELAY seconds"
echo "3. 📝 Auto-commit with descriptive message"
echo "4. 📤 Push to GitHub main branch"
echo "5. 🚀 Deploy to Google Apps Script"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

log "👀 Starting file watcher..."

# Watch for changes
fswatch -r -e ".*" -i "\\.gs$" -i "\\.json$" -i "\\.html$" -i "\\.js$" \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude "*.log" \
    "$WATCH_DIR" | while read file; do
    echo -e "${YELLOW}🔔 Change detected:${NC} ${file#$WATCH_DIR/}"
    handle_change &
done