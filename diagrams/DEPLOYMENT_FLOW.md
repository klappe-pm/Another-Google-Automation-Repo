# Deployment Flow Diagram

## Overview
This document visualizes the deployment pipeline from local development to Google Apps Script.

## Deployment Flow

```mermaid
flowchart LR
    A[Local Development] --> B{File Save}
    B --> C[fswatch detects change]
    C --> D[auto-sync-full.sh]
    D --> E[Git Commit]
    E --> F[Git Push to GitHub]
    F --> G{Deployment Method}
    
    G --> H[Local Deploy]
    G --> I[Cloud Build]
    
    H --> J[deploy-local.sh]
    I --> K[cloudbuild.yaml]
    
    J --> L[clasp push]
    K --> M[Docker Container]
    M --> N[clasp push]
    
    L --> O[Google Apps Script]
    N --> O
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style O fill:#9f9,stroke:#333,stroke-width:2px
    style G fill:#ff9,stroke:#333,stroke-width:2px
```

## Detailed Process Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant FS as File System
    participant Watch as fswatch
    participant Sync as auto-sync-full.sh
    participant Git as Git Repository
    participant GH as GitHub
    participant CB as Cloud Build
    participant GAS as Google Apps Script
    
    Dev->>FS: Save .gs file
    Watch->>Watch: Detect change
    Watch->>Sync: Trigger handler
    Sync->>Sync: Wait 10 seconds
    Sync->>Git: git add apps/
    Sync->>Git: git commit -m "auto: update"
    Sync->>GH: git push origin main
    
    alt Local Deployment
        Sync->>Sync: Run deploy-local.sh
        Sync->>GAS: clasp push --force
    else Cloud Build
        GH->>CB: Trigger build
        CB->>CB: Run cloudbuild.yaml
        CB->>GAS: clasp push --force
    end
    
    GAS-->>Dev: Scripts updated
```

## Component Details

### File Watcher (`fswatch`)
- Monitors: `*.gs`, `*.json`, `*.html`, `*.js` files
- Excludes: `.git`, `node_modules`, `*.log`
- Location: `/apps` directory

### Auto-sync Script
- **Debounce**: 10-second delay after last change
- **Actions**: 
  1. Stage changes
  2. Create descriptive commit
  3. Push to GitHub
  4. Deploy to Apps Script

### Deployment Methods

#### Local Deployment (Current)
- Uses `deploy-local.sh`
- Requires local clasp authentication
- Direct push to Google Apps Script

#### Cloud Build (Future)
- Uses `cloudbuild.yaml`
- Runs in Google Cloud
- Requires fixing Docker permissions

## Error Handling

```mermaid
flowchart TD
    A[Deployment Start] --> B{Check Auth}
    B -->|Failed| C[Log Error]
    B -->|Success| D{Deploy Project}
    D -->|Failed| E[Log & Continue]
    D -->|Success| F[Update Counter]
    F --> G{More Projects?}
    G -->|Yes| D
    G -->|No| H[Generate Report]
    H --> I{All Success?}
    I -->|Yes| J[Exit 0]
    I -->|No| K[Exit 1]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#9f9,stroke:#333,stroke-width:2px
    style K fill:#f99,stroke:#333,stroke-width:2px
```

## Deployment Status Indicators

| Symbol | Meaning |
|--------|---------|
| 🚀 | Deployment starting |
| ✅ | Deployment successful |
| ❌ | Deployment failed |
| ⚠️ | Warning/Skipped |
| 📦 | Processing project |
| 🔐 | Authentication check |
| 📊 | Summary report |