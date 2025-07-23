#!/usr/bin/env bash
# ==============================================================================
# Unified Local Setup Script for Workspace Automation (v3 - Final)
#
# This version is the most resilient, with explicit checks for existing
# resources and a delay to prevent GCP race conditions.
# ==============================================================================

set -euo pipefail # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
GCLOUD_PROJECT_ID="workspace-automation-466800"
# BILLING_ACCOUNT="01ED0F-C268E6-386D25"  # Reserved for future use
GITHUB_OWNER="klappe-pm"
ADMIN_EMAIL="kevin.lappe@gmail.com"
GITHUB_REPO_NAME="Another-Google-Automation-Repo"

# Add error trap for better debugging
trap 'echo "Error: $BASH_SOURCE:$LINENO"; exit 1' ERR

echo "### Phase 1: Configuring GCP Project: ${GCLOUD_PROJECT_ID} ###"
gcloud config set project "${GCLOUD_PROJECT_ID}"

# --- Step 1.1: Enable APIs ---
printf "\n### Step 1.1: Enabling all required APIs... ###\n"
gcloud services enable cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  script.googleapis.com \
  drive.googleapis.com \
  serviceusage.googleapis.com

# --- Step 1.2: Set Up Workload Identity Federation (WIF) ---
printf "\n### Step 1.2: Setting up Workload Identity Federation... ###\n"
# Explicitly check if the pool exists.
if ! gcloud iam workload-identity-pools describe "github-pool" --location="global" >/dev/null 2>&1; then
    echo "WIF Pool 'github-pool' not found. Creating it..."
    gcloud iam workload-identity-pools create "github-pool" --location="global" --description="Identity pool for GitHub Actions"
    # Added a 5-second delay to allow for GCP propagation.
    echo "Waiting 5 seconds for WIF Pool to propagate..."
    sleep 5
else
    echo "WIF Pool 'github-pool' already exists. Proceeding."
fi
WIF_POOL_ID=$(gcloud iam workload-identity-pools describe "github-pool" --location="global" --format="value(name)")
echo "WIF Pool ID is: ${WIF_POOL_ID}"

# Explicitly check if the provider exists.
if ! gcloud iam workload-identity-pools providers describe "github-provider" --workload-identity-pool="github-pool" --location="global" >/dev/null 2>&1; then
    echo "WIF Provider 'github-provider' not found. Creating it..."
    gcloud iam workload-identity-pools providers create-oidc "github-provider" \
      --workload-identity-pool="github-pool" \
      --location="global" \
      --issuer-uri="https://token.actions.githubusercontent.com" \
      --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
      --attribute-condition="assertion.repository=='${GITHUB_OWNER}/${GITHUB_REPO_NAME}'"
else
    echo "WIF Provider 'github-provider' already exists. Proceeding."
fi

# --- Step 1.3: Create Service Accounts ---
printf "\n### Step 1.3: Creating Service Accounts... ###\n"
gcloud iam service-accounts create "github-actions-ci" --display-name="GitHub Actions CI" || echo "Service Account 'github-actions-ci' already exists."
gcloud iam service-accounts create "cloudbuild-deploy-cd" --display-name="Cloud Build Apps Script Deployer" || echo "Service Account 'cloudbuild-deploy-cd' already exists."

# --- Step 1.4: Grant IAM Permissions ---
printf "\n### Step 1.4: Granting IAM Permissions... ###\n"
GITHUB_SA_EMAIL="github-actions-ci@${GCLOUD_PROJECT_ID}.iam.gserviceaccount.com"
CLOUDBUILD_SA_EMAIL="cloudbuild-deploy-cd@${GCLOUD_PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding "${GCLOUD_PROJECT_ID}" --member="user:${ADMIN_EMAIL}" --role="roles/iam.serviceAccountCreator"

gcloud iam service-accounts add-iam-policy-binding "${GITHUB_SA_EMAIL}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WIF_POOL_ID}/attribute.repository/${GITHUB_OWNER}/${GITHUB_REPO_NAME}"

gcloud projects add-iam-policy-binding "${GCLOUD_PROJECT_ID}" \
  --member="serviceAccount:${GITHUB_SA_EMAIL}" \
  --role="roles/cloudbuild.builds.editor"

# Note: Apps Script projects are managed through the clasp CLI tool
# Service account permissions for Apps Script are handled through project sharing
echo "Note: Apps Script permissions will be managed through clasp and project sharing"

gcloud projects add-iam-policy-binding "${GCLOUD_PROJECT_ID}" \
  --member="serviceAccount:${CLOUDBUILD_SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

printf "\n✅ GCP configuration is complete.\n"

