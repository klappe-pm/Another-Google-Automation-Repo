# User Flow Diagrams

## Developer Workflow

```mermaid
journey
    title Developer Daily Workflow
    section Morning Setup
      Open IDE: 5: Developer
      Pull Latest Changes: 5: Developer
      Check Build Status: 4: Developer
    section Development
      Write Code: 5: Developer
      Save File: 5: Developer
      Auto-sync Triggers: 5: System
      See Deployment Status: 4: Developer
    section Testing
      Run Local Tests: 4: Developer
      Check Apps Script: 3: Developer
      Fix Issues: 3: Developer
    section End of Day
      Commit Changes: 5: Developer
      Push to GitHub: 5: Developer
      Verify CI/CD: 4: Developer
```

## Gmail Automation User Flow

```mermaid
flowchart TD
    Start([User Opens Gmail Sheet]) --> Menu[Select Automation Menu]
    Menu --> Choice{Choose Function}
    
    Choice -->|Export Emails| Export[Configure Export]
    Choice -->|Analyze Labels| Labels[Select Label Analysis]
    Choice -->|Create Labels| Create[Label Creation]
    
    Export --> Period{Select Period}
    Period -->|24 Months| Fetch1[Fetch 24mo Data]
    Period -->|Custom Range| Fetch2[Fetch Range Data]
    
    Fetch1 --> Process1[Process Emails]
    Fetch2 --> Process1
    
    Process1 --> Format{Output Format}
    Format -->|Sheets| WriteSheet[Write to Sheet]
    Format -->|PDF| GenPDF[Generate PDF]
    Format -->|Markdown| GenMD[Generate MD]
    
    Labels --> Analyze[Analyze Label Stats]
    Analyze --> Report[Generate Report]
    
    Create --> Input[Input Label Names]
    Input --> Validate[Validate Names]
    Validate --> CreateLabels[Create in Gmail]
    
    WriteSheet --> Done[Show Success]
    GenPDF --> Done
    GenMD --> Done
    Report --> Done
    CreateLabels --> Done
    
    Done --> End([Complete])
```

## Calendar Export User Flow

```mermaid
flowchart LR
    Start([Open Calendar Script]) --> Auth{Authorized?}
    Auth -->|No| Login[OAuth Login]
    Auth -->|Yes| Menu[Show Menu]
    
    Login --> Menu
    
    Menu --> Export{Export Type}
    Export -->|Daily| Daily[Today's Events]
    Export -->|Range| Range[Date Range]
    Export -->|Analysis| Analysis[Duration Analysis]
    
    Daily --> Format1{Format}
    Range --> DatePicker[Select Dates]
    DatePicker --> Format1
    Analysis --> Period[Select Period]
    Period --> Calculate[Calculate Stats]
    
    Format1 -->|Obsidian| ObsidianMD[Obsidian Format]
    Format1 -->|Standard| StandardMD[Standard MD]
    
    Calculate --> Report[Generate Report]
    ObsidianMD --> Save[Save to Drive]
    StandardMD --> Save
    Report --> Save
    
    Save --> Notify[Email Notification]
    Notify --> End([Done])
```

## Drive Organization User Flow

```mermaid
stateDiagram-v2
    [*] --> SelectFolder: User starts
    SelectFolder --> ScanFolder: Select target folder
    
    ScanFolder --> AnalyzeFiles: Scan contents
    AnalyzeFiles --> ShowOptions: Display organization options
    
    ShowOptions --> OrganizeChoice: User selects action
    
    state OrganizeChoice {
        [*] --> ByType: Organize by file type
        [*] --> ByDate: Organize by date
        [*] --> ByProject: Organize by project
        [*] --> AddMetadata: Add YAML frontmatter
    }
    
    ByType --> CreateFolders: Create type folders
    ByDate --> CreateFolders: Create date folders
    ByProject --> CreateFolders: Create project folders
    
    CreateFolders --> MoveFiles: Move files
    AddMetadata --> ProcessFiles: Add metadata
    
    MoveFiles --> GenerateIndex: Create index
    ProcessFiles --> GenerateIndex
    
    GenerateIndex --> ShowSummary: Display results
    ShowSummary --> [*]: Complete
```

## Sheets Automation User Flow

