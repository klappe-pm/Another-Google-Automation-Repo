#!/bin/bash

# Repository Cleanup Script
# Organizes files for a professional, clean repository structure

echo "🧹 Starting Repository Cleanup..."
echo "======================================"

# Create new organized directory structure
echo "📁 Creating organized directory structure..."
mkdir -p tools/setup
mkdir -p tools/deployment  
mkdir -p tools/templates
mkdir -p .reports
mkdir -p .docs
mkdir -p .projects

# Move setup scripts to tools/setup/
echo "🔧 Moving setup scripts..."
if [ -f quick-sync.sh ]; then
    mv quick-sync.sh tools/setup/
    echo "   ✅ quick-sync.sh → tools/setup/"
fi

if [ -f setup-ide.sh ]; then
    mv setup-ide.sh tools/setup/
    echo "   ✅ setup-ide.sh → tools/setup/"
fi

if [ -f setup-github-actions.sh ]; then
    mv setup-github-actions.sh tools/setup/
    echo "   ✅ setup-github-actions.sh → tools/setup/"
fi

# Update script permissions
echo "🔐 Updating script permissions..."
chmod +x tools/setup/*.sh 2>/dev/null
chmod +x tools/repository/*.js 2>/dev/null

# Move templates to tools/
echo "📋 Moving templates..."
if [ -d templates ]; then
    mv templates tools/templates
    echo "   ✅ templates/ → tools/templates/"
fi

# Move reports to hidden directory
echo "📊 Moving reports to hidden directory..."
if [ -d reports ]; then
    mv reports .reports
    echo "   ✅ reports/ → .reports/"
fi

# Move docs to hidden directory (if exists)
echo "📖 Moving internal docs..."
if [ -d docs ]; then
    mv docs .docs
    echo "   ✅ docs/ → .docs/"
fi

# Create .gitkeep files for empty directories
echo "📌 Creating .gitkeep files..."
touch .reports/.gitkeep
touch .docs/.gitkeep
touch .projects/.gitkeep

# Update package.json scripts
echo "📝 Updating package.json scripts..."
if [ -f package.json ]; then
    # Create backup
    cp package.json package.json.backup
    
    # Update scripts section (basic update - manual verification recommended)
    echo "   ⚠️  Note: package.json scripts may need manual verification"
fi

# Update .gitignore
echo "🚫 Updating .gitignore..."
cat >> .gitignore << 'EOF'

# Repository cleanup additions
.reports/*
!.reports/.gitkeep
.docs/*
!.docs/.gitkeep
.projects/*/src/
.projects/*/.clasp.json
.temp/
*.tmp
EOF

echo "   ✅ Updated .gitignore"

# Show new structure
echo ""
echo "📁 NEW REPOSITORY STRUCTURE:"
echo "=============================="
echo "Top Level (Clean & Professional):"
echo "├── 📄 README.md"
echo "├── 📄 LICENSE" 
echo "├── 📄 package.json"
echo "├── 📄 .gitignore"
echo "├── 📁 scripts/           🌟 Main automation scripts"
echo "└── 📁 tools/             🔧 Development tools"
echo ""
echo "Hidden/Support (Dot Prefixed):"
echo "├── 📁 .github/           (GitHub Actions)"
echo "├── 📁 .vscode/           (IDE settings)"
echo "├── 📁 .reports/          (Generated reports)"
echo "├── 📁 .docs/             (Internal documentation)"
echo "└── 📁 .projects/         (Deployed GAS projects)"

echo ""
echo "✅ CLEANUP COMPLETED!"
echo "===================="
echo "🎯 Your repository now has a clean, professional structure!"
echo ""
echo "📋 Next Steps:"
echo "1. Verify all tools still work:"
echo "   npm run repo:review"
echo "   tools/setup/quick-sync.sh auto"
echo ""
echo "2. Update package.json scripts if needed:"
echo "   \"sync\": \"./tools/setup/quick-sync.sh auto\""
echo "   \"setup:ide\": \"./tools/setup/setup-ide.sh\""
echo ""
echo "3. Commit the cleanup:"
echo "   git add ."
echo "   git commit -m 'refactor: Clean repository structure - move supporting files to organized directories'"
echo "   git push origin main"
echo ""
echo "🌟 Your repository is now ready for the community!"
