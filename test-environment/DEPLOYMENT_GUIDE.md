# GCP Test Environment Deployment Guide

This guide explains how to deploy and use the reproducible GCP-enabled test environment.

## 🎯 Overview

The test environment provides two deployment options:
1. **Docker Container** - Fully isolated environment with all dependencies
2. **Google Cloud Shell** - Quick setup in Google's cloud environment

## 🚀 Quick Deployment

### Option 1: Docker Container (Recommended)

**Prerequisites:**
- Docker and Docker Compose installed
- Basic familiarity with Docker

**Steps:**

1. **Navigate to test environment:**
   ```bash
   cd test-environment
   ```

2. **Start the environment:**
   ```bash
   # Using make (recommended)
   make up

   # Or using docker-compose directly
   docker-compose up -d
   ```

3. **Enter the container:**
   ```bash
   # Using make
   make shell

   # Or using docker-compose
   docker-compose exec test-env bash
   ```

4. **Authenticate with GCP:**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

5. **Validate setup:**
   ```bash
   ./test-environment/validate-environment.sh
   ```

### Option 2: Google Cloud Shell

**Prerequisites:**
- Google Cloud Platform account
- Access to Google Cloud Shell

**Steps:**

1. **Open Cloud Shell:**
   - Go to [https://shell.cloud.google.com](https://shell.cloud.google.com)

2. **Run setup script:**
   ```bash
   curl -sSL https://raw.githubusercontent.com/klappe-pm/Another-Google-Automation-Repo/main/test-environment/setup-cloud-shell.sh | bash
   ```

3. **Source environment variables:**
   ```bash
   source set-env.sh
   ```

## 🔧 Environment Configuration

### Default Environment Variables

The test environment automatically sets these GitHub Actions variables:

| Variable | Value |
|----------|-------|
| `GITHUB_SHA` | `test-sha-123456` |
| `GITHUB_REF` | `refs/heads/main` |
| `GITHUB_REPOSITORY` | `klappe-pm/Another-Google-Automation-Repo` |
| `PROJECT_ID` | `workspace-automation-466800` |

### Customizing Variables

**Docker Method:**
```bash
# Create .env file
cp .env.example .env
# Edit .env with your values
nano .env

# Restart environment
make restart
```

**Environment Variables Method:**
```bash
GITHUB_SHA=your-sha PROJECT_ID=your-project make up
```

## 🧪 Testing Your Scripts

Once deployed, you can test various operations:

### Basic Validation
```bash
# Validate environment
./test-environment/validate-environment.sh

# Check tools
node --version
npm --version
gcloud version
```

### Deployment Testing
```bash
# Test npm scripts
npm run deploy
npm run status
npm run validate

# Test GCP operations
gcloud config list
gcloud projects list
gcloud builds submit --tag gcr.io/$PROJECT_ID/automation-api:v1
```

### Security Testing
```bash
# Run security scans
npm run security:scan
npm run snyk:test
```

## 📊 Available Commands

### Make Commands (Docker)
```bash
make help           # Show all available commands
make up             # Start environment
make down           # Stop environment
make shell          # Enter container
make validate       # Validate setup
make clean          # Clean up everything
make restart        # Restart environment
make logs           # Show container logs
```

### NPM Scripts
```bash
npm run deploy      # Deploy application
npm run status      # Check deployment status
npm run validate    # Validate projects
npm run security:scan # Run security scan
```

### GCloud Commands
```bash
gcloud config list                    # Show configuration
gcloud projects list                  # List projects
gcloud builds submit                  # Submit build
gcloud app deploy                     # Deploy to App Engine
```

## 🔐 Authentication Setup

### For Docker Container

1. **Initial authentication:**
   ```bash
   gcloud auth login
   ```

2. **Application default credentials:**
   ```bash
   gcloud auth application-default login
   ```

3. **Set project:**
   ```bash
   gcloud config set project workspace-automation-466800
   ```

### For Cloud Shell

Authentication is typically pre-configured, but verify with:
```bash
gcloud auth list
gcloud config list
```

## 📋 Validation Checklist

Use this checklist to ensure your environment is properly set up:

- [ ] Docker container running (for Docker method)
- [ ] All environment variables set
- [ ] Node.js and npm available
- [ ] Google Cloud SDK installed and configured
- [ ] GCP authentication working
- [ ] Project dependencies installed
- [ ] Validation script passes

## 🐛 Troubleshooting

### Common Issues

**Docker Issues:**
```bash
# Container won't start
make clean && make up

# Permission issues
sudo docker-compose up -d

# Port conflicts
docker-compose down && make up
```

**Authentication Issues:**
```bash
# Re-authenticate
gcloud auth revoke --all
gcloud auth login
gcloud auth application-default login

# Check credentials
gcloud auth list
```

**Environment Variables:**
```bash
# Check variables are set
env | grep GITHUB_

# Re-source environment (Cloud Shell)
source set-env.sh
```

### Getting Help

1. Check the validation output: `./test-environment/validate-environment.sh`
2. View container logs: `make logs`
3. Check Docker status: `make status`
4. Review the README.md file

## 🚀 Production Considerations

This test environment is designed for development and testing. For production use:

1. **Security:** Don't commit credentials or sensitive data
2. **Resource Management:** Clean up containers when not in use
3. **Updates:** Regularly update the base images and dependencies
4. **Monitoring:** Monitor resource usage and costs

## 🔄 Updating the Environment

To update the test environment:

```bash
# Pull latest changes
git pull origin main

# Rebuild container
make clean && make up

# Or for Cloud Shell
./test-environment/setup-cloud-shell.sh
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Google Cloud Shell Documentation](https://cloud.google.com/shell/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud SDK Documentation](https://cloud.google.com/sdk/docs)
