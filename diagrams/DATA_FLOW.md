# Data Flow Diagrams

## Master Data Flow

```mermaid
flowchart TB
    subgraph "Data Sources"
        Gmail[Gmail API]
        Calendar[Calendar API]
        Drive[Drive API]
        Sheets[Sheets API]
        Docs[Docs API]
        Tasks[Tasks API]
        Photos[Photos API]
        Chat[Chat API]
    end
    
    subgraph "Processing Layer"
        Scripts[Apps Script Engine]
        Transform[Data Transformers]
        Validate[Data Validators]
        Cache[Cache Layer]
        Queue[Processing Queue]
    end
    
    subgraph "Storage Layer"
        TempStore[Temporary Storage]
        DriveStore[Drive Storage]
        SheetStore[Sheet Storage]
        Properties[Script Properties]
    end
    
    subgraph "Output Formats"
        JSON[JSON Export]
        MD[Markdown Files]
        PDF[PDF Documents]
        CSV[CSV Files]
        HTML[HTML Reports]
        YAML[YAML Frontmatter]
    end
    
    Gmail --> Scripts
    Calendar --> Scripts
    Drive --> Scripts
    Sheets --> Scripts
    Docs --> Scripts
    Tasks --> Scripts
    Photos --> Scripts
    Chat --> Scripts
    
    Scripts --> Transform
    Transform --> Validate
    Validate --> Cache
    Cache --> Queue
    
    Queue --> TempStore
    Queue --> DriveStore
    Queue --> SheetStore
    Queue --> Properties
    
    TempStore --> JSON
    TempStore --> MD
    TempStore --> PDF
    TempStore --> CSV
    TempStore --> HTML
    DriveStore --> YAML
```

## Email Processing Data Flow

```mermaid
flowchart LR
    subgraph "Gmail Input"
        Inbox[Inbox Messages]
        Labels[Label System]
        Threads[Thread Groups]
        Attachments[Attachments]
    end
    
    subgraph "Data Extraction"
        Fetch[Fetch Messages]
        Parse[Parse Headers]
        Extract[Extract Body]
        Process[Process Attachments]
    end
    
    subgraph "Analysis"
        Filter[Apply Filters]
        Categorize[Categorize]
        Stats[Generate Stats]
        Pattern[Pattern Detection]
    end
    
    subgraph "Export"
        Sheet[Google Sheet]
        Markdown[MD Files]
        PDFOut[PDF Export]
        Archive[Drive Archive]
    end
    
    Inbox --> Fetch
    Labels --> Fetch
    Threads --> Fetch
    Attachments --> Process
    
    Fetch --> Parse
    Parse --> Extract
    Extract --> Filter
    Process --> Filter
    
    Filter --> Categorize
    Categorize --> Stats
    Stats --> Pattern
    
    Pattern --> Sheet
    Pattern --> Markdown
    Pattern --> PDFOut
    Pattern --> Archive
```

## Calendar Event Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Script as Apps Script
    participant CalAPI as Calendar API
    participant Processor as Event Processor
    participant Analyzer as Data Analyzer
    participant Formatter as Format Handler
    participant Storage as Drive Storage
    
    User->>Script: Request calendar export
    Script->>Script: Validate permissions
    Script->>CalAPI: List calendars
    CalAPI-->>Script: Return calendar list
    
    Script->>CalAPI: Fetch events (date range)
    CalAPI-->>Script: Return event data
    
    Script->>Processor: Process raw events
    
    loop For each event
        Processor->>Processor: Extract details
        Processor->>Processor: Parse attendees
        Processor->>Processor: Calculate duration
        Processor->>Processor: Extract location
    end
    
    Processor->>Analyzer: Send processed data
    Analyzer->>Analyzer: Calculate statistics
    Analyzer->>Analyzer: Identify patterns
    Analyzer->>Analyzer: Generate insights
    
    Analyzer->>Formatter: Format for export
    
    alt Obsidian Format
        Formatter->>Formatter: Add YAML frontmatter
        Formatter->>Formatter: Create wikilinks
        Formatter->>Formatter: Add tags
    else Standard Format
        Formatter->>Formatter: Standard markdown
        Formatter->>Formatter: Add headers
    end
    
    Formatter->>Storage: Save to Drive
    Storage-->>User: Return file link
