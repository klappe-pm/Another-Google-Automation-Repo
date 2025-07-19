#!/bin/bash

# scan-all-scripts.sh
# Comprehensive security scanning for all scripts in the Workspace Automation repository

set -euo pipefail

echo "🔍 Starting comprehensive security scan of all scripts..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_FILES=0
SCANNED_FILES=0
FAILED_FILES=0

# Create results directory
RESULTS_DIR="security/scan-results"
mkdir -p "$RESULTS_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}Results will be saved to: $RESULTS_DIR${NC}"
echo ""

# Function to scan a single file
scan_file() {
    local file="$1"
    local file_type="$2"
    
    echo -e "${YELLOW}Scanning: $file${NC}"
    ((TOTAL_FILES++))
    
    case "$file_type" in
        "shell")
            # Use shellcheck for shell scripts
            if command -v shellcheck >/dev/null 2>&1; then
                echo "  → Running shellcheck..."
                if shellcheck "$file" > "$RESULTS_DIR/shellcheck_$(basename "$file")_$TIMESTAMP.txt" 2>&1; then
                    echo -e "  ${GREEN}✓ Shellcheck passed${NC}"
                else
                    echo -e "  ${RED}✗ Shellcheck found issues${NC}"
                fi
            else
                echo -e "  ${YELLOW}⚠ Shellcheck not installed${NC}"
            fi
            
            # Try to use Snyk Code on shell scripts (may not be supported)
            echo "  → Attempting Snyk Code analysis..."
            if snyk code test "$file" --json > "$RESULTS_DIR/snyk_$(basename "$file")_$TIMESTAMP.json" 2>&1; then
                echo -e "  ${GREEN}✓ Snyk Code analysis completed${NC}"
            else
                echo -e "  ${RED}✗ Snyk Code analysis failed or not supported${NC}"
            fi
            ;;
            
        "javascript"|"gs")
            # Treat .gs files as JavaScript for Snyk
            echo "  → Running Snyk Code analysis..."
            if snyk code test "$file" --json > "$RESULTS_DIR/snyk_$(basename "$file")_$TIMESTAMP.json" 2>&1; then
                echo -e "  ${GREEN}✓ Snyk Code analysis completed${NC}"
                ((SCANNED_FILES++))
            else
                echo -e "  ${RED}✗ Snyk Code analysis failed${NC}"
                ((FAILED_FILES++))
            fi
            
            # Use ESLint if available for additional JavaScript analysis
            if command -v eslint >/dev/null 2>&1; then
                echo "  → Running ESLint..."
                if eslint "$file" --format json > "$RESULTS_DIR/eslint_$(basename "$file")_$TIMESTAMP.json" 2>/dev/null; then
                    echo -e "  ${GREEN}✓ ESLint analysis completed${NC}"
                else
                    echo -e "  ${YELLOW}⚠ ESLint analysis had warnings/errors${NC}"
                fi
            fi
            ;;
            
        *)
            echo -e "  ${YELLOW}⚠ Unknown file type, skipping detailed analysis${NC}"
            ;;
    esac
    
    echo ""
}

# Scan shell scripts
echo -e "${BLUE}📋 Scanning Shell Scripts (.sh files)...${NC}"
echo "----------------------------------------"
while IFS= read -r -d '' file; do
    scan_file "$file" "shell"
done < <(find . -name "*.sh" -type f -print0)

# Scan Google Apps Script files
echo -e "${BLUE}📋 Scanning Google Apps Script files (.gs files)...${NC}"
echo "------------------------------------------------"
while IFS= read -r -d '' file; do
    scan_file "$file" "gs"
done < <(find . -name "*.gs" -type f -print0)

# Scan JavaScript files
echo -e "${BLUE}📋 Scanning JavaScript files (.js files)...${NC}"
echo "-------------------------------------------"
while IFS= read -r -d '' file; do
    scan_file "$file" "javascript"
done < <(find . -name "*.js" -type f -print0)

# Run overall Snyk Code test
echo -e "${BLUE}📋 Running overall Snyk Code analysis...${NC}"
echo "----------------------------------------"
if snyk code test --json-file-output="$RESULTS_DIR/snyk_overall_$TIMESTAMP.json" --sarif-file-output="$RESULTS_DIR/snyk_overall_$TIMESTAMP.sarif"; then
    echo -e "${GREEN}✓ Overall Snyk Code analysis completed${NC}"
else
    echo -e "${RED}✗ Overall Snyk Code analysis found issues${NC}"
fi

# Summary
echo ""
echo "=================================================="
echo -e "${BLUE}📊 SCAN SUMMARY${NC}"
echo "=================================================="
echo "Total files found: $TOTAL_FILES"
echo "Successfully scanned: $SCANNED_FILES"
echo "Failed scans: $FAILED_FILES"
echo ""
echo -e "${GREEN}Results saved to: $RESULTS_DIR${NC}"
echo ""

# List result files
echo -e "${BLUE}Generated report files:${NC}"
ls -la "$RESULTS_DIR/"*"$TIMESTAMP"* 2>/dev/null || echo "No timestamped files found"

echo ""
echo -e "${GREEN}✓ Security scan completed!${NC}"
