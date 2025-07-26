#!/bin/bash

# IDE Setup Script for VS Code, Cursor, and Windsurf
# Workspace Automation Repository

echo "🎨 Setting up IDE configuration for Google Apps Script development..."

# Create .vscode directory
mkdir -p .vscode

# Create workspace settings
cat > .vscode/settings.json << 'EOF'
{
  "files.associations": {
    "*.gs": "javascript"
  },
  "javascript.suggest.autoImports": false,
  "typescript.suggest.autoImports": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "git.autofetch": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/projects/*/.clasp.json": false,
    "**/projects/*/appsscript.json": false
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/projects/*/src": true
  },
  "emmet.includeLanguages": {
    "javascript": "html"
  },
  "javascript.preferences.includePackageJsonAutoImports": "off"
}
EOF

# Create extensions recommendations
cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "googleworkspace.workspace-extension",
    "ms-vscode.vscode-typescript-next", 
    "GitHub.copilot",
    "ms-vscode.remote-repositories",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
EOF

# Create tasks for deployment
cat > .vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🚀 Deploy All Projects",
      "type": "shell",
      "command": "npm",
      "args": ["run", "deploy"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "🧪 Deploy Beta Projects",
      "type": "shell", 
      "command": "npm",
      "args": ["run", "deploy-beta"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    },
    {
      "label": "📊 Check Deployment Status",
      "type": "shell",
      "command": "npm", 
      "args": ["run", "status"],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    },
    {
      "label": "🔄 Migrate Scripts to Projects",
      "type": "shell",
      "command": "npm",
      "args": ["run", "migrate"],
      "group": "build"
    },
    {
      "label": "✅ Validate All Projects",
      "type": "shell",
      "command": "npm",
      "args": ["run", "validate"],
      "group": "test"
    }
  ]
}
EOF

# Create launch configuration
cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "🚀 Deploy to Google Apps Script",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/tools/deploy-tools.js",
      "args": ["deploy-all", "public"],
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}"
    },
    {
      "name": "📊 Check Status Dashboard",
      "type": "node", 
      "request": "launch",
      "program": "${workspaceFolder}/tools/deploy-tools.js",
      "args": ["status"],
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}"
    },
    {
      "name": "🧪 Deploy Specific Project",
      "type": "node",
      "request": "launch", 
      "program": "${workspaceFolder}/tools/deploy-tools.js",
      "args": ["deploy", "${input:projectName}"],
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}"
    }
  ],
  "inputs": [
    {
      "id": "projectName",
      "description": "Enter project name (gmail, drive, calendar, etc.)",
      "default": "gmail",
      "type": "promptString"
    }
  ]
}
EOF

echo "✅ IDE configuration created!"
echo ""
echo "🎯 Next steps:"
echo "1. Open this folder in VS Code, Cursor, or Windsurf"
echo "2. Install recommended extensions when prompted"
echo "3. Use Ctrl+Shift+P → 'Tasks: Run Task' for quick deployment"
echo "4. Commit and push to enable GitHub Actions auto-sync"
echo ""
echo "🚀 Quick test:"
echo "   npm run status    # Check current deployment status"
echo "   npm run deploy    # Manual deployment"
echo ""
echo "📁 Your IDE is now optimized for Google Apps Script development!"
