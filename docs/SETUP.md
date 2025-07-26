# Setup Guide

This guide will help you set up the Google Workspace Automation repository for local development and deployment.

## Prerequisites

- Node.js 18+ and npm
- Google Account with access to Google Workspace
- Git installed locally
- Google Cloud SDK (for Cloud Build deployment)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/workspace-automation.git
cd workspace-automation
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `@google/clasp` - Command Line Apps Script Projects
- Development tools and utilities
- Testing frameworks

### 3. Authenticate with Google

```bash
# Login to clasp
npx clasp login

# This will open a browser window for authentication
# Grant the necessary permissions
```

### 4. Configure Environment

Create a `.env` file in the root directory:

```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings
nano .env
```

Required environment variables:
```
GOOGLE_CLOUD_PROJECT=your-project-id
DEPLOYMENT_ENV=development
LOG_LEVEL=info
```

### 5. Set Up Google Cloud (Optional - for Cloud Build)

```bash
# Set default project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable script.googleapis.com
gcloud services enable drive.googleapis.com
gcloud services enable sheets.googleapis.com
gcloud services enable gmail.googleapis.com
gcloud services enable calendar-json.googleapis.com
gcloud services enable tasks.googleapis.com

# Create service account (if using Cloud Build)
gcloud iam service-accounts create clasp-deployer \
    --display-name="Clasp Deployment Service Account"
```

## Deployment

### Local Deployment

Deploy all scripts:
```bash
./automation/deploy-local.sh
```

Deploy specific service:
```bash
./automation/deploy-local.sh gmail
./automation/deploy-local.sh drive
./automation/deploy-local.sh sheets
```

### Cloud Build Deployment

```bash
# Submit build
gcloud builds submit --config=cloudbuild.yaml

# Monitor progress
gcloud builds list --limit=5
```

## Project Mapping

Each service folder contains a `.clasp.json` file that maps to a Google Apps Script project:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "."
}
```

To create new projects:
```bash
# Navigate to service folder
cd apps/gmail

# Create new Apps Script project
npx clasp create --title "Gmail Automation" --type standalone

# This creates a new .clasp.json with the script ID
```

## Verification

After deployment, verify your scripts:

1. **Google Apps Script Editor**
   - Visit https://script.google.com
   - Check that projects are updated

2. **Test Functions**
   ```javascript
   // Run a test function
   function testDeployment() {
     Logger.log('Deployment successful!');
   }
   ```

3. **Check Logs**
   ```bash
   # View deployment logs
   cat logs/deployment-*.log
   ```

## Troubleshooting

### Authentication Issues
```bash
# Re-authenticate
npx clasp logout
npx clasp login
```

### Permission Errors
- Ensure you have Editor access to the Google Apps Script projects
- Check that all required APIs are enabled in Google Cloud Console

### Deployment Failures
```bash
# Check clasp status
npx clasp status

# View detailed logs
npx clasp logs
```

### Missing Script IDs
If `.clasp.json` files are missing:
```bash
# Create mapping manually
echo '{"scriptId": "YOUR_SCRIPT_ID", "rootDir": "."}' > apps/service/.clasp.json
```

## Next Steps

- Read the [Development Guide](DEVELOPMENT.md) for coding standards
- Check [Script Catalog](SCRIPT_CATALOG.md) for available scripts
- Review [API Permissions](API_PERMISSIONS.md) for required scopes

## Support

For issues or questions:
- Check existing [GitHub Issues](https://github.com/yourusername/workspace-automation/issues)
- Review [troubleshooting docs](TROUBLESHOOTING.md)
- Contact the maintainers

---

Last Updated: July 2025