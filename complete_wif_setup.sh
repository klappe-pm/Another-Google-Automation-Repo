#!/bin/bash

# Exit on any error
set -e

# Validate environment variables
if [[ -z "${SHARED_PROJECT_ID}" || -z "${PROD_PROJECT_ID}" || -z "${GITHUB_OWNER}" || -z "${GITHUB_REPO_NAME}" || -z "${GITHUB_SA_EMAIL}" || -z "${CLOUDBUILD_SA_EMAIL}" ]]; then
  echo "Error: All environment variables must be set."
  exit 1
fi

# Set project
gcloud config set project "${SHARED_PROJECT_ID}"

# Get Workload Identity Pool ID
export WIF_POOL_ID=$(gcloud iam workload-identity-pools describe "github-pool" \
  --location="global" \
  --format="value(name)" \
  --project="${SHARED_PROJECT_ID}")

# Grant IAM permissions
echo "Granting IAM permissions..."
# 1. Allow GitHub Actions SA to impersonate itself through WIF
gcloud iam service-accounts add-iam-policy-binding "${GITHUB_SA_EMAIL}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WIF_POOL_ID}/attribute.repository/${GITHUB_OWNER}/${GITHUB_REPO_NAME}" \
  --project="${SHARED_PROJECT_ID}" || echo "IAM policy binding for workloadIdentityUser already exists."

# 2. Allow GitHub Actions SA to trigger Cloud Build jobs
gcloud projects add-iam-policy-binding "${SHARED_PROJECT_ID}" \
  --member="serviceAccount:${GITHUB_SA_EMAIL}" \
  --role="roles/cloudbuild.builds.editor" || echo "IAM policy binding for cloudbuild.builds.editor already exists."

# 3. Grant Cloud Build SA permission to deploy to Prod project
gcloud projects add-iam-policy-binding "${PROD_PROJECT_ID}" \
  --member="serviceAccount:${CLOUDBUILD_SA_EMAIL}" \
  --role="roles/cloudbuild.builds.editor" || echo "IAM policy binding for prod project already exists."

# 4. Grant Cloud Build SA permission to access secrets
gcloud projects add-iam-policy-binding "${SHARED_PROJECT_ID}" \
  --member="serviceAccount:${CLOUDBUILD_SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" || echo "IAM policy binding for secretmanager.secretAccessor already exists."

echo "✅ WIF, Service Accounts, and IAM policies configured."
