#!/usr/bin/env bash
set -euo pipefail
GCLOUD_PROJECT_ID="workspace-automation-466800"

# --- Create Secrets First ---
echo "--- Creating placeholder secrets ---"
gcloud secrets create "clasp-credentials" --replication-policy="automatic" --description="Stores .clasprc.json" --project="${GCLOUD_PROJECT_ID}" || echo "Secret 'clasp-credentials' already exists."
echo '{}' > /tmp/dev-mapping.json
echo '{}' > /tmp/prod-mapping.json
gcloud secrets create "project-mapping-dev" --data-file=/tmp/dev-mapping.json --project="${GCLOUD_PROJECT_ID}" || echo "Secret 'project-mapping-dev' already exists."
gcloud secrets create "project-mapping-prod" --data-file=/tmp/prod-mapping.json --project="${GCLOUD_PROJECT_ID}" || echo "Secret 'project-mapping-prod' already exists."

# --- Authenticate with clasp ---
echo "--- Authenticating with clasp ---"
echo "A browser window will open to authenticate clasp. Please follow the instructions."
clasp login
read -r -p "Press [Enter] key after you have successfully logged in..."

# --- Add clasp credentials to Secret Manager ---
echo "--- Adding clasp credentials to Secret Manager ---"
if [ -f ~/.clasprc.json ]; then
    gcloud secrets versions add "clasp-credentials" --data-file=~/.clasprc.json --project="${GCLOUD_PROJECT_ID}"
else
    echo "ERROR: ~/.clasprc.json not found. Login may have failed."
    exit 1
fi

# --- Create Apps Script Projects ---
echo "--- Creating all 16 Apps Script projects ---"
SERVICES=("calendar" "chat" "docs" "drive" "gmail" "sheets" "tasks" "slides")
DEV_MAPPING_FILE="/tmp/dev-project-mapping.json"
PROD_MAPPING_FILE="/tmp/prod-project-mapping.json"
echo '{"projects":{}}' > $DEV_MAPPING_FILE
PROJECT_MAPPING_FILE="project-mapping.json"
echo '{"projects":{}}' > $PROJECT_MAPPING_FILE
echo '{"projects":{}}' > $PROD_MAPPING_FILE

# Store the original directory
ORIGINAL_DIR=$(pwd)

for service in "${SERVICES[@]}"; do
    # Correct way to capitalize first letter in bash
    SERVICE_CAPITALIZED="$(tr '[:lower:]' '[:upper:]' <<<"${service:0:1}")${service:1}"

    # Create Dev Project
    temp_dir_dev=$(mktemp -d)
    cd "$temp_dir_dev"
    clasp create --type standalone --title "${SERVICE_CAPITALIZED} Automation - Dev"
    DEV_SCRIPT_ID=$(grep 'scriptId' .clasp.json | cut -d'"' -f4)
    jq --arg s "$service" --arg id "$DEV_SCRIPT_ID" --arg name "${SERVICE_CAPITALIZED} Automation - Dev" '.projects[$s] = {"scriptId": $id, "name": $name}' $DEV_MAPPING_FILE > tmp.$$.json && mv tmp.$$.json $DEV_MAPPING_FILE

    # Create Prod Project
    temp_dir_prod=$(mktemp -d)
    cd "$temp_dir_prod"
    clasp create --type standalone --title "${SERVICE_CAPITALIZED} Automation - Prod"
    PROD_SCRIPT_ID=$(grep 'scriptId' .clasp.json | cut -d'"' -f4)
    jq --arg s "$service" --arg id "$PROD_SCRIPT_ID" --arg name "${SERVICE_CAPITALIZED} Automation - Prod" '.projects[$s] = {"scriptId": $id, "name": $name}' $PROD_MAPPING_FILE > tmp.$$.json && mv tmp.$$.json $PROD_MAPPING_FILE
done

# Navigate back to original directory
cd "$ORIGINAL_DIR"

# Merge dev and prod mappings into a single project-mapping.json
jq -s '.[0] * .[1]' $DEV_MAPPING_FILE $PROD_MAPPING_FILE > "$PROJECT_MAPPING_FILE"

# --- Create .clasp.json files for each service directory ---
echo "--- Creating .clasp.json files for each service directory ---"
for service in "${SERVICES[@]}"; do
    SERVICE_DIR="$service"
    if [ -d "$SERVICE_DIR" ]; then
        DEV_SCRIPT_ID=$(jq -r ".projects.\"$service\".scriptId" "$DEV_MAPPING_FILE")
        cat > "$SERVICE_DIR/.clasp.json" << EOF
{
  "scriptId": "$DEV_SCRIPT_ID",
  "rootDir": "."
}
EOF
        echo "Created .clasp.json for $service with scriptId: $DEV_SCRIPT_ID"
    else
        echo "Warning: Service directory '$SERVICE_DIR' does not exist"
    fi
done

echo "--- Updating project mapping secrets ---"
gcloud secrets versions add "project-mapping-dev" --data-file="$DEV_MAPPING_FILE" --project="${GCLOUD_PROJECT_ID}"
gcloud secrets versions add "project-mapping-prod" --data-file="$PROD_MAPPING_FILE" --project="${GCLOUD_PROJECT_ID}"

echo "✅ All Apps Script projects created and mappings stored securely."
