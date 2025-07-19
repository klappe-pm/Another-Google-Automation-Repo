#!/bin/bash

# comprehensive-security-scan.sh
# Security scanning for all scripts with appropriate tools

set -euo pipefail

echo "🔍 Starting comprehensive security scan..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create results directory
RESULTS_DIR="security/scan-results"
mkdir -p "$RESULTS_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$RESULTS_DIR/security_scan_report_$TIMESTAMP.txt"

# Initialize report
{
    echo "Security Scan Report - $(date)"
    echo "======================================"
    echo ""
} > "$REPORT_FILE"

echo -e "${BLUE}Report will be saved to: $REPORT_FILE${NC}"
echo ""

# Function to log to both console and file
log_message() {
    echo -e "$1" | tee -a "$REPORT_FILE"
}

# 1. Install shellcheck if not present
echo -e "${BLUE}📦 Checking for security tools...${NC}"
if ! command -v shellcheck >/dev/null 2>&1; then
    log_message "${YELLOW}Installing shellcheck...${NC}"
    if command -v brew >/dev/null 2>&1; then
        brew install shellcheck
    else
        log_message "${RED}Homebrew not found. Please install shellcheck manually.${NC}"
    fi
fi

# 2. Run Snyk Code on the entire project (this works!)
log_message ""
log_message "${BLUE}🔍 Running Snyk Code analysis on entire project...${NC}"
log_message "=================================================="

if snyk code test --sarif-file-output="$RESULTS_DIR/snyk_code_$TIMESTAMP.sarif" 2>&1 | tee -a "$REPORT_FILE"; then
    log_message "${GREEN}✓ Snyk Code analysis completed${NC}"
else
    log_message "${RED}✗ Snyk Code analysis found issues or failed${NC}"
fi

# 3. Run Snyk dependency check
log_message ""
log_message "${BLUE}🔍 Running Snyk dependency analysis...${NC}"
log_message "======================================="

if snyk test --json-file-output="$RESULTS_DIR/snyk_deps_$TIMESTAMP.json" 2>&1 | tee -a "$REPORT_FILE"; then
    log_message "${GREEN}✓ Snyk dependency analysis completed${NC}"
else
    log_message "${RED}✗ Snyk dependency analysis found issues${NC}"
fi

# 4. Analyze shell scripts with shellcheck
log_message ""
log_message "${BLUE}🐚 Analyzing shell scripts with shellcheck...${NC}"
log_message "=============================================="

SHELL_ISSUES=0
while IFS= read -r -d '' script; do
    log_message "Checking: $script"
    if shellcheck "$script" > "$RESULTS_DIR/shellcheck_$(basename "$script")_$TIMESTAMP.txt" 2>&1; then
        log_message "${GREEN}  ✓ No issues found${NC}"
    else
        log_message "${RED}  ✗ Issues found - see $RESULTS_DIR/shellcheck_$(basename "$script")_$TIMESTAMP.txt${NC}"
        ((SHELL_ISSUES++))
    fi
done < <(find . -name "*.sh" -not -path "./node_modules/*" -type f -print0)

# 5. Analyze JavaScript-like content in .gs files
log_message ""
log_message "${BLUE}📜 Analyzing Google Apps Script files...${NC}"
log_message "========================================"

GS_FILES=$(find . -name "*.gs" -not -path "./node_modules/*" -type f | wc -l)
log_message "Found $GS_FILES Google Apps Script files"

# Create a temporary JS file to analyze .gs files with ESLint (if available)
if command -v npx >/dev/null 2>&1; then
    log_message "${BLUE}Setting up ESLint for .gs files...${NC}"
    
    # Create a simple ESLint config for Google Apps Script
    cat > .eslintrc.temp.js << 'EOF'
