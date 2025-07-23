#!/bin/bash
set -euo pipefail

# Error trap for better debugging
trap 'echo "Error: $BASH_SOURCE:$LINENO"; exit 1' ERR

# Workspace Automation - Git Initialization Script
# This script initializes the Git repository and creates the first commit

echo "🚀 Initializing Git repository for Workspace Automation..."

# Navigate to the repository directory
cd "/Users/kevinlappe/Documents/GitHub/Workspace Automation" || exit 1

# Initialize Git repository
echo "📦 Initializing Git repository..."
git init

# Set default branch to main
echo "🌿 Setting default branch to main..."
git branch -M main

# Configure Git user (you may want to verify these settings)
echo "👤 Configuring Git user settings..."
git config user.name "Kevin Lappe"
git config user.email "kevin@averageintelligence.ai"

# Add all files to staging
echo "📁 Adding files to staging area..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "🎉 Initial commit: Workspace Automation Suite

- Add 80+ Google Apps Script automation tools
- Organize scripts by Google Workspace service
- Include comprehensive documentation and README files
- Set up GitHub Actions for code quality checks
- Add contributing guidelines and issue templates
- Configure repository with proper Git attributes

Services included:
- Gmail (28 scripts): Email management and analysis
- Drive (23 scripts): File organization and processing  
- Calendar (5 scripts): Event export and analysis
- Docs (6 scripts): Document conversion and formatting
- Sheets (6 scripts): Data automation and indexing
- Tasks (3 scripts): Task export and integration
- Chat (1 script): Message export and analysis
- Slides (0 scripts): Prepared for future development

Repository features:
- Consistent naming conventions
- Standardized script headers
- Comprehensive error handling
- Performance optimization
- Security best practices
- MIT License"

echo "✅ Git repository initialized successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add remote origin: git remote add origin <your-github-repo-url>"
echo "3. Push to GitHub: git push -u origin main"
echo ""
echo "🔗 To connect to GitHub:"
echo "   git remote add origin https://github.com/yourusername/workspace-automation.git"
echo "   git push -u origin main"
echo ""
echo "📊 Repository statistics:"
git log --oneline | wc -l | xargs echo "Commits:"
git ls-files | wc -l | xargs echo "Files tracked:"
echo "Repository size:" && du -sh .git
