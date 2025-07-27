#!/usr/bin/env bash
set -euo pipefail

# Setup Git Hooks for Google Apps Script Linting
# This script configures git to use the custom hooks directory

echo "🔧 Setting up Git hooks for GAS linting..."

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.githooks"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Make hooks executable
chmod +x "$HOOKS_DIR"/*

# Configure git to use our hooks directory
git config core.hooksPath "$HOOKS_DIR"

echo "✅ Git hooks configured successfully!"
echo ""
echo "📋 Hooks installed:"
echo "  - pre-commit: Runs GAS linter on staged files"
echo "  - post-commit: Updates script catalog"
echo ""
echo "💡 To disable hooks temporarily, run:"
echo "   git config --unset core.hooksPath"
echo ""
echo "🔄 To re-enable hooks, run this script again"