```

## Drive File Organization Flow

```mermaid
stateDiagram-v2
    [*] --> InitScan: Start organization
    
    state InitScan {
        [*] --> GetFolder: Select folder
        GetFolder --> ListFiles: List all files
        ListFiles --> BuildTree: Build file tree
        BuildTree --> [*]: Tree ready
    }
    
    InitScan --> AnalyzeContent: Content analysis
    
    state AnalyzeContent {
        [*] --> CheckType: Check file type
        CheckType --> MDFile: Markdown file
        CheckType --> DocFile: Google Doc
        CheckType --> SheetFile: Google Sheet
        CheckType --> Other: Other files
        
        MDFile --> ParseYAML: Parse frontmatter
        DocFile --> ExtractText: Extract content
        SheetFile --> ReadData: Read sheet data
        Other --> BasicMeta: Basic metadata
        
        ParseYAML --> ExtractMeta: Extract metadata
        ExtractText --> ExtractMeta
        ReadData --> ExtractMeta
        BasicMeta --> ExtractMeta
        
        ExtractMeta --> [*]: Analysis complete
    }
    
    AnalyzeContent --> OrganizeFiles: Organization phase
    
    state OrganizeFiles {
        [*] --> Strategy: Choose strategy
        Strategy --> ByType: By file type
        Strategy --> ByDate: By date
        Strategy --> ByProject: By project
        Strategy --> ByTags: By tags
        
        ByType --> CreateTypeFolders: Create type folders
        ByDate --> CreateDateFolders: Create date folders
        ByProject --> CreateProjectFolders: Create project folders
        ByTags --> CreateTagFolders: Create tag folders
        
        CreateTypeFolders --> MoveFiles: Move files
        CreateDateFolders --> MoveFiles
        CreateProjectFolders --> MoveFiles
        CreateTagFolders --> MoveFiles
        
        MoveFiles --> UpdateLinks: Update references
        UpdateLinks --> [*]: Organization complete
    }
    
    OrganizeFiles --> GenerateIndex: Generate index
    GenerateIndex --> UpdateMetadata: Update metadata
    UpdateMetadata --> [*]: Complete
```

## Sheet Data Processing Flow

```mermaid
flowchart TD
    subgraph "Input Layer"
        Sheet[Google Sheet]
        Range[Data Range]
        Headers[Column Headers]
    end
    
    subgraph "Processing Pipeline"
        Read[Read Data]
        Parse[Parse Values]
        Transform[Transform Data]
        Validate[Validate Data]
        Calculate[Calculate Metrics]
    end
    
    subgraph "Data Operations"
        Clean[Clean Data]
        Pivot[Pivot Tables]
        Aggregate[Aggregations]
        Join[Join Operations]
    end
    
    subgraph "Export Pipeline"
        Format[Format Output]
        Template[Apply Template]
        Generate[Generate File]
        Save[Save Result]
    end
    
    Sheet --> Read
    Range --> Read
    Headers --> Read
    
    Read --> Parse
    Parse --> Transform
    Transform --> Validate
    Validate --> Calculate
    
    Calculate --> Clean
    Clean --> Pivot
    Clean --> Aggregate
    Clean --> Join
    
    Pivot --> Format
    Aggregate --> Format
    Join --> Format
    
    Format --> Template
    Template --> Generate
    Generate --> Save
```

## Real-time Sync Data Flow

```mermaid
flowchart LR
    subgraph "File System"
        FSWatch[File Watcher]
        Changes[File Changes]
        Queue[Change Queue]
    end
    
    subgraph "Processing"
        Debounce[Debounce Logic]
        Batch[Batch Processor]
        Validate[Validation]
    end
    
    subgraph "Sync Operations"
        Git[Git Operations]
        Deploy[Deployment]
        Notify[Notifications]
    end
    
    subgraph "Targets"
        GitHub[GitHub Repo]
        GAS[Apps Script]
        Logs[Log Files]
    end
    
    FSWatch --> Changes
    Changes --> Queue
    Queue --> Debounce
    
    Debounce --> Batch
    Batch --> Validate
    
    Validate --> Git
    Git --> Deploy
    Deploy --> Notify
    
    Git --> GitHub
    Deploy --> GAS
    Notify --> Logs
```

## API Rate Limiting Flow

```mermaid
sequenceDiagram
    participant Client
    participant RateLimiter
    participant Queue
    participant API
    participant Cache
    
    Client->>RateLimiter: Request API call
    RateLimiter->>RateLimiter: Check rate limit
    
    alt Within limits
        RateLimiter->>Cache: Check cache
        alt Cache hit
            Cache-->>Client: Return cached data
        else Cache miss
            RateLimiter->>API: Make API call
            API-->>RateLimiter: Return data
            RateLimiter->>Cache: Store in cache
            RateLimiter-->>Client: Return data
        end
    else Rate limited
        RateLimiter->>Queue: Add to queue
        Queue->>Queue: Wait for slot
        Queue->>RateLimiter: Retry request
        RateLimiter->>API: Make API call
        API-->>RateLimiter: Return data
        RateLimiter-->>Client: Return data
    end
```

## Error Handling Data Flow

```mermaid
flowchart TB
    Operation[Operation] --> Try{Try Block}
    
    Try -->|Success| Process[Process Result]
    Try -->|Error| Catch[Catch Error]
    
    Catch --> Identify{Identify Type}
    
    Identify -->|Auth Error| AuthHandler[Auth Handler]
    Identify -->|API Error| APIHandler[API Handler]
    Identify -->|Data Error| DataHandler[Data Handler]
    Identify -->|Unknown| GenericHandler[Generic Handler]
    
    AuthHandler --> Reauth[Re-authenticate]
    APIHandler --> Retry[Retry Logic]
    DataHandler --> Clean[Clean Data]
    GenericHandler --> Log[Log Error]
    
    Reauth --> RetryOp{Retry?}
    Retry --> RetryOp
    Clean --> RetryOp
    Log --> RetryOp
    
    RetryOp -->|Yes| Operation
    RetryOp -->|No| Fail[Operation Failed]
    
    Process --> Success[Return Success]
    Fail --> Report[Error Report]
```