module.exports = {
    env: {
        es6: true,
        node: true,
        browser: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'script'
    },
    globals: {
        // Google Apps Script globals
        'PropertiesService': 'readonly',
        'DriveApp': 'readonly',
        'SpreadsheetApp': 'readonly',
        'DocumentApp': 'readonly',
        'GmailApp': 'readonly',
        'CalendarApp': 'readonly',
        'Utilities': 'readonly',
        'Logger': 'readonly',
        'console': 'readonly',
        'Session': 'readonly',
        'Browser': 'readonly',
        'HtmlService': 'readonly',
        'ScriptApp': 'readonly',
        'ContentService': 'readonly',
        'XmlService': 'readonly',
        'UrlFetchApp': 'readonly',
        'LockService': 'readonly',
        'CacheService': 'readonly',
        'Blob': 'readonly'
    },
    rules: {
        'no-console': 'off',
        'no-unused-vars': 'warn',
        'no-undef': 'warn'
    }
};
EOF

    GS_ISSUES=0
    while IFS= read -r -d '' gs_file; do
        log_message "Analyzing: $gs_file"
        if npx eslint "$gs_file" --config .eslintrc.temp.js --format compact > "$RESULTS_DIR/eslint_$(basename "$gs_file")_$TIMESTAMP.txt" 2>&1; then
            log_message "${GREEN}  ✓ No issues found${NC}"
        else
            log_message "${YELLOW}  ⚠ Issues found - see $RESULTS_DIR/eslint_$(basename "$gs_file")_$TIMESTAMP.txt${NC}"
            ((GS_ISSUES++))
        fi
    done < <(find . -name "*.gs" -not -path "./node_modules/*" -type f -print0)
    
    # Clean up temp config
    rm -f .eslintrc.temp.js
    
    log_message ""
    log_message "${BLUE}Google Apps Script analysis complete:${NC}"
    log_message "Files with potential issues: $GS_ISSUES"
else
    log_message "${YELLOW}ESLint not available. Skipping .gs file analysis.${NC}"
fi

# 6. Manual security checks for common patterns
log_message ""
log_message "${BLUE}🔍 Scanning for common security patterns...${NC}"
log_message "==========================================="

# Check for potential security issues in all script files
log_message "Checking for hardcoded secrets..."
if grep -r -n -i "password\|secret\|token\|key" --include="*.gs" --include="*.sh" --include="*.js" . | grep -v node_modules | head -10; then
    log_message "${RED}⚠ Found potential hardcoded secrets - review manually${NC}"
else
    log_message "${GREEN}✓ No obvious hardcoded secrets found${NC}"
fi

log_message ""
log_message "Checking for SQL injection patterns..."
if grep -r -n -E "(SELECT|INSERT|UPDATE|DELETE).*\+" --include="*.gs" --include="*.js" . | grep -v node_modules | head -5; then
    log_message "${RED}⚠ Found potential SQL injection patterns - review manually${NC}"
else
    log_message "${GREEN}✓ No obvious SQL injection patterns found${NC}"
fi

log_message ""
log_message "Checking for eval() usage..."
if grep -r -n "eval(" --include="*.gs" --include="*.js" . | grep -v node_modules; then
    log_message "${RED}⚠ Found eval() usage - potential security risk${NC}"
else
    log_message "${GREEN}✓ No eval() usage found${NC}"
fi

# 7. Summary
log_message ""
log_message "========================================"
log_message "${BLUE}📊 SECURITY SCAN SUMMARY${NC}"
log_message "========================================"
log_message "Shell script issues: $SHELL_ISSUES"
if [[ -v GS_ISSUES ]]; then
    log_message "Google Apps Script issues: $GS_ISSUES"
fi
log_message ""
log_message "Generated files:"
ls -la "$RESULTS_DIR/"*"$TIMESTAMP"* 2>/dev/null | tee -a "$REPORT_FILE" || log_message "No timestamped files found"

log_message ""
log_message "${GREEN}✓ Security scan completed!${NC}"
log_message "📋 Full report saved to: $REPORT_FILE"

echo ""
echo -e "${BLUE}To address the issues:${NC}"
echo "1. Review Snyk Code results for JavaScript/TypeScript security issues"
echo "2. Check shellcheck results for shell script issues"
echo "3. Review ESLint results for Google Apps Script issues"
echo "4. Manually review any flagged security patterns"
