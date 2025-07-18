#!/bin/bash

# Quick GitHub Actions Setup for Auto-Sync
# Run this after IDE setup to enable automatic deployment

echo "🔧 Setting up GitHub Actions for automatic deployment..."

# Check if clasp is authenticated
if ! clasp login --status > /dev/null 2>&1; then
    echo "❌ clasp not authenticated. Please run 'clasp login' first."
    exit 1
fi

echo "✅ clasp is authenticated"

# Get clasp credentials for GitHub Actions
echo "📋 Your clasp token for GitHub Actions:"
echo "Copy this content and add it as a secret named 'CLASP_TOKEN' in your GitHub repository:"
echo ""
echo "Repository Settings → Secrets and variables → Actions → New repository secret"
echo "Name: CLASP_TOKEN"
echo "Value:"
echo "=================================="
cat ~/.clasprc.json
echo "=================================="
echo ""

# Check if GitHub Actions workflow exists
if [ -f .github/workflows/deploy-with-status.yml ]; then
    echo "✅ GitHub Actions workflow already configured"
else
    echo "⚠️  GitHub Actions workflow not found"
    echo "Your repository should have .github/workflows/deploy-with-status.yml"
fi

# Test the setup
echo "🧪 Testing setup..."
echo "Current deployment status:"
npm run status

echo ""
echo "🎯 To complete auto-sync setup:"
echo "1. Copy the clasp token above to GitHub repository secrets"
echo "2. Make a small change to any .gs file"
echo "3. Commit and push to GitHub"
echo "4. Check the Actions tab in GitHub to see automatic deployment"
echo ""
echo "✨ After setup, every git push will automatically deploy to Google Apps Script!"
