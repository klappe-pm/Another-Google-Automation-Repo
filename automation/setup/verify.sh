#!/bin/bash
set -euo pipefail

# Verify setup script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "Verifying setup..."
echo ""

# Check required files
echo "Checking required files..."
REQUIRED_FILES=(
    "package.json"
    ".gitignore"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$REPO_ROOT/$file" ]]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file missing${NC}"
        ((ERRORS++))
    fi
done

# Check project structure
echo ""
echo "Checking project structure..."
REQUIRED_DIRS=(
    "apps"
    "automation"
    "docs"
    "config"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ -d "$REPO_ROOT/$dir" ]]; then
        echo -e "${GREEN}✓ $dir/${NC}"
    else
        echo -e "${RED}✗ $dir/ missing${NC}"
        ((ERRORS++))
    fi
done

# Check for .clasp.json files
echo ""
echo "Checking project configurations..."
PROJECT_COUNT=0
for project_dir in "$REPO_ROOT/apps"/*; do
    if [[ -d "$project_dir" ]]; then
        PROJECT_NAME=$(basename "$project_dir")
        if [[ -f "$project_dir/.clasp.json" ]]; then
            echo -e "${GREEN}✓ $PROJECT_NAME has .clasp.json${NC}"
            ((PROJECT_COUNT++))
        else
            echo -e "${YELLOW}⚠️  $PROJECT_NAME missing .clasp.json${NC}"
            ((WARNINGS++))
        fi
    fi
done

echo "Found $PROJECT_COUNT configured projects"

# Check npm scripts
echo ""
echo "Checking npm scripts..."
NPM_SCRIPTS=(
    "lint:fix"
    "deploy"
    "setup"
)

for script in "${NPM_SCRIPTS[@]}"; do
    if npm run | grep -q "$script"; then
        echo -e "${GREEN}✓ npm run $script${NC}"
    else
        echo -e "${YELLOW}⚠️  npm run $script not found${NC}"
        ((WARNINGS++))
    fi
done

# Summary
echo ""
echo "===================="
if [[ $ERRORS -eq 0 ]]; then
    if [[ $WARNINGS -eq 0 ]]; then
        echo -e "${GREEN}✅ All checks passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Setup verified with $WARNINGS warnings${NC}"
    fi
else
    echo -e "${RED}❌ Setup verification failed with $ERRORS errors${NC}"
    exit 1
fi