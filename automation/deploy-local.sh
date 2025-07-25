#!/bin/bash
# Local Deployment Script - Workaround for Cloud Build Permission Issues
# This script deploys all Google Apps Script projects using local clasp

set -e

echo "🚀 Local Deployment Script"
echo "========================="
echo "Date: $(date)"
echo "Branch: $(git branch --show-current)"
echo ""

# Check if clasp is installed
if ! command -v clasp &> /dev/null; then
    echo "❌ clasp CLI not found. Installing..."
    npm install -g @google/clasp
fi

echo "✅ Using clasp version: $(clasp --version)"

# Check authentication
echo "🔐 Checking clasp authentication..."
# Try to list projects as authentication check
if ! clasp list > /dev/null 2>&1; then
    echo "❌ Not authenticated or no projects available. Please run: clasp login"
    echo "   If you are authenticated, this might mean you need to create a project first."
    # Continue anyway as individual projects might work
fi
echo "✅ Proceeding with deployment..."

# Deploy all projects
echo "📦 Deploying all Google Apps Script projects..."
echo ""

PROJECTS=(
    "calendar" "chat" "docs" "drive" "gmail" 
    "photos" "sheets" "slides" "tasks" "utility"
)

SUCCESS_COUNT=0
FAILED_COUNT=0
DEPLOYMENT_LOG=""

for project in "${PROJECTS[@]}"; do
    PROJECT_DIR="apps/$project"
    
    if [ -d "$PROJECT_DIR" ] && [ -f "$PROJECT_DIR/.clasp.json" ]; then
        echo -n "Deploying $project... "
        
        # Capture deployment output
        if OUTPUT=$(cd "$PROJECT_DIR" && clasp push --force 2>&1); then
            echo "✅ SUCCESS"
            ((SUCCESS_COUNT++))
            DEPLOYMENT_LOG="$DEPLOYMENT_LOG\n✅ $project: Deployed successfully"
        else
            echo "❌ FAILED"
            ((FAILED_COUNT++))
            DEPLOYMENT_LOG="$DEPLOYMENT_LOG\n❌ $project: Failed - $OUTPUT"
        fi
    else
        echo "⚠️  Skipping $project (missing directory or .clasp.json)"
        DEPLOYMENT_LOG="$DEPLOYMENT_LOG\n⚠️  $project: Skipped - missing configuration"
    fi
done

# Generate deployment report
echo ""
echo "================================================="
echo "📊 DEPLOYMENT SUMMARY"
echo "================================================="
echo "Total projects: ${#PROJECTS[@]}"
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAILED_COUNT"
echo ""
echo "Detailed Results:"
echo -e "$DEPLOYMENT_LOG"

# Create deployment timestamp file
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
echo "Deployment completed at: $TIMESTAMP" > "logs/deployment-$TIMESTAMP.log"
echo "Success: $SUCCESS_COUNT/${#PROJECTS[@]}" >> "logs/deployment-$TIMESTAMP.log"

if [ $SUCCESS_COUNT -eq ${#PROJECTS[@]} ]; then
    echo ""
    echo "🎉 ALL DEPLOYMENTS COMPLETED SUCCESSFULLY!"
    exit 0
else
    echo ""
    echo "⚠️  Some deployments failed. Check the logs above."
    exit 1
fi