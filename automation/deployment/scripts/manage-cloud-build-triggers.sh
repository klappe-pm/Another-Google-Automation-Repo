#!/bin/bash

# Script to identify and manage Cloud Build triggers
# Run this to diagnose and optionally disable the problematic trigger

echo "🔍 Cloud Build Trigger Analysis"
echo "================================"

PROJECT_ID="workspace-automation-466800"

echo "📋 Listing all Cloud Build triggers for project: $PROJECT_ID"
echo ""

# List all triggers with detailed information
gcloud builds triggers list \
  --project="$PROJECT_ID" \
  --format="table(
    name:label=TRIGGER_NAME,
    github.owner:label=REPO_OWNER,
    github.name:label=REPO_NAME,
    github.push.branch:label=BRANCH,
    filename:label=CONFIG_FILE,
    disabled:label=DISABLED,
    createTime:label=CREATED
  )"

echo ""
echo "🎯 Analysis:"
echo "Look for triggers that:"
echo "  - Target the 'main' branch"
echo "  - Have empty CONFIG_FILE (defaults to Docker)"
echo "  - Are NOT disabled"
echo ""

read -p "🤔 Do you want to disable the problematic trigger? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Please identify the trigger to disable from the list above."
    read -p "Enter the TRIGGER_NAME to disable: " TRIGGER_NAME
    
    if [ -n "$TRIGGER_NAME" ]; then
        echo "⚠️  About to disable trigger: $TRIGGER_NAME"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🔧 Disabling trigger: $TRIGGER_NAME"
            
            if gcloud builds triggers update "$TRIGGER_NAME" \
                --project="$PROJECT_ID" \
                --disabled; then
                echo "✅ Successfully disabled trigger: $TRIGGER_NAME"
                echo "🎉 Cloud Build will no longer auto-trigger on pushes"
                echo "💡 You can now rely on GitHub Actions for deployment"
            else
                echo "❌ Failed to disable trigger: $TRIGGER_NAME"
                exit 1
            fi
        else
            echo "❌ Operation cancelled"
        fi
    else
        echo "❌ No trigger name provided"
    fi
else
    echo "ℹ️  Keeping triggers as-is"
    echo "💡 Consider using the new cloudbuild.yaml for proper deployment"
fi

echo ""
echo "📚 Next Steps:"
echo "  1. If you disabled the trigger: Use GitHub Actions workflows"
echo "  2. If you kept the trigger: The new cloudbuild.yaml should work"
echo "  3. Test deployment with your preferred method"
echo ""
