#!/bin/bash
set -euo pipefail

# Master setup script for Google Workspace Automation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Google Workspace Automation Setup${NC}"
echo "=================================="
echo ""

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Install dependencies
echo ""
echo -e "${YELLOW}Installing npm dependencies...${NC}"
cd "$REPO_ROOT"
if npm install; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Check clasp
echo ""
echo -e "${YELLOW}Checking clasp...${NC}"
if command -v clasp &> /dev/null; then
    CLASP_VERSION=$(clasp --version)
    echo -e "${GREEN}✓ clasp installed: $CLASP_VERSION${NC}"
else
    echo -e "${YELLOW}Installing clasp globally...${NC}"
    if npm install -g @google/clasp; then
        echo -e "${GREEN}✓ clasp installed${NC}"
    else
        echo -e "${RED}✗ Failed to install clasp${NC}"
        exit 1
    fi
fi

# Setup git hooks
echo ""
echo -e "${YELLOW}Setting up git hooks...${NC}"
GIT_HOOKS_DIR="$REPO_ROOT/.git/hooks"
if [[ -d "$GIT_HOOKS_DIR" ]]; then
    # Link pre-commit hook
    if [[ -f "$REPO_ROOT/.githooks/pre-commit" ]]; then
        ln -sf "$REPO_ROOT/.githooks/pre-commit" "$GIT_HOOKS_DIR/pre-commit"
        chmod +x "$GIT_HOOKS_DIR/pre-commit"
        echo -e "${GREEN}✓ Pre-commit hook installed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Git hooks directory not found${NC}"
fi

# Create necessary directories
echo ""
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p "$REPO_ROOT/logs"
mkdir -p "$REPO_ROOT/temp"
echo -e "${GREEN}✓ Directories created${NC}"

# Check authentication
echo ""
echo -e "${YELLOW}Checking Google authentication...${NC}"
if clasp login --status &> /dev/null; then
    echo -e "${GREEN}✓ Already authenticated with Google${NC}"
else
    echo -e "${YELLOW}You need to authenticate with Google${NC}"
    echo "Run: clasp login"
fi

# Verify setup
echo ""
echo -e "${YELLOW}Verifying setup...${NC}"
"$SCRIPT_DIR/verify.sh"

echo ""
echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run 'clasp login' if not authenticated"
echo "  2. Run 'npm run deploy -p <project>' to deploy a project"
echo "  3. Run 'npm run lint:fix' to fix linting issues"
echo ""