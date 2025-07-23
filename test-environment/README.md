# GCP-Enabled Test Environment

This directory contains scripts and configurations to provision a disposable, reproducible test environment that emulates the GitHub Actions workflow for local development and testing.

## 🚀 Quick Start

### Option 1: Docker Container (Recommended)

```bash
# Navigate to the test environment directory
cd test-environment

# Build and run the test environment
docker-compose up -d

# Enter the container
docker-compose exec test-env bash

# Inside the container, authenticate with GCP
gcloud auth login
gcloud auth application-default login
```

### Option 2: Google Cloud Shell

```bash
# Open Google Cloud Shell (https://shell.cloud.google.com)
# Run the setup script
curl -sSL https://raw.githubusercontent.com/klappe-pm/Another-Google-Automation-Repo/main/test-environment/setup-cloud-shell.sh | bash

# Or if you have the repository locally:
./test-environment/setup-cloud-shell.sh
```

## 📋 Environment Variables

The test environment automatically sets up the following GitHub Actions environment variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `GITHUB_SHA` | `test-sha-123456` | Commit SHA |
| `GITHUB_REF` | `refs/heads/main` | Git reference |
| `GITHUB_REPOSITORY` | `klappe-pm/Another-Google-Automation-Repo` | Repository name |
| `GITHUB_ACTOR` | `test-user` | User triggering the action |
| `GITHUB_WORKFLOW` | `test-workflow` | Workflow name |
| `GITHUB_RUN_ID` | `123456` | Unique run identifier |
| `GITHUB_RUN_NUMBER` | `1` | Run number |
| `GITHUB_EVENT_NAME` | `push` | Event that triggered the workflow |
| `GITHUB_WORKSPACE` | `/workspace` | Workspace directory |
| `PROJECT_ID` | `workspace-automation-466800` | GCP Project ID |

## 🔧 Customizing Environment Variables

You can override any environment variable:

```bash
# Docker Compose
GITHUB_SHA=my-custom-sha docker-compose up -d

# Or create a .env file
echo "GITHUB_SHA=my-custom-sha" > .env
docker-compose up -d
```

## 🧪 Testing Your Scripts

Once the environment is set up, you can test your deployment scripts:

```bash
# Test the deployment process
npm run deploy

# Check deployment status
npm run status

# Run Google Cloud Build
gcloud builds submit --tag gcr.io/workspace-automation-466800/automation-api:v1

# Test other npm scripts
npm run validate
npm run security:scan
```

## 📁 Directory Structure

```
test-environment/
├── Dockerfile                 # Docker container definition
├── docker-compose.yml        # Docker Compose configuration
├── setup-cloud-shell.sh      # Cloud Shell setup script
└── README.md                  # This file
```

## 🔐 Authentication

### Docker Container
```bash
# Inside the container
gcloud auth login
gcloud auth application-default login
```

### Cloud Shell
Authentication is typically pre-configured, but you may need to:
```bash
gcloud auth login
gcloud auth application-default login
```

## 🐛 Troubleshooting

### Docker Issues
- Ensure Docker and Docker Compose are installed
- Check if ports are available
- Verify you have sufficient disk space

### GCP Authentication
- Make sure you have the necessary IAM permissions
- Verify the project ID is correct
- Check that the Google Cloud SDK is properly installed

### Node.js Issues
- Ensure you're using Node.js 18 or higher
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 🔄 Updating the Environment

To update the test environment with changes:

```bash
# Docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Cloud Shell
./test-environment/setup-cloud-shell.sh
```

## 📚 Additional Resources

- [Google Cloud Shell Documentation](https://cloud.google.com/shell/docs)
- [GitHub Actions Environment Variables](https://docs.github.com/en/actions/reference/environment-variables)
- [Google Cloud SDK Documentation](https://cloud.google.com/sdk/docs)

## 🤝 Contributing

To add new features to the test environment:

1. Update the appropriate files (Dockerfile, setup script)
2. Test your changes
3. Update this README
4. Submit a pull request
