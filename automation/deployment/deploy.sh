#!/bin/bash
set -euo pipefail

# Main deployment script for Google Apps Script projects

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
PROJECT=""
ENVIRONMENT="development"
DRY_RUN=false

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy Google Apps Script projects using clasp

OPTIONS:
    -p, --project PROJECT    Deploy specific project (e.g., calendar, gmail)
    -e, --env ENVIRONMENT   Environment (development/production) [default: development]
    -a, --all               Deploy all projects
    -d, --dry-run           Show what would be deployed without deploying
    -h, --help              Show this help message

EXAMPLES:
    $0 -p calendar                    # Deploy calendar project
    $0 -a -e production              # Deploy all projects to production
    $0 -p gmail -d                   # Dry run for gmail project
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project)
            PROJECT="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--all)
            PROJECT="all"
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Validate inputs
if [[ -z "$PROJECT" ]]; then
    echo -e "${RED}Error: Project not specified${NC}"
    usage
    exit 1
fi

# Deploy function
deploy_project() {
    local project=$1
    local project_dir="$REPO_ROOT/apps/$project"
    
    echo -e "${YELLOW}Deploying $project...${NC}"
    
    # Check if project exists
    if [[ ! -d "$project_dir" ]]; then
        echo -e "${RED}Error: Project directory not found: $project_dir${NC}"
        return 1
    fi
    
    # Check for .clasp.json
    if [[ ! -f "$project_dir/.clasp.json" ]]; then
        echo -e "${RED}Error: .clasp.json not found in $project_dir${NC}"
        return 1
    fi
    
    # Deploy
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY RUN] Would deploy: $project${NC}"
        echo "  Directory: $project_dir"
        echo "  Environment: $ENVIRONMENT"
    else
        cd "$project_dir"
        
        # Push to Google Apps Script
        echo "Pushing to Google Apps Script..."
        clasp push
        
        # Deploy if production
        if [[ "$ENVIRONMENT" == "production" ]]; then
            echo "Creating production deployment..."
            clasp deploy --description "Production deployment $(date +%Y-%m-%d)"
        fi
        
        echo -e "${GREEN}✓ Successfully deployed $project${NC}"
    fi
    
    return 0
}

# Main execution
echo -e "${GREEN}Google Apps Script Deployment${NC}"
echo "Environment: $ENVIRONMENT"
echo "Dry run: $DRY_RUN"
echo ""

# Deploy projects
if [[ "$PROJECT" == "all" ]]; then
    # Get all projects
    projects=($(ls -d "$REPO_ROOT/apps"/*/ | xargs -n 1 basename))
    
    echo "Deploying ${#projects[@]} projects..."
    echo ""
    
    failed=0
    for project in "${projects[@]}"; do
        if ! deploy_project "$project"; then
            ((failed++))
        fi
        echo ""
    done
    
    if [[ $failed -gt 0 ]]; then
        echo -e "${RED}Failed to deploy $failed projects${NC}"
        exit 1
    else
        echo -e "${GREEN}Successfully deployed all projects!${NC}"
    fi
else
    # Deploy single project
    if deploy_project "$PROJECT"; then
        echo -e "${GREEN}Deployment completed successfully!${NC}"
    else
        echo -e "${RED}Deployment failed${NC}"
        exit 1
    fi
fi