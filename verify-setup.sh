#!/bin/bash

# Automated Setup Verification Script
# Run this script to verify your Google Apps Script automation setup

set -e  # Exit on any error

echo "🔍 Starting Workspace Automation Setup Verification..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ "$1" -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Track overall success
OVERALL_SUCCESS=0

echo ""
echo "📋 Phase 1: Prerequisites Check"
echo "================================"

# Check Node.js version
print_info "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | tr -d 'v')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_status 0 "Node.js version: $NODE_VERSION"
    else
        print_status 1 "Node.js version too old: $NODE_VERSION (need 18+)"
        OVERALL_SUCCESS=1
    fi
else
    print_status 1 "Node.js not found"
    OVERALL_SUCCESS=1
fi

# Check clasp installation
print_info "Checking clasp installation..."
if command -v clasp &> /dev/null; then
    CLASP_VERSION=$(clasp --version)
    print_status 0 "clasp installed: $CLASP_VERSION"
else
    print_status 1 "clasp not installed (run: npm install -g @google/clasp)"
    OVERALL_SUCCESS=1
fi

# Check clasp authentication
print_info "Checking clasp authentication..."
if clasp login --status &> /dev/null; then
    AUTH_STATUS=$(clasp login --status 2>&1)
    print_status 0 "clasp authentication: $AUTH_STATUS"
else
    print_status 1 "clasp not authenticated (run: clasp login)"
    OVERALL_SUCCESS=1
fi

# Check git repository
print_info "Checking git repository..."
if git remote get-url origin &> /dev/null; then
    REPO_URL=$(git remote get-url origin)
    if [[ "$REPO_URL" == *"workspace-automation"* ]]; then
        print_status 0 "Repository: $REPO_URL"
    else
        print_warning "Repository URL doesn't match expected pattern: $REPO_URL"
    fi
else
    print_status 1 "Not in a git repository or no origin remote"
    OVERALL_SUCCESS=1
fi

echo ""
echo "📦 Phase 2: Project Structure Check"
echo "===================================="

# Check package.json
print_info "Checking package.json..."
if [ -f "package.json" ]; then
    if [ -s "package.json" ]; then
        print_status 0 "package.json exists and has content"
        
        # Check if dependencies are installed
        if [ -d "node_modules" ]; then
            print_status 0 "Dependencies installed"
        else
            print_status 1 "Dependencies not installed (run: npm install)"
            OVERALL_SUCCESS=1
        fi
    else
        print_status 1 "package.json exists but is empty (needs to be populated)"
        OVERALL_SUCCESS=1
    fi
else
    print_status 1 "package.json not found"
    OVERALL_SUCCESS=1
fi

# Check GitHub workflows
print_info "Checking GitHub workflows..."
if [ -d ".github/workflows" ]; then
    WORKFLOW_COUNT=$(find .github/workflows -name "*.yml" | wc -l)
    print_status 0 "GitHub workflows directory exists ($WORKFLOW_COUNT workflow files)"
else
    print_status 1 "GitHub workflows directory not found"
    OVERALL_SUCCESS=1
fi

# Check tools directory
print_info "Checking tools directory..."
if [ -d "tools" ]; then
    TOOL_COUNT=$(find tools -name "*.js" | wc -l)
    POPULATED_TOOLS=$(find tools -name "*.js" -size +0c | wc -l)
    if [ "$POPULATED_TOOLS" -gt 0 ]; then
        print_status 0 "Tools directory exists ($POPULATED_TOOLS/$TOOL_COUNT tool files populated)"
    else
        print_status 1 "Tools directory exists but files are empty ($TOOL_COUNT files need content)"
        OVERALL_SUCCESS=1
    fi
else
    print_status 1 "Tools directory not found"
    OVERALL_SUCCESS=1
fi

# Check projects directory
print_info "Checking projects directory..."
if [ -d "projects" ]; then
    PROJECT_COUNT=$(find projects -maxdepth 1 -type d | tail -n +2 | wc -l)
    if [ "$PROJECT_COUNT" -gt 0 ]; then
        print_status 0 "Projects directory exists ($PROJECT_COUNT project directories)"
        
        # List projects
        echo "   Projects found:"
        find projects -maxdepth 1 -type d | tail -n +2 | while read -r dir; do
            echo "   - $(basename "$dir")"
        done
    else
        print_warning "Projects directory exists but is empty (will be populated during migration)"
    fi
else
    print_warning "Projects directory not found (will be created during setup)"
fi