```mermaid
flowchart TD
    Start([Open Sheets]) --> Detect{Detect Script}
    Detect -->|Not Installed| Install[Install Menu]
    Detect -->|Installed| Menu[Show Custom Menu]
    
    Install --> Menu
    
    Menu --> Action{Select Action}
    Action -->|Export| ExportFlow[Export Data]
    Action -->|Process| ProcessFlow[Process Dates]
    Action -->|Generate| GenerateFlow[Generate Report]
    
    ExportFlow --> ExpFormat{Choose Format}
    ExpFormat -->|Markdown| ExpMD[Export as MD]
    ExpFormat -->|JSON| ExpJSON[Export as JSON]
    ExpFormat -->|CSV| ExpCSV[Export as CSV]
    
    ProcessFlow --> DateOps{Date Operation}
    DateOps -->|Parse| ParseDates[Parse Date Columns]
    DateOps -->|Calculate| CalcDates[Calculate Intervals]
    DateOps -->|Format| FormatDates[Format Dates]
    
    GenerateFlow --> RepType{Report Type}
    RepType -->|Summary| GenSummary[Generate Summary]
    RepType -->|Detailed| GenDetailed[Generate Details]
    
    ExpMD --> SaveDrive[Save to Drive]
    ExpJSON --> SaveDrive
    ExpCSV --> Download[Download File]
    
    ParseDates --> UpdateSheet[Update Sheet]
    CalcDates --> UpdateSheet
    FormatDates --> UpdateSheet
    
    GenSummary --> NewSheet[Create New Sheet]
    GenDetailed --> NewSheet
    
    SaveDrive --> Success[Show Success]
    Download --> Success
    UpdateSheet --> Success
    NewSheet --> Success
    
    Success --> End([Complete])
```

## Admin Dashboard Flow

```mermaid
flowchart TB
    Start([Admin Login]) --> Dashboard[Admin Dashboard]
    
    Dashboard --> Monitor{Monitoring}
    Dashboard --> Deploy{Deployment}
    Dashboard --> Config{Configuration}
    
    Monitor -->|Logs| ViewLogs[View Build Logs]
    Monitor -->|Status| ViewStatus[Project Status]
    Monitor -->|Errors| ViewErrors[Error Reports]
    
    Deploy -->|Single| DeploySingle[Deploy Project]
    Deploy -->|All| DeployAll[Deploy All]
    Deploy -->|Rollback| Rollback[Rollback Version]
    
    Config -->|Permissions| SetPerms[Set Permissions]
    Config -->|Secrets| ManageSecrets[Manage Secrets]
    Config -->|Projects| ManageProjects[Add/Remove Projects]
    
    ViewLogs --> Filter[Filter Logs]
    ViewStatus --> Refresh[Auto Refresh]
    ViewErrors --> Export[Export Errors]
    
    DeploySingle --> Confirm1[Confirm Deploy]
    DeployAll --> Confirm2[Confirm Deploy All]
    Rollback --> SelectVersion[Select Version]
    
    SetPerms --> SavePerms[Save Permissions]
    ManageSecrets --> Encrypt[Encrypt & Save]
    ManageProjects --> UpdateConfig[Update Config]
    
    Confirm1 --> Execute[Execute Deploy]
    Confirm2 --> Execute
    SelectVersion --> Execute
    
    Execute --> ShowProgress[Show Progress]
    ShowProgress --> Result{Result}
    
    Result -->|Success| ShowSuccess[Success Message]
    Result -->|Failed| ShowError[Error Details]
    
    ShowSuccess --> Dashboard
    ShowError --> Retry{Retry?}
    Retry -->|Yes| Execute
    Retry -->|No| Dashboard
```

## Error Recovery Flow

```mermaid
flowchart LR
    Error([Error Occurs]) --> Type{Error Type}
    
    Type -->|Auth| AuthError[Authentication Failed]
    Type -->|Deploy| DeployError[Deployment Failed]
    Type -->|Script| ScriptError[Script Error]
    
    AuthError --> ReAuth[Re-authenticate]
    ReAuth --> CheckCreds[Check Credentials]
    CheckCreds --> UpdateSecret[Update Secret Manager]
    
    DeployError --> CheckLogs[Check Build Logs]
    CheckLogs --> Diagnose{Diagnose Issue}
    Diagnose -->|Permission| FixPerms[Fix Permissions]
    Diagnose -->|Code| FixCode[Fix Code Issue]
    Diagnose -->|Config| FixConfig[Fix Configuration]
    
    ScriptError --> Debug[Debug Script]
    Debug --> LocalTest[Test Locally]
    LocalTest --> Fix[Apply Fix]
    
    UpdateSecret --> Retry1[Retry Operation]
    FixPerms --> Retry1
    FixCode --> Retry1
    FixConfig --> Retry1
    Fix --> Retry1
    
    Retry1 --> Success{Success?}
    Success -->|Yes| Done([Resolved])
    Success -->|No| Escalate[Escalate to Admin]
    Escalate --> Done
```