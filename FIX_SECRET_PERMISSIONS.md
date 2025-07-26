# Fix Cloud Build Secret Manager Permissions

## Problem
The Cloud Build service account doesn't have permission to access the `clasp-credentials` secret in Secret Manager.

## Error Details
```
PERMISSION_DENIED: Permission 'secretmanager.versions.access' denied for resource 
'projects/workspace-automation-466800/secrets/clasp-credentials/versions/latest'
```

## Solution

### Option 1: Grant Secret Manager Access (Recommended)

Run these commands to grant the Cloud Build service account access to the secret:

```bash
# Get the Cloud Build service account
PROJECT_ID="workspace-automation-466800"
PROJECT_NUMBER="784508074368"
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant Secret Manager Secret Accessor role to Cloud Build service account
gcloud secrets add-iam-policy-binding clasp-credentials \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --project="${PROJECT_ID}"
```

### Option 2: Use Default Compute Service Account

The error shows it's using `784508074368-compute@developer.gserviceaccount.com`. Grant this account access:

```bash
gcloud secrets add-iam-policy-binding clasp-credentials \
    --member="serviceAccount:784508074368-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project="workspace-automation-466800"
```

### Option 3: Check if Secret Exists

First verify the secret exists:

```bash
gcloud secrets list --project="workspace-automation-466800"
gcloud secrets versions list clasp-credentials --project="workspace-automation-466800"
```

### Option 4: Create the Secret (if it doesn't exist)

If the secret doesn't exist, create it:

1. Get your clasp credentials from `~/.clasprc.json`
2. Create the secret:

```bash
# Create secret from file
gcloud secrets create clasp-credentials \
    --data-file="$HOME/.clasprc.json" \
    --project="workspace-automation-466800"
```

## Alternative: Use Local Deployment

If you can't fix the permissions, use the local deployment script instead:

```bash
./automation/deploy-local.sh
```

This bypasses Cloud Build entirely and uses your local clasp authentication.