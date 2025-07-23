#!/bin/bash
set -euo pipefail

# Environment Validation Script
# This script validates that the test environment is properly configured

# Error trap for better debugging
trap 'echo "Error: $BASH_SOURCE:$LINENO"; exit 1' ERR

echo "🔍 Validating GCP-enabled test environment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "✅ ${GREEN}$1 is available${NC}"
        return 0
    else
        echo -e "❌ ${RED}$1 is not available${NC}"
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    if [[ -n "${!1}" ]]; then
        echo -e "✅ ${GREEN}$1=${!1}${NC}"
        return 0
    else
        echo -e "❌ ${RED}$1 is not set${NC}"
        return 1
    fi
}

# Function to check version
check_version() {
    local cmd="$1"
    local version_flag="$2"
    # Note: min_version parameter accepted but not used in current implementation
    local min_version="$3"
    
    if command -v "$cmd" &> /dev/null; then
        local version
        version=$($cmd "$version_flag" 2>/dev/null | head -n1)
        echo -e "✅ ${GREEN}$cmd version: $version${NC}"
        return 0
    else
        echo -e "❌ ${RED}$cmd is not available${NC}"
        return 1
    fi
}

echo "🛠️  Checking required tools..."

# Check required tools
TOOLS_OK=true
check_command "node" || TOOLS_OK=false
check_command "npm" || TOOLS_OK=false
check_command "gcloud" || TOOLS_OK=false
check_command "git" || TOOLS_OK=false

echo ""
echo "📋 Checking tool versions..."

# Check versions
check_version "node" "--version" "18.0.0"
check_version "npm" "--version" "8.0.0"
check_version "gcloud" "version --format=value(Google_Cloud_SDK)" "400.0.0"

echo ""
echo "🌍 Checking environment variables..."

# Check GitHub Actions environment variables
ENV_OK=true
check_env_var "GITHUB_SHA" || ENV_OK=false
check_env_var "GITHUB_REF" || ENV_OK=false
check_env_var "GITHUB_REPOSITORY" || ENV_OK=false
check_env_var "GITHUB_ACTOR" || ENV_OK=false
check_env_var "GITHUB_WORKFLOW" || ENV_OK=false
check_env_var "GITHUB_RUN_ID" || ENV_OK=false
check_env_var "GITHUB_RUN_NUMBER" || ENV_OK=false
check_env_var "GITHUB_EVENT_NAME" || ENV_OK=false
check_env_var "GITHUB_WORKSPACE" || ENV_OK=false

# Check GCP environment variables
check_env_var "PROJECT_ID" || ENV_OK=false
check_env_var "GOOGLE_CLOUD_PROJECT" || ENV_OK=false

echo ""
echo "🔐 Checking GCP configuration..."

# Check GCP configuration
GCP_OK=true
if gcloud config get-value project &> /dev/null; then
    PROJECT=$(gcloud config get-value project)
    echo -e "✅ ${GREEN}GCP Project: $PROJECT${NC}"
else
    echo -e "❌ ${RED}GCP project not configured${NC}"
    GCP_OK=false
fi

# Check authentication status
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 &> /dev/null; then
    ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
    if [[ -n "$ACCOUNT" ]]; then
        echo -e "✅ ${GREEN}Authenticated as: $ACCOUNT${NC}"
    else
        echo -e "⚠️  ${YELLOW}No active authentication found${NC}"
        echo -e "   ${YELLOW}Run: gcloud auth login${NC}"
    fi
else
    echo -e "❌ ${RED}Unable to check authentication status${NC}"
fi

echo ""
echo "📁 Checking project structure..."

# Check project files
PROJECT_OK=true
if [[ -f "package.json" ]]; then
    echo -e "✅ ${GREEN}package.json found${NC}"
else
    echo -e "❌ ${RED}package.json not found${NC}"
    PROJECT_OK=false
fi

if [[ -d "node_modules" ]]; then
    echo -e "✅ ${GREEN}node_modules directory found${NC}"
else
    echo -e "⚠️  ${YELLOW}node_modules directory not found${NC}"
    echo -e "   ${YELLOW}Run: npm install${NC}"
fi

if [[ -d ".github/workflows" ]]; then
    echo -e "✅ ${GREEN}GitHub workflows directory found${NC}"
else
    echo -e "❌ ${RED}.github/workflows directory not found${NC}"
    PROJECT_OK=false
fi

echo ""
echo "🧪 Running basic tests..."

# Test npm scripts
if npm run --silent 2>/dev/null | grep -q "deploy"; then
    echo -e "✅ ${GREEN}npm deploy script available${NC}"
else
    echo -e "❌ ${RED}npm deploy script not found${NC}"
fi

# Test gcloud command
if gcloud version &> /dev/null; then
    echo -e "✅ ${GREEN}gcloud command working${NC}"
else
    echo -e "❌ ${RED}gcloud command not working${NC}"
fi

echo ""
echo "📊 Validation Summary:"

if [[ "$TOOLS_OK" == true && "$ENV_OK" == true && "$PROJECT_OK" == true ]]; then
    echo -e "🎉 ${GREEN}Environment validation PASSED!${NC}"
    echo -e "   ${GREEN}Your test environment is ready to use.${NC}"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. If not authenticated: gcloud auth login"
    echo "  2. Test deployment: npm run deploy"
    echo "  3. Check status: npm run status"
    exit 0
else
    echo -e "⚠️  ${YELLOW}Environment validation completed with issues${NC}"
    
    if [[ "$TOOLS_OK" != true ]]; then
        echo -e "   ${RED}• Missing required tools${NC}"
    fi
    
    if [[ "$ENV_OK" != true ]]; then
        echo -e "   ${RED}• Missing environment variables${NC}"
        echo -e "     ${YELLOW}Run: source set-env.sh${NC}"
    fi
    
    if [[ "$PROJECT_OK" != true ]]; then
        echo -e "   ${RED}• Project structure issues${NC}"
    fi
    
    echo ""
    echo "🔧 To fix issues, check the README.md file"
    exit 1
fi
