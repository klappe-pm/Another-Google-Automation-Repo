# Configuration Files

Cloud Build and project configuration files for the automation pipeline.

## Overview

This directory contains configuration files that define the CI/CD pipeline, project mappings, and deployment settings for the Google Apps Script automation framework.

## Files

| File Name | Purpose | Status |
|-----------|---------|--------|
| cloudbuild.yaml | Production Cloud Build configuration | Active |
| cloudbuild-diagnostic.yaml | Diagnostic build with enhanced logging | Active |
| project-mapping.json | Maps services to Apps Script project IDs | Active |

## File Details

### cloudbuild.yaml

Production Cloud Build configuration for automated deployment.

**Features:**
- Uses custom Docker image with Node.js and Google Cloud SDK
- Authenticates using Secret Manager credentials
- Deploys all 10 Apps Script projects
- Provides deployment summary

**Configuration:**
- **Timeout**: 1200 seconds (20 minutes)
- **Machine Type**: E2_HIGHCPU_8
- **Docker Image**: `us-central1-docker.pkg.dev/$PROJECT_ID/clasp-builder/clasp-builder:latest`

### cloudbuild-diagnostic.yaml

Enhanced diagnostic version with detailed logging for troubleshooting.

**Additional Features:**
- Verbose logging at each step
- Directory structure verification
- Secret content preview (truncated)
- Individual project deployment details
- Error output for failed deployments

**Use Cases:**
- Debugging authentication issues
- Verifying project structure
- Troubleshooting deployment failures

### project-mapping.json

Maps service names to Google Apps Script project IDs.

**Structure:**
```json
{
  "projects": {
    "calendar": {
      "scriptId": "1WBzQg...",
      "name": "Calendar Automation"
    },
    // ... other services
  }
}
```

**Services Mapped:**
- calendar
- chat
- docs
- drive
- gmail
- photos
- sheets
- slides
- tasks
- utility

## Usage

### Cloud Build Deployment

```bash
# Production deployment
gcloud builds submit --config=config/cloudbuild.yaml --project=workspace-automation-466800

# Diagnostic deployment (verbose logging)
gcloud builds submit --config=config/cloudbuild-diagnostic.yaml --project=workspace-automation-466800
```

### Local Usage

The configuration files are also used by local scripts:
- `test-deployment.sh` validates the configuration
- Symlinks in root directory maintain compatibility

## Configuration Updates

### Adding a New Service

1. Add entry to `project-mapping.json`:
```json
"newservice": {
  "scriptId": "YOUR_SCRIPT_ID",
  "name": "New Service Automation"
}
```

2. Update `cloudbuild.yaml` PROJECTS array:
```yaml
PROJECTS=(
  # ... existing projects
  "apps/newservice"
)
```

3. Create the service directory structure:
```
apps/newservice/
├── src/
├── .clasp.json
└── appsscript.json
```

### Modifying Build Settings

**Timeout**: Adjust if deployments take longer
```yaml
timeout: 1800s  # 30 minutes
```

**Machine Type**: Use larger machine for faster builds
```yaml
machineType: E2_HIGHCPU_32
```

## Troubleshooting

### Build Failures

1. Use diagnostic configuration for detailed logs
2. Check Secret Manager permissions
3. Verify Docker image exists in Artifact Registry
4. Confirm all project directories exist

### Authentication Issues

1. Verify `clasp-credentials` secret exists
2. Check secret has valid JSON content
3. Ensure Cloud Build service account has Secret Accessor role

### Performance Issues

1. Consider increasing timeout value
2. Use higher-spec machine type
3. Check for network connectivity issues

## Security Considerations

- **Secrets**: Stored in Google Secret Manager, not in repository
- **Permissions**: Cloud Build uses service account with minimal required permissions
- **Docker Image**: Custom image reduces attack surface

---

Last Updated: July 2025