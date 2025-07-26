# Workspace Automation Entity Relationship Diagram

## Data Model Overview

This ERD represents the complete data model for the Workspace Automation project, showing relationships between developers, repositories, cloud infrastructure, Google Apps Script projects, and Google Workspace services.

```mermaid
erDiagram
    %% Core Project Entities
    PROJECT {
        string project_id PK
        string service_name
        string script_id
        string directory_path
        string clasp_config
        datetime created_at
        datetime updated_at
        string status
        string author
    }

    %% Developer and Authentication
    DEVELOPER {
        string user_id PK
        string name
        string email
        string github_username
        string local_machine
        datetime last_active
    }

    AUTHENTICATION {
        string auth_id PK
        string project_id FK
        string oauth_token
        string refresh_token
        string client_id
        string client_secret
        datetime token_expiry
        string scope
    }

    %% Repository and Version Control
    REPOSITORY {
        string repo_id PK
        string repo_name
        string github_url
        string main_branch
        string owner
        datetime created_at
    }

    COMMIT {
        string commit_id PK
        string repo_id FK
        string commit_hash
        string message
        string author
        datetime timestamp
        string branch
    }

    %% Cloud Infrastructure
    CLOUD_BUILD {
        string build_id PK
        string repo_id FK
        string trigger_source
        string docker_image
        string build_status
        datetime start_time
        datetime end_time
        int duration_seconds
        string logs_url
    }

    DOCKER_IMAGE {
        string image_id PK
        string image_name
        string registry_path
        string version_tag
        datetime created_at
        int size_mb
        string base_image
    }

    SECRET {
        string secret_id PK
        string secret_name
        string project_id FK
        string secret_value
        datetime created_at
        datetime last_accessed
        string access_count
    }

    %% Deployment and Scripts
    DEPLOYMENT {
        string deployment_id PK
        string build_id FK
        string project_id FK
        string deployment_status
        datetime start_time
        datetime end_time
        int success_count
        int failure_count
        string error_log
    }

    SCRIPT_FILE {
        string file_id PK
        string project_id FK
        string file_name
        string file_path
        string content_hash
        int file_size
        string file_type
        datetime last_modified
    }

    %% Google Workspace Services
    WORKSPACE_SERVICE {
        string service_id PK
        string service_name
        string api_endpoint
        string api_version
        string scope_required
        boolean enabled
    }

    API_USAGE {
        string usage_id PK
        string project_id FK
        string service_id FK
        int request_count
        datetime usage_date
        int quota_limit
        int quota_used
    }

    %% Build and Error Tracking
    BUILD_LOG {
        string log_id PK
        string build_id FK
        string log_level
        string message
        datetime timestamp
        string component
    }

    ERROR_LOG {
        string error_id PK
        string deployment_id FK
        string project_id FK
        string error_type
        string error_message
        string stack_trace
        datetime occurred_at
        boolean resolved
    }

    %% Performance and Monitoring
    PERFORMANCE_METRIC {
        string metric_id PK
        string deployment_id FK
        string metric_name
        float metric_value
        string unit
        datetime recorded_at
    }

    %% Relationships
    DEVELOPER ||--o{ REPOSITORY : owns
    DEVELOPER ||--o{ COMMIT : authors
    REPOSITORY ||--o{ COMMIT : contains
    REPOSITORY ||--o{ PROJECT : contains
    
    PROJECT ||--|| AUTHENTICATION : has
    PROJECT ||--o{ SCRIPT_FILE : contains
    PROJECT ||--o{ DEPLOYMENT : deployed_to
    PROJECT ||--o{ API_USAGE : uses
    PROJECT ||--|| WORKSPACE_SERVICE : integrates_with
    
    REPOSITORY ||--o{ CLOUD_BUILD : triggers
    CLOUD_BUILD ||--|| DOCKER_IMAGE : uses
    CLOUD_BUILD ||--o{ BUILD_LOG : generates
    CLOUD_BUILD ||--o{ DEPLOYMENT : creates
    
    DEPLOYMENT ||--o{ ERROR_LOG : may_have
    DEPLOYMENT ||--o{ PERFORMANCE_METRIC : tracks
    
    AUTHENTICATION ||--|| SECRET : stored_in
    
    WORKSPACE_SERVICE ||--o{ API_USAGE : tracked_by

    %% Additional relationships for comprehensive tracking
    SCRIPT_FILE ||--o{ COMMIT : modified_in
    PROJECT ||--o{ ERROR_LOG : may_generate
```

## Entity Descriptions

### Core Entities

**PROJECT**: Represents each Google Apps Script project (Calendar, Gmail, Drive, etc.)
- Links to Google Apps Script project IDs
- Tracks deployment status and configuration
- Maps to local directory structure

**DEVELOPER**: User information and access tracking
- GitHub integration and local machine identification
- Activity monitoring and access control

**AUTHENTICATION**: OAuth and security credentials
- Secure token management for Google APIs
- Integration with Google Cloud Secret Manager

### Infrastructure Entities

**REPOSITORY**: GitHub repository management
- Version control and branch tracking
- Integration with Cloud Build triggers

**CLOUD_BUILD**: Build pipeline tracking
- Docker image management and build status
- Performance metrics and logging

**DEPLOYMENT**: Deployment execution tracking
- Success/failure rates per project
- Error logging and troubleshooting

### Service Integration

**WORKSPACE_SERVICE**: Google Workspace API definitions
- Service endpoints and scope requirements
- API quota and usage tracking

**SCRIPT_FILE**: Individual script file tracking
- File versioning and content hashing
- Deployment synchronization

### Monitoring and Analytics

**BUILD_LOG**: Detailed build process logging
- Component-level debugging information
- Performance optimization data

**ERROR_LOG**: Comprehensive error tracking
- Stack traces and resolution status
- Project-specific error patterns

**PERFORMANCE_METRIC**: System performance monitoring
- Build duration and deployment efficiency
- Resource utilization tracking

## Data Relationships

### Primary Flows
1. **Development Flow**: DEVELOPER → REPOSITORY → COMMIT → CLOUD_BUILD → DEPLOYMENT
2. **Authentication Flow**: DEVELOPER → AUTHENTICATION → SECRET → PROJECT
3. **Service Integration**: PROJECT → WORKSPACE_SERVICE → API_USAGE
4. **Monitoring Flow**: DEPLOYMENT → PERFORMANCE_METRIC + ERROR_LOG

### Key Constraints
- Each PROJECT has exactly one AUTHENTICATION configuration
- Each PROJECT integrates with exactly one WORKSPACE_SERVICE
- DEPLOYMENTS can have multiple ERROR_LOGs and PERFORMANCE_METRICs
- REPOSITORIES can trigger multiple CLOUD_BUILDs over time

This data model supports comprehensive tracking, monitoring, and analytics for the entire Workspace Automation ecosystem.
