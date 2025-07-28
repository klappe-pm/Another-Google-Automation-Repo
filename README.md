# Multi-Agent Workspace Automation Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/klappe-pm/another-google-automation-repo/workflows/CI/badge.svg)](https://github.com/klappe-pm/another-google-automation-repo/actions)
[![Code Coverage](https://img.shields.io/badge/Coverage-70%25-yellow)](docs/reports/)
[![Documentation](https://img.shields.io/badge/Docs-95%25-brightgreen)](docs/)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Agents: 5](https://img.shields.io/badge/Agents-5-blue)](agents/)
[![Services: 10](https://img.shields.io/badge/Services-10-green)](apps/)
[![Scripts: 148](https://img.shields.io/badge/Scripts-148-orange)](docs/catalogs/SCRIPT_CATALOG.md)

An enterprise-grade multi-agent development framework for Google Workspace automation, featuring intelligent agents that collaborate to analyze, design, implement, and maintain automation solutions across Gmail, Drive, Docs, Sheets, Calendar, and more.

## Overview

The Multi-Agent Workspace Automation Framework represents a paradigm shift from traditional script collections to an intelligent, collaborative system where specialized AI agents work together to deliver enterprise-grade automation solutions.

### 🤖 Multi-Agent Architecture

Our framework employs **5 specialized agents** that collaborate to provide comprehensive automation capabilities:

- **🔍 Project Evaluator** - Analyzes project evolution and strategic goals
- **📊 Data Synthesizer** - Aggregates metrics and identifies optimization opportunities  
- **🏗️ Solution Designer** - Architects scalable automation solutions
- **💡 Code Advisor** - Assesses technical debt and recommends improvements
- **📚 Documenter** - Ensures comprehensive documentation and knowledge management

### 🎯 Enterprise Features

- **148 Production Scripts** across 10 Google Workspace services
- **100% Standardization** with automated quality enforcement
- **Multi-Agent Intelligence** for continuous optimization
- **Real-time Monitoring** with comprehensive metrics
- **Automated Deployment** with 5-minute CI/CD pipeline
- **Enterprise Security** with comprehensive scanning and validation

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```yaml
# docker-compose.yml
version: '3.8'
services:
  communication-orchestrator:
    image: workspace-automation/co:latest
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - AGENT_DISCOVERY_ENABLED=true
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs

  project-evaluator:
    image: workspace-automation/agent-pe:latest
    environment:
      - AGENT_ROLE=project-evaluator
      - CO_ENDPOINT=http://communication-orchestrator:8080
    depends_on:
      - communication-orchestrator

  data-synthesizer:
    image: workspace-automation/agent-ds:latest
    environment:
      - AGENT_ROLE=data-synthesizer
      - CO_ENDPOINT=http://communication-orchestrator:8080
    depends_on:
      - communication-orchestrator

  solution-designer:
    image: workspace-automation/agent-sd:latest
    environment:
      - AGENT_ROLE=solution-designer
      - CO_ENDPOINT=http://communication-orchestrator:8080
    depends_on:
      - communication-orchestrator

  code-advisor:
    image: workspace-automation/agent-ca:latest
    environment:
      - AGENT_ROLE=code-advisor
      - CO_ENDPOINT=http://communication-orchestrator:8080
    depends_on:
      - communication-orchestrator

  documenter:
    image: workspace-automation/agent-doc:latest
    environment:
      - AGENT_ROLE=documenter
      - CO_ENDPOINT=http://communication-orchestrator:8080
    depends_on:
      - communication-orchestrator
```

**Start the framework:**
```bash
docker-compose up -d
```

### Option 2: Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: workspace-automation-stack
spec:
  replicas: 1
  selector:
    matchLabels:
      app: workspace-automation
  template:
    metadata:
      labels:
        app: workspace-automation
    spec:
      containers:
      - name: communication-orchestrator
        image: workspace-automation/co:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
      - name: project-evaluator
        image: workspace-automation/agent-pe:latest
        env:
        - name: CO_ENDPOINT
          value: "http://localhost:8080"
      - name: data-synthesizer
        image: workspace-automation/agent-ds:latest
        env:
        - name: CO_ENDPOINT
          value: "http://localhost:8080"
      - name: solution-designer
        image: workspace-automation/agent-sd:latest
        env:
        - name: CO_ENDPOINT
          value: "http://localhost:8080"
      - name: code-advisor
        image: workspace-automation/agent-ca:latest
        env:
        - name: CO_ENDPOINT
          value: "http://localhost:8080"
      - name: documenter
        image: workspace-automation/agent-doc:latest
        env:
        - name: CO_ENDPOINT
          value: "http://localhost:8080"
---
apiVersion: v1
kind: Service
metadata:
  name: workspace-automation-service
spec:
  selector:
    app: workspace-automation
  ports:
  - port: 8080
    targetPort: 8080
  type: LoadBalancer
```

**Deploy to Kubernetes:**
```bash
kubectl apply -f k8s-deployment.yaml
```

### Option 3: Local Development Setup

## Requirements

- Node.js 18 or later
- Google account with appropriate permissions
- clasp CLI tool
- Git

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/workspace-automation.git
cd workspace-automation

# Install dependencies
npm install

# Authenticate with Google
npx clasp login
```

## Usage

### Deploy All Scripts
```bash
./automation/deployment/scripts/deploy-local.sh
```

### Deploy Specific Service
```bash
./automation/deployment/scripts/deploy-local.sh gmail
./automation/deployment/scripts/deploy-local.sh drive
```

### File Watcher (Auto-deployment)
```bash
# Start in foreground
./automation/utilities/git-automation/sync-control.sh start

# Start in background
./automation/utilities/git-automation/sync-control.sh start-background

# Check status
./automation/utilities/git-automation/sync-control.sh status

# Stop
./automation/utilities/git-automation/sync-control.sh stop
```

## 🗺️ Repository Structure

```
workspace-automation/
├── agents/                  # Multi-agent analysis framework
│   ├── project-evaluator/  # Strategic project analysis
│   ├── data-synthesizer/   # Metrics aggregation & insights
│   ├── solution-designer/  # Architecture & design solutions
│   ├── code-advisor/       # Technical debt assessment
│   └── documenter/         # Documentation automation
├── apps/                   # Google Apps Script services (10 services)
│   ├── calendar/          # Calendar automation (1 script)
│   ├── chat/              # Chat integration (0 scripts - beta)
│   ├── docs/              # Document processing (9 scripts)
│   ├── drive/             # File management (47 scripts)
│   ├── gmail/             # Email automation (64 scripts)
│   ├── photos/            # Photo management (0 scripts - beta)
│   ├── sheets/            # Spreadsheet utilities (21 scripts)
│   ├── slides/            # Presentation tools (0 scripts - beta)
│   ├── tasks/             # Task management (2 scripts)
│   ├── utility/           # Helper functions (4 scripts)
│   └── shared/            # Common utilities & frameworks
├── automation/            # CI/CD and development tools
│   ├── deployment/        # Deployment scripts & configs
│   ├── fixers/           # Code quality automation
│   ├── precommit/        # Git hooks & validation
│   ├── reports/          # Automated reporting
│   ├── tools/            # Development utilities
│   ├── utilities/        # Build & deployment helpers
│   └── validation/       # Code & security validation
├── config/               # Configuration management
│   ├── environments/     # Environment-specific configs
│   ├── templates/        # Code & config templates
│   └── project-mapping.json
├── docs/                 # Comprehensive documentation
│   ├── diagrams/         # Architecture & system diagrams
│   ├── reports/          # Analysis & status reports
│   ├── api/             # API documentation
│   ├── catalogs/        # Script & resource catalogs
│   ├── development/     # Development guides
│   ├── milestones/      # Project milestones
│   ├── security/        # Security documentation
│   ├── setup/           # Setup & configuration guides
│   └── standards/       # Coding & documentation standards
├── src/                  # Core JavaScript framework
│   ├── core/            # Base framework components
│   ├── services/        # Service layer implementations
│   ├── utils/           # Utility functions
│   └── workflows/       # Automated workflows
└── utils/               # Shared utility modules
    ├── array.js         # Array manipulation helpers
    ├── date.js          # Date & time utilities
    ├── string.js        # String processing functions
    └── validation.js    # Input validation helpers
```

## Development

### Naming Convention
Files use action-noun format:
- `export-labels.gs`
- `create-folders.gs`
- `analyze-data.gs`

Exception: Markdown operations use `markdown-` prefix.

### Required Header Format
```javascript
/**
 * Script Name: [filename without .gs]
 *
 * Script Summary:
 * [One-line description]
 *
 * Script Purpose:
 * - [Primary purpose]
 * - [Secondary purposes]
 *
 * Script Steps:
 * 1. [Step description]
 * 2. [Step description]
 *
 * Script Functions:
 * - functionName(): [Description]
 *
 * Script Helper Functions:
 * - _helperName(): [Description]
 *
 * Script Dependencies:
 * - [Dependencies or "None"]
 *
 * Google Services:
 * - ServiceName: [How used]
 */
```

### Code Standards
- Use `Logger.log()` not `console.log()`
- Handle errors with try-catch blocks
- Use batch operations for API calls
- Sort functions alphabetically
- Prefix helper functions with underscore

### Commit Requirements
All commits must pass these checks:
1. Valid JavaScript syntax
2. Proper comment format
3. Required headers present
4. No hardcoded secrets
5. Error handling implemented

## 📚 Documentation Hub

### 🎯 Getting Started
- [🚀 Setup Guide](docs/SETUP.md) - Complete installation and configuration
- [⚙️ Project Plan](PROJECT_PLAN.md) - Development roadmap and milestones
- [📋 Project Charter](PROJECT_CHARTER.md) - Vision, goals, and success metrics
- [🔧 Contributing Guide](docs/setup/CONTRIBUTING.md) - How to contribute to the project

### 🏗️ Architecture & Design
- [🔀 Multi-Agent Framework](docs/diagrams/MULTI_AGENT_FRAMEWORK.md) - Complete agent system architecture
- [🏛️ System Architecture](docs/diagrams/SYSTEM_ARCHITECTURE.md) - High-level system design
- [📊 Data Flow Diagrams](docs/diagrams/DATA_FLOW.md) - Information flow and processing
- [🗺️ Repository Structure](docs/diagrams/REPOSITORY_STRUCTURE.md) - Directory organization guide
- [🔄 Development Workflow](docs/diagrams/DEVELOPMENT_WORKFLOW.md) - Development and deployment processes

### 🤖 Agent Implementation
- [📖 Agent Implementation Guide](docs/diagrams/AGENT_IMPLEMENTATION_GUIDE.md) - Step-by-step agent creation
- [🎭 Specialized Agent Roles](docs/diagrams/SPECIALIZED_AGENT_ROLES.md) - Detailed agent specifications
- [🌟 Complete Agent Ecosystem](docs/diagrams/COMPLETE_AGENT_ECOSYSTEM.md) - Full system visualization
- [📈 Agent Implementation Summary](agents/AGENT_IMPLEMENTATION_SUMMARY.md) - Phase 1 completion report

### 📊 Reports & Analysis
- [📈 Framework Upgrade Status](docs/reports/framework-upgrade-status-2025-07-28.md) - Latest implementation progress
- [🔍 User Complexity Assessment](docs/reports/user-complexity-assessment-2025-07-28.md) - User experience analysis
- [⚠️ Breaking Changes Report](docs/reports/breaking-changes-2025-07-28.md) - Compatibility and migration guide
- [📊 Project Report](docs/reports/project-report-2025-07-27.md) - Comprehensive project status
- [🔍 Audit Report](docs/reports/audit-report.md) - Quality and compliance assessment

### 💻 Development Resources
- [📏 Coding Standards](docs/CODING_FOUNDATION.md) - Code style and best practices
- [🔒 Security Guidelines](docs/security/SECURITY_REVIEW.md) - Security standards and procedures
- [🧪 Testing Strategy](docs/TESTING_STRATEGY.md) - Testing approaches and frameworks
- [📋 Development Policies](docs/DEVELOPMENT_POLICIES.md) - Development rules and procedures
- [🔧 GAS Development Tools](docs/development/GAS_DEVELOPMENT_TOOLS.md) - Google Apps Script tooling

### 📖 API & Reference
- [🔑 API Permissions](docs/api/API_PERMISSIONS.md) - Required Google API permissions  
- [📚 Script Catalog](docs/catalogs/SCRIPT_CATALOG.md) - Complete script inventory
- [🛠️ Shell Script Catalog](docs/catalogs/SHELL_SCRIPT_CATALOG.md) - Automation script reference
- [📋 Foundation Requirements](docs/FOUNDATION_REQUIREMENTS.md) - Technical specifications

## Services

### Gmail (64 scripts)
Email management, label operations, export functions, bulk processing.

### Drive (47 scripts)
File management, folder operations, markdown processing, metadata handling.

### Sheets (21 scripts)
Data processing, import/export, formatting, report generation.

### Docs (9 scripts)
Document processing, content management, export functions.

### Utility (4 scripts)
Cross-service utilities, configuration management.

### Tasks (2 scripts)
Task management and export.

### Calendar (1 script)
Event analysis and export.

## License

MIT License - see [LICENSE](LICENSE) file.

## Contact

**Maintainer**: Kevin Lappe
**Repository**: https://github.com/klappe-pm/Another-Google-Automation-Repo