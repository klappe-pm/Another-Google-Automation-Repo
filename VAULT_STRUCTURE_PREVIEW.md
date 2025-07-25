# Vault Structure Preview - Post-Reorganization

## High-Level Folder Structure

```
Workspace-Automation/
├── README.md
├── LICENSE.md
├── package.json
├── .gitignore
│
├── apps/                    # Google Apps Script projects
├── automation/              # Deployment & sync scripts  
├── config/                  # Configuration files
├── diagrams/               # Architecture & structure diagrams
├── docs/                   # Documentation
├── reports/                # Generated reports
├── tools/                  # Development utilities
└── archive/                # Backup & legacy files
```

## Detailed Folder Structure with File Counts

```mermaid
graph TD
    Root[Workspace Automation<br/>8 root files] --> Apps[apps/<br/>99 scripts total]
    Root --> Auto[automation/<br/>6 scripts]
    Root --> Config[config/<br/>4 files]
    Root --> Diagrams[diagrams/<br/>4 diagrams]
    Root --> Docs[docs/<br/>15+ files]
    Root --> Reports[reports/<br/>ongoing]
    Root --> Tools[tools/<br/>15 utilities]
    Root --> Archive[archive/<br/>legacy files]
    
    Apps --> A1[calendar/src/<br/>5 scripts]
    Apps --> A2[chat/src/<br/>1 script]
    Apps --> A3[docs/src/<br/>6 scripts]
    Apps --> A4[drive/src/<br/>26 scripts]
    Apps --> A5[gmail/src/<br/>47 scripts]
    Apps --> A6[photos/src/<br/>1 script]
    Apps --> A7[sheets/src/<br/>9 scripts]
    Apps --> A8[slides/src/<br/>0 scripts]
    Apps --> A9[tasks/src/<br/>3 scripts]
    Apps --> A10[utility/src/<br/>1 script]
    
    style Root fill:#e1f5fe
    style Apps fill:#fff3e0
    style Auto fill:#f3e5f5
    style Config fill:#e8f5e9
    style Diagrams fill:#fce4ec
```

## File Distribution by Type

```mermaid
pie title Repository File Distribution
    "Apps Script (.gs)" : 99
    "Shell Scripts (.sh)" : 15
    "Markdown Docs (.md)" : 30
    "JSON Config (.json)" : 10
    "YAML Config (.yaml)" : 4
    "Web Files (.html)" : 1
    "Other" : 5
```

## Apps Folder Deep Dive

```mermaid
graph LR
    subgraph "Gmail Scripts (47 files)"
        G1[Export Functions<br/>9 scripts] 
        G2[Analysis Tools<br/>7 scripts]
        G3[Label Management<br/>15 scripts]
        G4[Utility Tools<br/>4 scripts]
        G5[Legacy Scripts<br/>12 scripts]
    end
    
    subgraph "Drive Scripts (26 files)"
        D1[Indexing<br/>8 scripts]
        D2[YAML Management<br/>6 scripts]
        D3[Notes & Docs<br/>7 scripts]
        D4[Utilities<br/>5 scripts]
    end
    
    subgraph "Other Services (26 files)"
        O1[Calendar<br/>5 scripts]
        O2[Sheets<br/>9 scripts]
        O3[Docs<br/>6 scripts]
        O4[Tasks<br/>3 scripts]
        O5[Chat/Photos/Utility<br/>3 scripts]
    end
```

## Key Improvements from Reorganization

1. **Flatter Structure**: Maximum 3 levels deep (was 5+)
2. **Clear Categories**: Each folder has a specific purpose
3. **No Hidden Folders**: All folders visible (except .git, .gitignore)
4. **Gmail Simplified**: From 10+ subdirectories to 1 flat src/ folder
5. **Root Cleaned**: From 20+ files to 8 essential files

## File Naming Patterns

```mermaid
graph TD
    Pattern["{service}-{action}-{target}.gs"] --> Ex1[gmail-export-pdf.gs]
    Pattern --> Ex2[calendar-analysis-duration.gs]
    Pattern --> Ex3[drive-index-files.gs]
    Pattern --> Ex4[sheets-create-markdown.gs]
    Pattern --> Ex5[tasks-export-obsidian.gs]
    
    style Pattern fill:#ffeb3b
```