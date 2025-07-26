# Claude AI Assistant Notes

This file contains important information for Claude AI to understand the project context and common tasks.

## Project Overview
This is a Google Apps Script automation project that deploys multiple Apps Script projects to Google using the clasp CLI tool.

## Key Commands

### Local Development
```bash
# Deploy all projects locally
./automation/deploy-local.sh

# Deploy a specific project
./automation/deploy-local.sh calendar

# Run tests
npm test
```

### Cloud Build
```bash
# Submit a build
gcloud builds submit --config=cloudbuild.yaml --project="workspace-automation-466800"

# Check build status
gcloud builds list --limit=5 --project="workspace-automation-466800"
```

## Common Issues and Fixes

### Cloud Build Secret Manager Permissions
If you encounter permission errors accessing secrets in Cloud Build:

```bash
# Grant Cloud Build service account access
gcloud secrets add-iam-policy-binding clasp-credentials \
    --member="serviceAccount:784508074368@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project="workspace-automation-466800"

# Grant compute service account access (if using default pool)
gcloud secrets add-iam-policy-binding clasp-credentials \
    --member="serviceAccount:784508074368-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project="workspace-automation-466800"
```

### NPM Permission Issues in Cloud Build
The project uses official Node.js images to avoid npm permission issues. The cloudbuild.yaml is configured to:
1. Use `node:18` image for npm installations
2. Use `gcr.io/google.com/cloudsdktool/cloud-sdk:alpine` for gcloud operations
3. Install Node.js in the cloud-sdk container for clasp deployment

## Project Structure
- `/apps/` - Contains all Google Apps Script projects
- `/automation/` - Deployment and automation scripts
- `/config/` - Configuration files including Cloud Build configs
- `/docs/` - Documentation
- `/logs/` - Deployment logs

## Important Files
- `cloudbuild.yaml` - Symlink to active Cloud Build configuration
- `config/cloudbuild-nodejs.yaml` - Working Cloud Build config using official images
- `.gcloudignore` - Ensures .clasp.json files are included in builds
- `project-mapping.json` - Maps project names to script IDs

## Recent Changes (July 2025)
- Reorganized repository structure: `projects/` → `apps/`
- Fixed Cloud Build npm permission issues
- Added Secret Manager permissions for service accounts
- Created comprehensive documentation structure