# Deployment Flow

## CI/CD Pipeline Flow

```mermaid
flowchart TD
    Start([Developer Push]) --> GH{GitHub}
    GH -->|main branch| GHA[GitHub Actions]
    GH -->|other branch| End1([No Action])
    
    GHA --> Auth[Authenticate to GCP]
    Auth --> CB[Submit Cloud Build]
    
    CB --> Validate{Validate Build}
    Validate -->|Invalid| Fail1[Build Failed]
    Validate -->|Valid| Docker[Pull Docker Image]
    
    Docker --> Setup[Setup Environment]
    Setup --> NPM[Install Dependencies]
    NPM --> Creds[Fetch Credentials]
    
    Creds --> ClaspAuth[Authenticate Clasp]
    ClaspAuth -->|Failed| Fail2[Auth Failed]
    ClaspAuth -->|Success| Deploy[Deploy Projects]
    
    Deploy --> Loop{For Each Project}
    Loop -->|Next| Check{Check .clasp.json}
    Check -->|Missing| Skip[Skip Project]
    Check -->|Found| Push[Clasp Push]
    
    Push -->|Success| Count1[Success++]
    Push -->|Failed| Count2[Failed++]
    
    Skip --> Loop
    Count1 --> Loop
    Count2 --> Loop
    
    Loop -->|Done| Summary[Generate Summary]
    Summary --> Status{All Success?}
    
    Status -->|Yes| Success[Build Success]
    Status -->|No| Fail3[Build Failed]
    
    Success --> Notify1[Update GitHub Status]
    Fail1 --> Notify2[Update GitHub Status]
    Fail2 --> Notify2
    Fail3 --> Notify2
    
    Notify1 --> End2([Deployment Complete])
    Notify2 --> End3([Deployment Failed])
```

## Local Deployment Flow

```mermaid
flowchart LR
    Start([Run deploy-local.sh]) --> Check{Check Arguments}
    Check -->|No Args| All[Deploy All Projects]
    Check -->|Project Name| Single[Deploy Single Project]
    
    All --> List[List All Projects]
    Single --> Validate{Valid Project?}
    
    Validate -->|No| Error1[Invalid Project]
    Validate -->|Yes| Deploy1[Deploy Project]
    
    List --> Loop{For Each Project}
    Loop --> Deploy2[Deploy Project]
    
    Deploy1 --> Log1[Log Result]
    Deploy2 --> Log2[Log Result]
    
    Log1 --> End1([Complete])
    Log2 --> Loop
    Loop -->|Done| Summary[Show Summary]
    Summary --> End2([Complete])
    Error1 --> End3([Exit with Error])
```

## Manual Deployment Flow

```mermaid
stateDiagram-v2
    [*] --> Setup: Initialize
    Setup --> Authenticate: clasp login
    
    Authenticate --> SelectProject: Choose project
    SelectProject --> CheckFiles: Verify files
    
    CheckFiles --> Ready: Files valid
    CheckFiles --> FixFiles: Files missing
    
    FixFiles --> CheckFiles: Retry
    
    Ready --> Deploy: clasp push
    Deploy --> Success: Deployment successful
    Deploy --> Failed: Deployment failed
    
    Success --> [*]
    Failed --> Troubleshoot: Check errors
    Troubleshoot --> FixIssues: Resolve issues
    FixIssues --> Deploy: Retry
```

## Auto-Sync Deployment Flow

```mermaid
flowchart TD
    Start([File System Watcher]) --> Watch{Monitor apps/}
    Watch -->|File Changed| Debounce[Debounce 2s]
    Watch -->|No Change| Watch
    
    Debounce --> Check{Check File Type}
    Check -->|.gs/.json| Process[Process Change]
    Check -->|Other| Ignore[Ignore]
    
    Ignore --> Watch
    Process --> Project[Identify Project]
    
    Project --> Queue[Add to Queue]
    Queue --> Batch{Batch Changes}
    
    Batch -->|Timeout| Deploy[Deploy Project]
    Batch -->|More Changes| Queue
    
    Deploy --> Log[Log Deployment]
    Log --> Notify[Send Notification]
    Notify --> Watch
```

## Deployment Sequence Diagram

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant FS as File System
    participant Git as Git Repository
    participant GH as GitHub
    participant GHA as GitHub Actions
    participant CB as Cloud Build
    participant SM as Secret Manager
    participant GAS as Google Apps Script
    
    Dev->>FS: Save changes
    Dev->>Git: git commit
    Dev->>GH: git push
    
    GH->>GHA: Trigger workflow
    GHA->>GHA: Check branch
    GHA->>GHA: Authenticate to GCP
    GHA->>CB: Submit build
    
    CB->>SM: Fetch credentials
    SM-->>CB: Return clasp auth
    CB->>CB: Setup environment
    CB->>CB: Install dependencies
    
    loop For each project
        CB->>CB: Check .clasp.json
        CB->>GAS: clasp push
        GAS-->>CB: Deployment result
    end
    
    CB->>CB: Generate summary
    CB-->>GHA: Build status
    GHA-->>GH: Update commit status
    GH-->>Dev: Notification
```

## Error Handling Flow

```mermaid
flowchart TD
    A[Deployment Start] --> B{Check Auth}
    B -->|Failed| C[Log Auth Error]
    B -->|Success| D{Check Projects}
    
    D -->|No Projects| E[Log Warning]
    D -->|Projects Found| F[Start Deployment]
    
    F --> G{Deploy Project}
    G -->|Success| H[Update Success Count]
    G -->|Failed| I[Update Failed Count]
    
    H --> J{More Projects?}
    I --> J
    J -->|Yes| G
    J -->|No| K[Generate Report]
    
    K --> L{Check Results}
    L -->|All Success| M[Exit Success]
    L -->|Some Failed| N[Exit with Error]
    
    C --> O[Exit with Error]
    E --> P[Exit with Warning]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style M fill:#9f9,stroke:#333,stroke-width:2px
    style N fill:#f99,stroke:#333,stroke-width:2px
    style O fill:#f99,stroke:#333,stroke-width:2px
    style P fill:#ff9,stroke:#333,stroke-width:2px
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
| 🔧 | Setup/Configuration |
| 📥 | Installing dependencies |
| 🎉 | All deployments successful |