# GitHub Secrets Setup Guide

This guide provides step-by-step instructions for adding the required GitHub secrets to your repository.

## Required Secrets

The following secrets need to be added to your repository at `Settings > Secrets and variables > Actions`:

### 1. SNYK_TOKEN
**Description:** Personal or organization-level Snyk API token for security scanning

**How to obtain:**
1. Log in to [Snyk.io](https://snyk.io)
2. Go to Account Settings > General > Auth Token
3. Click "Generate token" or copy existing token
4. Copy the token value

**GitHub Setup:**
1. Go to your repository: `https://github.com/klappe-pm/Another-Google-Automation-Repo`
2. Navigate to `Settings > Secrets and variables > Actions`
3. Click "New repository secret"
4. Name: `SNYK_TOKEN`
5. Value: Paste your Snyk API token
6. Click "Add secret"

### 2. GCP_WORKLOAD_ID_PROVIDER
**Description:** Full resource name of the Workload Identity provider for GCP OIDC authentication

**Format:** `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`

**Example:** `projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider`

**How to obtain:**
1. In Google Cloud Console, navigate to IAM & Admin > Workload Identity Federation
2. Find your pool and provider
3. Copy the full resource name

**GitHub Setup:**
1. Go to `Settings > Secrets and variables > Actions`
2. Click "New repository secret"
3. Name: `GCP_WORKLOAD_ID_PROVIDER`
4. Value: Paste the full workload identity provider resource name
5. Click "Add secret"

### 3. GCP_SERVICE_ACCOUNT
**Description:** Email address of the service account for deployment

**Format:** `service-account-name@project-id.iam.gserviceaccount.com`

**Example:** `cloudbuild-dev-sa@workspace-automation-dev.iam.gserviceaccount.com`

**How to obtain:**
1. In Google Cloud Console, navigate to IAM & Admin > Service Accounts
2. Find your deployment service account
3. Copy the email address

**GitHub Setup:**
1. Go to `Settings > Secrets and variables > Actions`
2. Click "New repository secret"
3. Name: `GCP_SERVICE_ACCOUNT`
4. Value: Paste the service account email
5. Click "Add secret"

### 4. CLASP_OAUTH_TOKEN (Optional)
**Description:** OAuth token for Google Apps Script CLI (clasp) if OIDC is not yet configured

**How to obtain (if needed):**
1. Install clasp: `npm install -g @google/clasp`
2. Run: `clasp login`
3. Complete OAuth flow
4. Find token in `~/.clasprc.json`

**GitHub Setup (if needed):**
1. Go to `Settings > Secrets and variables > Actions`
2. Click "New repository secret"
3. Name: `CLASP_OAUTH_TOKEN`
4. Value: Paste the OAuth token JSON
5. Click "Add secret"

## Verification Steps

After adding all secrets:

1. **Commit and push the test workflow:**
   ```bash
   git add .github/workflows/test-secrets.yml
   git commit -m "Add GitHub secrets test workflow"
   git push origin main
   ```

2. **Run the test workflow:**
   - Go to your repository on GitHub
   - Navigate to the "Actions" tab
   - Find the "Test GitHub Secrets" workflow
   - Click "Run workflow" to trigger it manually

3. **Verify results:**
   - Check that all authentication steps pass
   - Look for the ✅ success indicators in the workflow output
   - Ensure no secret values are exposed in the logs

4. **Clean up:**
   - Once verification is successful, you can delete the test workflow:
   ```bash
   rm .github/workflows/test-secrets.yml
   git add .
   git commit -m "Remove secrets test workflow after successful verification"
   git push origin main
   ```

## Security Notes

- **Never commit secrets to code:** All sensitive values should only be stored as GitHub secrets
- **Use environment variables:** Reference secrets using `${{ secrets.SECRET_NAME }}` syntax
- **Principle of least privilege:** Ensure service accounts have only the minimum required permissions
- **Regular rotation:** Periodically rotate API tokens and service account keys
- **Monitor usage:** Review workflow runs to ensure secrets are working correctly

## Troubleshooting

### Common Issues:

1. **GCP Authentication Fails:**
   - Verify the Workload Identity Pool is properly configured
   - Check that the service account has necessary IAM bindings
   - Ensure the GitHub repository is correctly mapped to the pool

2. **Snyk Authentication Fails:**
   - Verify the token is still valid (check Snyk dashboard)
   - Ensure the token has appropriate permissions for your organization

3. **Workflow Permissions Error:**
   - Verify the workflow has `id-token: write` permission for OIDC
   - Check repository settings allow Actions to run

4. **Secret Not Found:**
   - Double-check secret names match exactly (case-sensitive)
   - Ensure secrets are added at the repository level, not environment level

For additional help, check the workflow run logs for specific error messages.
