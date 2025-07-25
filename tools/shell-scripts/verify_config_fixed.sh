#!/usr/bin/env bash
set -euo pipefail
# This script prints all current configurations for review.

# Ensure environment variables are set
export SHARED_PROJECT_ID="workspace-automation-466800"  # Update if different
export DEV_PROJECT_ID="workspace-automation-dev"
export PROD_PROJECT_ID="workspace-automation-prod-2025"
export GITHUB_OWNER="klappe-pm"
export GITHUB_REPO_NAME="Another-Google-Automation-Repo"
export GITHUB_SA_EMAIL="github-actions-ci@workspace-automation-466800.iam.gserviceaccount.com"  # Update to match SHARED_PROJECT_ID
export CLOUDBUILD_SA_EMAIL="cloudbuild-deploy-cd@workspace-automation-466800.iam.gserviceaccount.com"  # Update to match SHARED_PROJECT_ID

# Check if required variables are set
for var in SHARED_PROJECT_ID DEV_PROJECT_ID PROD_PROJECT_ID GITHUB_OWNER GITHUB_REPO_NAME GITHUB_SA_EMAIL CLOUDBUILD_SA_EMAIL; do
  # Use eval for better compatibility and clarity
  if [ -z "$(eval echo \$$var)" ]; then
    echo "Error: $var is not set."
    exit 1
  fi
done

echo "### 1. Environment Variables ###"
echo "SHARED_PROJECT_ID: ${SHARED_PROJECT_ID}"
echo "DEV_PROJECT_ID: ${DEV_PROJECT_ID}"
echo "PROD_PROJECT_ID: ${PROD_PROJECT_ID}"
echo "GITHUB_OWNER: ${GITHUB_OWNER}"
echo "GITHUB_REPO_NAME: ${GITHUB_REPO_NAME}"
echo "GITHUB_SA_EMAIL: ${GITHUB_SA_EMAIL}"
echo "CLOUDBUILD_SA_EMAIL: ${CLOUDBUILD_SA_EMAIL}"

echo
echo "### 2. GCP Active Configuration ###"
gcloud config list

echo
echo "### 3. Service Accounts in Shared Project ###"
gcloud iam service-accounts list --project="${SHARED_PROJECT_ID}" || echo "Error: Failed to list service accounts for ${SHARED_PROJECT_ID}"

echo
echo "### 4. Workload Identity Federation Pool ###"
gcloud iam workload-identity-pools describe "github-pool" --location="global" --project="${SHARED_PROJECT_ID}" || echo "Error: Failed to describe workload identity pool"

echo
echo "### 5. Workload Identity Federation Provider ###"
gcloud iam workload-identity-pools providers describe "github-provider" --workload-identity-pool="github-pool" --location="global" --project="${SHARED_PROJECT_ID}" || echo "Error: Failed to describe workload identity provider"

echo
echo "### 6. IAM Policy for GitHub Actions Service Account ###"
gcloud iam service-accounts get-iam-policy "${GITHUB_SA_EMAIL}" --project="${SHARED_PROJECT_ID}" || echo "Error: Failed to get IAM policy for ${GITHUB_SA_EMAIL}"

echo
echo "### 7. IAM Policy for Shared Project ###"
gcloud projects get-iam-policy "${SHARED_PROJECT_ID}" || echo "Error: Failed to get IAM policy for ${SHARED_PROJECT_ID}"

echo
echo "### 8. IAM Policy for Dev Project ###"
gcloud projects get-iam-policy "${DEV_PROJECT_ID}" || echo "Error: Failed to get IAM policy for ${DEV_PROJECT_ID}"

echo
echo "### 9. IAM Policy for Prod Project ###"
gcloud projects get-iam-policy "${PROD_PROJECT_ID}" || echo "Error: Failed to get IAM policy for ${PROD_PROJECT_ID}"

echo
echo "✅ Verification script complete."