# --- Step 2.1: Create Secrets ---
printf "\n### Step 2.1: Creating placeholder secrets... ###\n"
gcloud secrets create "clasp-credentials" --replication-policy="automatic" --project="${GCLOUD_PROJECT_ID}" || echo "Secret 'clasp-credentials' already exists."
echo '{}' > /tmp/dev-mapping.json
echo '{}' > /tmp/prod-mapping.json
gcloud secrets create "project-mapping-dev" --data-file=/tmp/dev-mapping.json --project="${GCLOUD_PROJECT_ID}" || echo "Secret 'project-mapping-dev' already exists."
gcloud secrets create "project-mapping-prod" --data-file=/tmp/prod-mapping.json --project="${GCLOUD_PROJECT_ID}" || echo "Secret 'project-mapping-prod' already exists."

# --- Step 2.2: Authenticate clasp and Create Apps Script Projects ---
printf "\n### Step 2.2: Authenticating with clasp... ###\n"
echo "A browser window will open. Please follow the instructions to log in."
clasp login
read -r -p "Press [Enter] key after you have successfully logged in..."

printf "\n--- Adding clasp credentials to Secret Manager... ---\n"
CLASP_RC_FILE="$HOME/.clasprc.json"
if [ -f "$CLASP_RC_FILE" ]; then
    gcloud secrets versions add "clasp-credentials" --data-file="$CLASP_RC_FILE" --project="${GCLOUD_PROJECT_ID}"
else
    echo "ERROR: $CLASP_RC_FILE not found. Login may have failed."
    exit 1
fi

printf "\n--- Creating all 16 Apps Script projects... ---\n"
SERVICES=("calendar" "chat" "docs" "drive" "gmail" "sheets" "tasks" "slides")
DEV_MAPPING_FILE="/tmp/dev-project-mapping.json"
PROD_MAPPING_FILE="/tmp/prod-project-mapping.json"
echo '{"projects":{}}' > $DEV_MAPPING_FILE
echo '{"projects":{}}' > $PROD_MAPPING_FILE

# Test if clasp create works by trying to create a test project
test_dir=$(mktemp -d)
cd "$test_dir"
if ! clasp create --type standalone --title "Test Project - Delete Me" >/dev/null 2>&1; then
    echo "❌ Apps Script project creation is not yet available."
    echo "📋 MANUAL STEPS REQUIRED:"
    echo "1. Visit https://script.google.com/home/usersettings"
    echo "2. Ensure 'Apps Script API' is turned ON"
    echo "3. Visit https://script.google.com/home and try creating a new project manually"
    echo "4. If you can create projects manually, wait 10-15 minutes and re-run this script"
    echo "5. Alternatively, create the 16 projects manually with these names:"
    echo ""
    for service in "${SERVICES[@]}"; do
        SERVICE_CAPITALIZED="$(tr '[:lower:]' '[:upper:]' <<<"${service:0:1}")${service:1}"
        echo "   - ${SERVICE_CAPITALIZED} Automation - Dev"
        echo "   - ${SERVICE_CAPITALIZED} Automation - Prod"
    done
    echo ""
    echo "📝 After manual creation, you can run the script ./update-project-mappings.sh to update the secrets."
    
    # Still update the secrets with empty mappings for now
    gcloud secrets versions add "project-mapping-dev" --data-file="$DEV_MAPPING_FILE" --project="${GCLOUD_PROJECT_ID}" || echo "Failed to update dev mapping"
    gcloud secrets versions add "project-mapping-prod" --data-file="$PROD_MAPPING_FILE" --project="${GCLOUD_PROJECT_ID}" || echo "Failed to update prod mapping"
    
    printf "\n⚠️  Setup partially complete. Apps Script projects need manual creation.\n"
    exit 0
fi

# If test creation worked, proceed with creating all projects
echo "✅ Apps Script API is working. Creating projects..."
rm -rf "$test_dir"

for service in "${SERVICES[@]}"; do
    # bash compatible method for capitalizing the first letter
    SERVICE_CAPITALIZED="$(tr '[:lower:]' '[:upper:]' <<<"${service:0:1}")${service:1}"

    echo "Creating ${SERVICE_CAPITALIZED} projects..."
    
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

printf "\n--- Updating project mapping secrets... ---\n"
gcloud secrets versions add "project-mapping-dev" --data-file="$DEV_MAPPING_FILE" --project="${GCLOUD_PROJECT_ID}"
gcloud secrets versions add "project-mapping-prod" --data-file="$PROD_MAPPING_FILE" --project="${GCLOUD_PROJECT_ID}"

printf "\n✅ All Apps Script projects created and mappings stored securely.\n"
printf "➡️ Next, perform the MANUAL STEPS to link projects in the Google Drive UI.\n"
