# Development Workflow Diagram

## Google Apps Script Development Lifecycle

This diagram illustrates the complete development workflow from code creation to production deployment, including all quality gates and automation tools.

```mermaid
graph TD
    %% Development Phase
    subgraph "Development Phase"
        START[Developer writes code]
        EDIT[Edit .gs file]
        SAVE[Save file]
        START --> EDIT
        EDIT --> SAVE
    end
    
    %% Local Quality Tools
    subgraph "Local Quality Tools"
        FORMATTER[Smart Formatter]
        LINTER[GAS Linter]
        REFACTOR[Batch Refactor]
        
        SAVE --> FORMATTER
        FORMATTER --> LINTER
        LINTER --> |Issues Found| EDIT
        LINTER --> |No Issues| COMMIT
    end
    
    %% Git Integration
    subgraph "Git Integration"
        COMMIT[git commit]
        PRECOMMIT[Pre-commit Hook]
        POSTCOMMIT[Post-commit Hook]
        
        COMMIT --> PRECOMMIT
        PRECOMMIT --> |Lint Check| LINTCHECK{Pass?}
        LINTCHECK --> |No| EDIT
        LINTCHECK --> |Yes| COMMITDONE[Commit Success]
        COMMITDONE --> POSTCOMMIT
        POSTCOMMIT --> CATALOG[Update Catalog]
    end
    
    %% CI/CD Pipeline
    subgraph "CI/CD Pipeline"
        PUSH[git push]
        GHACTIONS[GitHub Actions]
        LINTCI[Lint Workflow]
        CATALOGCI[Catalog Workflow]
        FORMATCI[Format Check]
        
        COMMITDONE --> PUSH
        PUSH --> GHACTIONS
        GHACTIONS --> LINTCI
        GHACTIONS --> CATALOGCI
        GHACTIONS --> FORMATCI
    end
    
    %% Cloud Build Deployment
    subgraph "Cloud Build Deployment"
        TRIGGER[Build Trigger]
        BUILD[Cloud Build]
        DEPLOY[Deploy to GAS]
        
        PUSH --> TRIGGER
        TRIGGER --> BUILD
        BUILD --> DEPLOY
    end
    
    %% Production
    subgraph "Production"
        GASPROD[Google Apps Script]
        WORKSPACE[Google Workspace]
        
        DEPLOY --> GASPROD
        GASPROD --> WORKSPACE
    end
    
    %% Monitoring & Feedback
    subgraph "Monitoring & Feedback"
        METRICS[Quality Metrics]
        REPORTS[Documentation Reports]
        DASHBOARD[Progress Dashboard]
        
        CATALOG --> METRICS
        METRICS --> REPORTS
        REPORTS --> DASHBOARD
        DASHBOARD --> START
    end
    
    %% Styling
    classDef dev fill:#e1f5fe
    classDef quality fill:#f3e5f5
    classDef git fill:#e8f5e9
    classDef ci fill:#fff3e0
    classDef cloud fill:#fce4ec
    classDef prod fill:#f1f8e9
    
    class START,EDIT,SAVE dev
    class FORMATTER,LINTER,REFACTOR quality
    class COMMIT,PRECOMMIT,POSTCOMMIT,PUSH git
    class GHACTIONS,LINTCI,CATALOGCI,FORMATCI ci
    class TRIGGER,BUILD,DEPLOY cloud
    class GASPROD,WORKSPACE prod
```

## Workflow Stages

### 1. Development Phase
- Developer writes or modifies Google Apps Script code
- Uses IDE (VS Code or similar) with syntax highlighting
- Saves changes locally

### 2. Local Quality Tools
- **Smart Formatter**: Automatically adds headers and documentation
- **GAS Linter**: Validates against style guide
- **Batch Refactor**: Process multiple files systematically

### 3. Git Integration
- **Pre-commit Hook**: Runs linting on staged files
- **Post-commit Hook**: Updates script catalog
- Blocks commits with errors, allows with warnings

### 4. CI/CD Pipeline
- GitHub Actions workflows trigger on push
- Parallel execution of quality checks
- Comments on PRs with results

### 5. Cloud Build Deployment
- Triggered by pushes to main branch
- Uses custom Docker image with clasp
- Deploys to all configured GAS projects

### 6. Production
- Scripts run in Google Apps Script environment
- Integrate with Google Workspace services
- Execute on triggers or user actions

### 7. Monitoring & Feedback
- Script catalog tracks documentation coverage
- Quality metrics identify improvement areas
- Dashboard provides progress visibility

## Quality Gates

```mermaid
graph LR
    subgraph "Quality Gates"
        GATE1[Local Linting]
        GATE2[Pre-commit Hook]
        GATE3[CI Lint Check]
        GATE4[Format Validation]
        GATE5[Documentation Score]
        
        GATE1 --> GATE2
        GATE2 --> GATE3
        GATE3 --> GATE4
        GATE4 --> GATE5
    end
```

## Tool Commands Reference

### Local Development
```bash
# Format single file
npm run format:smart path/to/script.gs

# Lint and fix issues
npm run lint:fix

# Update catalog
npm run catalog
```

### Batch Operations
```bash
# Interactive refactor
npm run refactor:batch

# Process all scripts
npm run gas:fix
```

### Git Operations
```bash
# Setup hooks
npm run setup:git-hooks

# Quick sync
npm run git:sync
```

## Best Practices

1. **Before Committing**
   - Run `npm run gas:check` to validate
   - Fix any ERROR-level issues
   - Update documentation if needed

2. **Code Review**
   - Check lint results in PR comments
   - Verify documentation completeness
   - Ensure setup instructions are accurate

3. **Regular Maintenance**
   - Run catalog weekly
   - Review low-scoring scripts
   - Update setup instructions as needed

## Automation Benefits

- **Consistency**: All scripts follow same standards
- **Quality**: Automated checks prevent issues
- **Documentation**: Always up-to-date
- **Efficiency**: Batch processing saves time
- **Visibility**: Catalogs track progress
- **Collaboration**: Clear standards for team