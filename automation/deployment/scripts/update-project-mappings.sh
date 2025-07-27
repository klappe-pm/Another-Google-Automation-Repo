#!/usr/bin/env bash
# ==============================================================================
# Update Project Mappings Script
#
# This script updates the Secret Manager with Apps Script project mappings
# after manual project creation.
# ==============================================================================

set -euo pipefail

GCLOUD_PROJECT_ID="workspace-automation-466800"
SERVICES=("calendar" "chat" "docs" "drive" "gmail" "sheets" "tasks" "slides")
DEV_MAPPING_FILE="/tmp/dev-project-mapping.json"
PROD_MAPPING_FILE="/tmp/prod-project-mapping.json"

echo "🔍 Scanning for Apps Script projects..."

# Initialize mapping files
echo '{"projects":{}}' > $DEV_MAPPING_FILE
echo '{"projects":{}}' > $PROD_MAPPING_FILE

# Get all Apps Script projects
clasp list --json > /tmp/clasp_projects.json

echo "📋 Found projects:"
cat /tmp/clasp_projects.json | jq -r '.[] | "\(.name) - \(.scriptId)"'

echo ""
echo "🔄 Mapping projects to services..."

for service in "${SERVICES[@]}"; do
    SERVICE_CAPITALIZED="$(tr '[:lower:]' '[:upper:]' <<<"${service:0:1}")${service:1}"
    
    # Look for Dev project
    DEV_SCRIPT_ID=$(cat /tmp/clasp_projects.json | jq -r --arg name "${SERVICE_CAPITALIZED} Automation - Dev" '.[] | select(.name == $name) | .scriptId' | head -1)
    if [ "$DEV_SCRIPT_ID" != "null" ] && [ -n "$DEV_SCRIPT_ID" ]; then
        echo "✅ Found Dev project for $service: $DEV_SCRIPT_ID"
        jq --arg s "$service" --arg id "$DEV_SCRIPT_ID" --arg name "${SERVICE_CAPITALIZED} Automation - Dev" '.projects[$s] = {"scriptId": $id, "name": $name}' $DEV_MAPPING_FILE > tmp.$$.json && mv tmp.$$.json $DEV_MAPPING_FILE
    else
        echo "❌ Dev project for $service not found"
    fi
    
    # Look for Prod project
    PROD_SCRIPT_ID=$(cat /tmp/clasp_projects.json | jq -r --arg name "${SERVICE_CAPITALIZED} Automation - Prod" '.[] | select(.name == $name) | .scriptId' | head -1)
    if [ "$PROD_SCRIPT_ID" != "null" ] && [ -n "$PROD_SCRIPT_ID" ]; then
        echo "✅ Found Prod project for $service: $PROD_SCRIPT_ID"
        jq --arg s "$service" --arg id "$PROD_SCRIPT_ID" --arg name "${SERVICE_CAPITALIZED} Automation - Prod" '.projects[$s] = {"scriptId": $id, "name": $name}' $PROD_MAPPING_FILE > tmp.$$.json && mv tmp.$$.json $PROD_MAPPING_FILE
    else
        echo "❌ Prod project for $service not found"
    fi
done

echo ""
echo "📤 Updating Secret Manager..."

# Update secrets
gcloud secrets versions add "project-mapping-dev" --data-file="$DEV_MAPPING_FILE" --project="$GCLOUD_PROJECT_ID"
gcloud secrets versions add "project-mapping-prod" --data-file="$PROD_MAPPING_FILE" --project="$GCLOUD_PROJECT_ID"

echo ""
echo "📋 Final mappings:"
echo "Dev projects:"
cat $DEV_MAPPING_FILE | jq '.'
echo ""
echo "Prod projects:"
cat $PROD_MAPPING_FILE | jq '.'

echo ""
echo "✅ Project mappings updated successfully!"