# Check scripts directory (existing structure)
print_info "Checking existing scripts directory..."
if [ -d "scripts" ]; then
    SCRIPT_SERVICES=$(find scripts -maxdepth 1 -type d | tail -n +2 | wc -l)
    print_status 0 "Existing scripts directory found ($SCRIPT_SERVICES service directories)"
    
    # Count total .gs files
    TOTAL_GS_FILES=$(find scripts -name "*.gs" | wc -l)
    echo "   Total .gs files to migrate: $TOTAL_GS_FILES"
else
    print_warning "No existing scripts directory found"
fi

echo ""
echo "🔧 Phase 3: Configuration Check"
echo "================================"

# Check clasp credentials file
print_info "Checking clasp credentials..."
if [ -f "$HOME/.clasprc.json" ]; then
    print_status 0 "clasp credentials file exists"
    
    # Check if it contains required fields
    if grep -q "access_token" "$HOME/.clasprc.json" && grep -q "refresh_token" "$HOME/.clasprc.json"; then
        print_status 0 "Credentials file has required tokens"
    else
        print_status 1 "Credentials file missing required tokens"
        OVERALL_SUCCESS=1
    fi
else
    print_status 1 "clasp credentials file not found (run: clasp login)"
    OVERALL_SUCCESS=1
fi

echo ""
echo "🧪 Phase 4: Functional Tests"
echo "============================="

# Test clasp list command
print_info "Testing clasp connectivity..."
if clasp list &> /dev/null; then
    print_status 0 "Can connect to Google Apps Script API"
else
    print_status 1 "Cannot connect to Google Apps Script API"
    OVERALL_SUCCESS=1
fi

echo ""
echo "🌐 Phase 5: Setup Requirements"
echo "==============================="

print_info "Required setup steps:"
echo ""

# Check what needs to be done
if [ ! -s "package.json" ]; then
    echo "❓ NEEDED: Populate package.json with project configuration"
fi

if [ ! -s "tools/deploy-tools.js" ]; then
    echo "❓ NEEDED: Populate deployment tools with automation scripts"
fi

if [ ! -d "node_modules" ]; then
    echo "❓ NEEDED: Install dependencies (npm install)"
fi

PROJECTS_POPULATED=$(find projects -name "*.gs" 2>/dev/null | wc -l)
if [ "$PROJECTS_POPULATED" -eq 0 ]; then
    echo "❓ NEEDED: Migrate existing scripts to new project structure"
fi

echo ""
echo "🔐 GitHub Secrets Setup:"
echo "   1. Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//' 2>/dev/null || echo 'YOUR-USERNAME/workspace-automation')/settings/secrets/actions"
echo "   2. Create secret named: CLASP_CREDENTIALS"
echo "   3. Content should be:"
echo ""
if [ -f "$HOME/.clasprc.json" ]; then
    echo "   Copy this content to GitHub Secrets:"
    echo "   =================================="
    cat "$HOME/.clasprc.json"
    echo "   =================================="
else
    print_status 1 "Cannot show credentials - file not found"
    OVERALL_SUCCESS=1
fi

echo ""
echo "📊 Verification Summary"
echo "======================="

if [ $OVERALL_SUCCESS -eq 0 ]; then
    echo -e "${GREEN}🎉 Setup verification PASSED!${NC}"
    echo ""
    echo "Your workspace automation setup appears to be working correctly."
    echo "You can proceed with:"
    echo "  1. Setting up your project configurations"
    echo "  2. Migrating existing scripts"
    echo "  3. Testing the deployment pipeline"
    echo ""
    echo "Next steps:"
    if [ ! -s "package.json" ]; then
        echo "  1. Populate package.json"
    fi
    if [ ! -s "tools/deploy-tools.js" ]; then
        echo "  2. Populate deployment tools"
    fi
    if [ ! -d "node_modules" ]; then
        echo "  3. Run: npm install"
    fi
    if [ "$PROJECTS_POPULATED" -eq 0 ]; then
        echo "  4. Run migration: npm run migrate"
    fi
    echo "  5. Test deployment: npm run status"
else
    echo -e "${RED}❌ Setup verification FAILED!${NC}"
    echo ""
    echo "Please address the issues marked with ❌ above and run this script again."
    echo ""
    echo "Common fixes:"
    echo "  npm install -g @google/clasp     # Install clasp"
    echo "  clasp login                      # Authenticate with Google"
    echo "  npm install                      # Install dependencies"
fi

echo ""
echo "🔗 Useful Links:"
echo "  Repository: $(git remote get-url origin 2>/dev/null || echo 'Not found')"
echo "  GitHub Actions: https://github.com/$(git remote get-url origin 2>/dev/null | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//' || echo 'unknown/unknown')/actions"
echo "  Apps Script: https://script.google.com/home"
echo "  API Settings: https://script.google.com/home/usersettings"

exit $OVERALL_SUCCESS