#!/usr/bin/env bash
set -euo pipefail

# Cloud Shell Setup Script for GCP-Enabled Test Environment
# This script sets up a reproducible environment in Google Cloud Shell

echo "🚀 Setting up GCP-enabled test environment in Cloud Shell..."

# Set project ID
PROJECT_ID="workspace-automation-466800"
REPO_URL="https://github.com/klappe-pm/Another-Google-Automation-Repo.git"

# Check if we're in Cloud Shell
if [[ ! -v CLOUD_SHELL ]]; then
    echo "⚠️  Warning: This script is designed for Google Cloud Shell"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Set up GitHub Actions environment variables
export GITHUB_SHA="${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'test-sha-123456')}"
export GITHUB_REF="${GITHUB_REF:-refs/heads/main}"
export GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-klappe-pm/Another-Google-Automation-Repo}"
export GITHUB_ACTOR="${GITHUB_ACTOR:-test-user}"
export GITHUB_WORKFLOW="${GITHUB_WORKFLOW:-test-workflow}"
export GITHUB_RUN_ID="${GITHUB_RUN_ID:-123456}"
export GITHUB_RUN_NUMBER="${GITHUB_RUN_NUMBER:-1}"
export GITHUB_EVENT_NAME="${GITHUB_EVENT_NAME:-push}"
export GITHUB_WORKSPACE="${PWD}"

# GCP environment variables
export PROJECT_ID="$PROJECT_ID"
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"

echo "📋 Environment Variables Set:"
echo "  GITHUB_SHA: $GITHUB_SHA"
echo "  GITHUB_REF: $GITHUB_REF"
echo "  GITHUB_REPOSITORY: $GITHUB_REPOSITORY"
echo "  PROJECT_ID: $PROJECT_ID"

# Set the active project
echo "🔧 Setting GCP project..."
gcloud config set project "$PROJECT_ID"

# Check if we need to clone the repository
if [[ ! -d ".git" ]]; then
    echo "📥 Cloning repository..."
    TEMP_DIR=$(mktemp -d)
    git clone "$REPO_URL" "$TEMP_DIR"
    cd "$TEMP_DIR"
    echo "📁 Repository cloned to: $PWD"
fi

# Install Node.js if not present (Cloud Shell usually has it)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "📋 Node.js version: $(node --version)"
echo "📋 npm version: $(npm --version)"

# Install project dependencies
if [[ -f "package.json" ]]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Verify Google Cloud SDK
echo "📋 Google Cloud SDK version: $(gcloud version --format='value(Google Cloud SDK)')"

# Set up authentication (user will need to do this manually)
echo "🔐 Authentication Setup:"
echo "  To authenticate with GCP, run: gcloud auth login"
echo "  To set application default credentials: gcloud auth application-default login"

# Create a script to easily re-export environment variables
cat > set-env.sh << EOF
#!/bin/bash
# Source this file with: source set-env.sh

export GITHUB_SHA="$GITHUB_SHA"
export GITHUB_REF="$GITHUB_REF"
export GITHUB_REPOSITORY="$GITHUB_REPOSITORY"
export GITHUB_ACTOR="$GITHUB_ACTOR"
export GITHUB_WORKFLOW="$GITHUB_WORKFLOW"
export GITHUB_RUN_ID="$GITHUB_RUN_ID"
export GITHUB_RUN_NUMBER="$GITHUB_RUN_NUMBER"
export GITHUB_EVENT_NAME="$GITHUB_EVENT_NAME"
export GITHUB_WORKSPACE="$PWD"
export PROJECT_ID="$PROJECT_ID"
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"

echo "✅ Environment variables set for GitHub Actions simulation"
EOF

chmod +x set-env.sh

echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "  1. Authenticate: gcloud auth login"
echo "  2. Re-export variables: source set-env.sh"
echo "  3. Test your scripts in this environment"
echo ""
echo "🧪 Available commands:"
echo "  npm run deploy       # Deploy the application"
echo "  npm run status       # Check deployment status"
echo "  gcloud builds submit # Submit a Cloud Build"
echo ""
echo "📁 Current directory: $PWD"
