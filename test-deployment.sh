#!/bin/bash
# Test Deployment Script - Milestone 1 Pipeline Validation
# This script verifies the deployment pipeline configuration

set -e

echo "🔍 Deployment Pre-flight Check"
echo "=============================="
echo "Date: $(date)"
echo "Branch: $(git branch --show-current)"
echo ""

# Check Google Cloud configuration
echo "1. Checking Google Cloud Configuration..."
if command -v gcloud &> /dev/null; then
    echo "✅ gcloud CLI found"
    echo "   Project: $(gcloud config get-value project 2>/dev/null || echo 'Not set')"
    echo "   Account: $(gcloud config get-value account 2>/dev/null || echo 'Not set')"
else
    echo "❌ gcloud CLI not found"
    exit 1
fi
echo ""

# Check for required files
echo "2. Checking Required Files..."
REQUIRED_FILES=(
    "cloudbuild.yaml"
    "project-mapping.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found: $file"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done
echo ""

# Validate .clasp.json files
echo "3. Validating Apps Script Project Configuration..."
PROJECTS=(
    "calendar" "chat" "docs" "drive" "gmail" 
    "photos" "sheets" "slides" "tasks" "utility"
)

VALID_COUNT=0
for project in "${PROJECTS[@]}"; do
    clasp_file="projects/$project/.clasp.json"
    if [ -f "$clasp_file" ]; then
        # Check if it's valid JSON
        if python3 -m json.tool "$clasp_file" > /dev/null 2>&1; then
            script_id=$(python3 -c "import json; print(json.load(open('$clasp_file'))['scriptId'])" 2>/dev/null)
            if [ -n "$script_id" ]; then
                echo "✅ $project: $script_id"
                ((VALID_COUNT++))
            else
                echo "❌ $project: No scriptId found"
            fi
        else
            echo "❌ $project: Invalid JSON in .clasp.json"
        fi
    else
        echo "❌ $project: Missing .clasp.json"
    fi
done
echo "   Valid projects: $VALID_COUNT/10"
echo ""

# Check Cloud Build configuration
echo "4. Validating Cloud Build Configuration..."
if [ -f "cloudbuild.yaml" ]; then
    # Check for custom image reference
    if grep -q "clasp-builder/clasp-builder:latest" cloudbuild.yaml; then
        echo "✅ Custom Docker image configured"
    else
        echo "⚠️  Custom Docker image not found in cloudbuild.yaml"
    fi
    
    # Check for all project directories
    missing_in_config=0
    for project in "${PROJECTS[@]}"; do
        if ! grep -q "projects/$project" cloudbuild.yaml; then
            echo "⚠️  Project '$project' not found in cloudbuild.yaml"
            ((missing_in_config++))
        fi
    done
    
    if [ $missing_in_config -eq 0 ]; then
        echo "✅ All projects referenced in cloudbuild.yaml"
    fi
fi
echo ""

# Summary
echo "=============================="
echo "📊 Pre-flight Check Summary"
echo "=============================="
if [ $VALID_COUNT -eq 10 ]; then
    echo "✅ All 10 projects configured correctly"
    echo ""
    echo "Ready to deploy? Run:"
    echo "  gcloud builds submit --config=cloudbuild.yaml --project=workspace-automation-466800"
else
    echo "❌ Configuration issues found. Please fix before deploying."
    exit 1
fi