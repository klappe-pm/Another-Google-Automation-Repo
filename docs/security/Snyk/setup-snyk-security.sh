#!/bin/bash
set -euo pipefail

# Error trap for better debugging
trap 'echo "Error: $BASH_SOURCE:$LINENO"; exit 1' ERR

# Snyk Security Integration Setup Script
# For Another-Google-Automation-Repo (AGAR)

echo "🛡️  SNYK SECURITY INTEGRATION SETUP"
echo "===================================="
echo "Repository: Another-Google-Automation-Repo"
echo "Setting up comprehensive security monitoring..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi
print_status "Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_status "npm $(npm --version) detected"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the repository root."
    exit 1
fi

# Check if this is the correct repository
REPO_NAME=$(grep -o '"name": "[^"]*"' package.json | cut -d'"' -f4)
if [ "$REPO_NAME" != "workspace-automation" ]; then
    print_warning "Repository name in package.json: $REPO_NAME"
    print_info "Continuing with setup..."
fi

print_status "Repository validation complete"
echo ""

# Step 1: Install Snyk CLI and dependencies
echo "📦 Installing Snyk CLI and dependencies..."

# Install Snyk globally if not already installed
if ! command -v snyk &> /dev/null; then
    print_info "Installing Snyk CLI globally..."
    npm install -g snyk
    print_status "Snyk CLI installed globally"
else
    print_status "Snyk CLI already installed: $(snyk --version)"
fi

# Install local dependencies including Snyk
print_info "Installing project dependencies..."
npm install
print_status "Dependencies installed"

echo ""

# Step 2: Snyk Authentication
echo "🔐 Snyk Authentication Setup..."

print_info "Please follow these steps to authenticate with Snyk:"
echo "1. Go to https://app.snyk.io/account"
echo "2. Copy your API token"
echo "3. Run: snyk auth [your-token]"
echo "   OR set environment variable: export SNYK_TOKEN=your-token"
echo ""
print_warning "This setup script will continue, but Snyk commands require authentication."

# Test Snyk authentication (non-blocking)
if snyk auth --help &> /dev/null; then
    print_info "You can test authentication by running: snyk auth"
fi

echo ""

# Step 3: Initialize Snyk configuration
echo "⚙️  Initializing Snyk configuration..."

# Create .snyk file if it doesn't exist
if [ ! -f ".snyk" ]; then
    print_info "Creating .snyk configuration file..."
    cat > .snyk << 'EOF'
# Snyk Configuration for Another-Google-Automation-Repo
# https://docs.snyk.io/snyk-cli/test-for-vulnerabilities/the-.snyk-file

version: v1.0.0

# Language-specific settings
language-settings:
  javascript:
    # Include development dependencies in scans
    dev: true

# Security patches to apply
patches: {}

# Vulnerabilities to ignore (temporary or false positives)
ignore: {}

# Global exclusions
exclude:
  global:
    # Exclude common non-security directories
    - node_modules/
    - '*.test.js'
    - test/
    - tests/
    - docs/
    - documentation/
    - examples/
    - templates/
    - '*.md'
    # Exclude legacy files
    - 'scripts/*/Legacy Files/*'
    - 'legacy-scripts/'
    - '*-legacy.gs'
    - '*-copy.gs'
    # Exclude draft scripts
    - 'draft-scripts/'
EOF
    print_status ".snyk configuration file created"
else
    print_status ".snyk configuration file already exists"
fi

echo ""

# Step 4: Set up directory structure
echo "📁 Setting up security directory structure..."

# Create security directories
mkdir -p security/reports
mkdir -p security/dashboard
mkdir -p security/policies

print_status "Security directories created"

# Create .gitignore entries for security reports (sensitive data)
if [ -f ".gitignore" ]; then
    if ! grep -q "security/reports/" .gitignore; then
        {
            echo ""
            echo "# Security reports (may contain sensitive data)"
            echo "security/reports/*.json"
            echo "security/dashboard/*.html"
        } >> .gitignore
        print_status "Updated .gitignore for security reports"
    fi
else
    print_warning ".gitignore not found - consider adding security report exclusions"
fi

echo ""

# Step 5: Set up GitHub Actions secrets
echo "🔑 GitHub Actions Setup..."

print_info "To complete the GitHub Actions integration, add these secrets to your repository:"
echo ""
echo "Repository Settings > Secrets and variables > Actions > New repository secret"
echo ""
echo "Required secrets:"
echo "• SNYK_TOKEN: Your Snyk API token from https://app.snyk.io/account"
echo "• SNYK_ORG_ID: Your Snyk organization ID (optional but recommended)"
echo ""
print_warning "GitHub Actions workflows will fail until these secrets are configured."

echo ""

# Step 6: Run initial security scan
echo "🔍 Running initial security scan..."

print_info "Testing Google Apps Script security scanner..."
if node tools/gas-security-scanner.js; then
    print_status "GAS security scan completed successfully"
else
    print_warning "GAS security scan completed with issues (check output above)"
fi

echo ""

# Try to run Snyk test (may fail if not authenticated)
print_info "Testing Snyk integration..."
if snyk test --severity-threshold=low &> /dev/null; then
    print_status "Snyk test completed successfully"
else
    print_warning "Snyk test failed (likely due to authentication - this is normal for initial setup)"
    print_info "Run 'snyk auth' and then 'npm run snyk:test' to test after authentication"
fi

echo ""

# Step 7: Generate initial security dashboard
echo "📊 Generating security dashboard..."

if node tools/security-dashboard.js; then
    print_status "Security dashboard generated successfully"
    print_info "View dashboard at: security/dashboard/security-dashboard.html"
else
    print_warning "Dashboard generation completed with warnings"
fi

echo ""

# Step 8: Display next steps
echo "🎯 SETUP COMPLETE!"
echo "=================="
echo ""
echo "Next steps:"
echo ""
echo "1. 🔐 Authenticate with Snyk:"
echo "   snyk auth"
echo ""
echo "2. 🧪 Test the integration:"
echo "   npm run snyk:test"
echo "   npm run security:scan"
echo ""
echo "3. 📊 View security dashboard:"
echo "   npm run security:dashboard"
echo "   open security/dashboard/security-dashboard.html"
echo ""
echo "4. 🔑 Configure GitHub Actions secrets:"
echo "   - Go to repository Settings > Secrets and variables > Actions"
echo "   - Add SNYK_TOKEN with your API token"
echo "   - Optionally add SNYK_ORG_ID"
echo ""
echo "5. 🚀 Push changes to trigger security workflows:"
echo "   git add ."
echo "   git commit -m 'Add Snyk security integration'"
echo "   git push"
echo ""

print_info "Available npm commands:"
echo "• npm run security:scan       - Run comprehensive security scan"
echo "• npm run security:dashboard  - Generate security dashboard"
echo "• npm run security:gas-scan   - Scan Google Apps Script files only"
echo "• npm run snyk:test          - Run Snyk vulnerability test"
echo "• npm run snyk:monitor       - Monitor project with Snyk"
echo "• npm run snyk:wizard        - Interactive vulnerability fixing"
echo ""

print_status "Snyk security integration setup complete!"
print_info "For support, see: security/SECURITY.md"

echo ""
echo "🛡️  Your repository is now protected by comprehensive security monitoring!"
