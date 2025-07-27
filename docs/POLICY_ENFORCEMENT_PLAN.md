# Policy Enforcement Enhancement Plan

**Created: July 27, 2025**

## Current Automation Review

### 1. Pre-commit Hook (.githooks/pre-commit)
**Current State**: Auto-fixes linting issues
**Enhancement Opportunities**:
- Add secret detection (truffleHog, git-secrets)
- Check for console.log statements
- Validate commit message format
- Check for TODO/FIXME comments
- Verify function documentation

### 2. GAS Linter (automation/dev-tools/gas-linter.js)
**Current State**: Checks headers, formatting, code style
**Enhancement Opportunities**:
- Add security checks (eval, innerHTML, external requests)
- Detect API calls in loops
- Check for error handling in main functions
- Validate OAuth scope usage
- Enforce caching for expensive operations

### 3. Filename Standardizer (automation/dev-tools/standardize-filenames.js)
**Current State**: Renames files to action-noun format
**Enhancement Opportunities**:
- Auto-run in CI/CD pipeline
- Generate report of changes
- Validate against approved verb list
- Check for naming conflicts

### 4. Header Standardizer (automation/dev-tools/standardize-script-headers.js)
**Current State**: Adds required header sections
**Enhancement Opportunities**:
- Validate header content quality
- Check for outdated information
- Auto-update last modified date
- Verify Google Services match actual usage

## New Automation Proposals

### 1. Commit Message Validator
```bash
#!/usr/bin/env bash
# .githooks/commit-msg

# Enforce conventional commits
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,72}$'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Invalid commit message format!"
    echo "📝 Format: type(scope): description"
    echo "📝 Example: feat(gmail): add label export function"
    exit 1
fi
```

### 2. Secret Scanner
```javascript
// automation/dev-tools/secret-scanner.js
const patterns = [
  /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,
  /password\s*[:=]\s*["'][^"']+["']/gi,
  /token\s*[:=]\s*["'][^"']+["']/gi,
  /secret\s*[:=]\s*["'][^"']+["']/gi,
  /private[_-]?key/gi,
  /AIza[0-9A-Za-z-_]{35}/g, // Google API keys
];

function scanForSecrets(content, filename) {
  const violations = [];
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        file: filename,
        pattern: pattern.source,
        matches: matches
      });
    }
  });
  return violations;
}
```

### 3. Performance Analyzer
```javascript
// automation/dev-tools/performance-analyzer.js
function analyzePerformance(content, filename) {
  const issues = [];
  
  // Check for API calls in loops
  const loopPattern = /for\s*\([^)]+\)\s*{[^}]*?(getRange|getValue|setValue|getFiles|getFolders)/g;
  if (loopPattern.test(content)) {
    issues.push({
      type: 'api-in-loop',
      message: 'API call detected inside loop - use batch operations'
    });
  }
  
  // Check for missing cache usage
  const expensiveOps = /DriveApp\.getFileById|SpreadsheetApp\.openById/g;
  const cacheUsage = /CacheService\.(getScriptCache|getUserCache)/g;
  if (expensiveOps.test(content) && !cacheUsage.test(content)) {
    issues.push({
      type: 'missing-cache',
      message: 'Expensive operation without caching detected'
    });
  }
  
  return issues;
}
```

### 4. Documentation Quality Checker
```javascript
// automation/dev-tools/doc-quality-checker.js
function checkDocumentationQuality(content, filename) {
  const issues = [];
  
  // Extract header comment
  const headerMatch = content.match(/^\/\*\*[\s\S]*?\*\//);
  if (headerMatch) {
    const header = headerMatch[0];
    
    // Check for meaningful descriptions
    if (header.includes('TODO') || header.includes('FIXME')) {
      issues.push('Header contains TODO/FIXME items');
    }
    
    // Check for generic descriptions
    const genericTerms = ['does stuff', 'handles things', 'processes data'];
    genericTerms.forEach(term => {
      if (header.toLowerCase().includes(term)) {
        issues.push(`Generic description detected: "${term}"`);
      }
    });
    
    // Check function list matches actual functions
    const listedFunctions = extractListedFunctions(header);
    const actualFunctions = extractActualFunctions(content);
    const missing = actualFunctions.filter(f => !listedFunctions.includes(f));
    if (missing.length > 0) {
      issues.push(`Functions not documented in header: ${missing.join(', ')}`);
    }
  }
  
  return issues;
}
```

### 5. Automated Status Updater
```javascript
// automation/dev-tools/update-status-report.js
const fs = require('fs');
const path = require('path');

function updateStatusReport(milestone, metrics) {
  const date = new Date().toISOString().split('T')[0];
  const reportPath = `docs/claude/STATE_OF_REPOSITORY_${date}.md`;
  
  // Read current report or template
  let content = fs.readFileSync(reportPath, 'utf8');
  
  // Update metrics section
  content = updateMetricsSection(content, metrics);
  
  // Add milestone completion
  content = addMilestoneEntry(content, milestone);
  
  // Update last modified date
  content = updateLastModified(content, date);
  
  fs.writeFileSync(reportPath, content);
  
  // Commit the update
  require('child_process').execSync(`
    git add ${reportPath} &&
    git commit -m "docs: update status report - ${milestone}"
  `);
}
```

## Implementation Priority

### High Priority (Implement Now)
1. **Secret Detection** - Security risk
2. **API Loop Detection** - Performance impact
3. **Commit Message Validation** - Code quality
4. **Documentation Quality** - Maintainability

### Medium Priority (Next Sprint)
1. **Performance Analysis** - Optimization
2. **Coverage Reporting** - Quality metrics
3. **Automated Catalog Updates** - Documentation
4. **Branch Protection** - Code integrity

### Low Priority (Future)
1. **Complexity Analysis** - Code quality
2. **Dependency Tracking** - Architecture
3. **Usage Analytics** - Monitoring
4. **Compliance Dashboard** - Reporting

## Enforcement Mechanisms

### 1. Git Hooks (Local Enforcement)
- **pre-commit**: Linting, secrets, formatting
- **commit-msg**: Message format validation
- **pre-push**: Test execution, coverage check

### 2. CI/CD Pipeline (Remote Enforcement)
- **GitHub Actions**: Full validation suite
- **Branch Protection**: Require checks to pass
- **Auto-merge**: If all checks pass

### 3. Scheduled Jobs (Monitoring)
- **Daily**: Linter compliance report
- **Weekly**: Performance analysis
- **Monthly**: Security audit
- **Quarterly**: Policy review

### 4. Notifications
- **Slack/Email**: Policy violations
- **Dashboard**: Compliance metrics
- **Reports**: Trend analysis

## Success Metrics

### Automation Coverage
- Target: 90% of policies enforced automatically
- Current: ~40%
- Gap: Security, performance, testing

### Compliance Rate
- Target: 95% compliance across all policies
- Measurement: Weekly automated reports
- Remediation: Automated fixes where possible

### Developer Experience
- Target: < 5 minute overhead per commit
- Measurement: Pre-commit hook execution time
- Optimization: Parallel checks, caching

## Next Steps

1. **Week 1**: Implement secret detection and commit message validation
2. **Week 2**: Add performance analysis to linter
3. **Week 3**: Create automated status updater
4. **Week 4**: Deploy CI/CD enhancements

---

**Review Date**: August 27, 2025  
**Implementation Lead**: DevOps Team