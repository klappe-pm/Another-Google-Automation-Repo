# Development Policies

**Effective Date: July 27, 2025**  
**Version: 1.0**

## Overview

This document establishes mandatory development policies for the Google Workspace Automation repository. All policies are enforced through automation where possible.

## 1. Code Quality Policies

### 1.1 Linter Compliance (Enforced)
- **Policy**: All code must pass GAS linter checks before commit
- **Enforcement**: Pre-commit hook automatically fixes or blocks commits
- **Standard**: 100% compliance required
- **Tools**: `gas-linter.js`, `.githooks/pre-commit`

### 1.2 Naming Conventions (Enforced)
- **Policy**: All files must follow action-noun naming format
- **Enforcement**: `standardize-filenames.js` runs in CI/CD
- **Examples**: 
  - ✅ `export-labels.gs`
  - ✅ `create-folders.gs`
  - ❌ `gmail-export.gs`
  - ❌ `labelExporter.gs`

### 1.3 Documentation Headers (Enforced)
- **Policy**: All scripts must have 8-section headers
- **Enforcement**: Linter checks for required sections
- **Required Sections**:
  1. Script Name
  2. Script Summary
  3. Script Purpose
  4. Script Steps
  5. Script Functions
  6. Script Helper Functions
  7. Script Dependencies
  8. Google Services

### 1.4 Function Documentation (Enforced)
- **Policy**: All functions must have JSDoc comments
- **Enforcement**: Linter error on missing function docs
- **Format**:
  ```javascript
  /**
   * Brief description of function
   * @param {type} name - Description
   * @returns {type} Description
   */
  ```

## 2. Version Control Policies

### 2.1 Commit Frequency (Policy)
- **Policy**: Commit after each major task completion
- **Rationale**: Ensures work is saved and trackable
- **Guidelines**:
  - After adding new feature
  - After fixing bugs
  - After updating documentation
  - After refactoring code

### 2.2 Commit Messages (Enforceable)
- **Policy**: Use conventional commit format
- **Format**: `type(scope): description`
- **Types**: feat, fix, docs, style, refactor, test, chore
- **Future**: Add commitlint to enforce

### 2.3 Branch Protection (Enforceable)
- **Policy**: No direct pushes to main branch
- **Enforcement**: GitHub branch protection rules
- **Requirements**:
  - Pull request required
  - Linter checks must pass
  - At least one approval

## 3. Testing Policies

### 3.1 Test Coverage (Future Enforcement)
- **Policy**: Minimum 80% code coverage
- **Current**: 0% (not enforced)
- **Target**: Q3 2025
- **Enforcement**: CI/CD coverage gates

### 3.2 Test Before Merge (Future Enforcement)
- **Policy**: All PRs must include tests
- **Enforcement**: GitHub Actions check
- **Implementation**: Pending test framework

## 4. Security Policies

### 4.1 No Secrets in Code (Enforced)
- **Policy**: No API keys, passwords, or secrets in code
- **Enforcement**: 
  - `.gitignore` patterns
  - Pre-commit secret scanning (to implement)
- **Use**: PropertiesService or Secret Manager

### 4.2 API Permissions (Auditable)
- **Policy**: Use minimum required OAuth scopes
- **Enforcement**: Regular audit via `API_PERMISSIONS_AUDIT.md`
- **Review**: Quarterly

### 4.3 Input Validation (Enforceable)
- **Policy**: Validate all user inputs
- **Enforcement**: Linter rules for common patterns
- **Implementation**: Security utilities library

## 5. Performance Policies

### 5.1 Batch Operations (Enforceable)
- **Policy**: Use batch API calls over loops
- **Enforcement**: Linter warning for API calls in loops
- **Example**:
  ```javascript
  // ❌ Bad
  for (let i = 0; i < rows.length; i++) {
    sheet.getRange(i, 1).setValue(rows[i]);
  }
  
  // ✅ Good
  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
  ```

### 5.2 Caching (Guideline)
- **Policy**: Cache expensive operations
- **Enforcement**: Code review
- **Tools**: CacheService, PropertiesService

## 6. Documentation Policies

### 6.1 Status Updates (Policy)
- **Policy**: Update State of Repository report at major milestones
- **Frequency**: 
  - After completing major features
  - Monthly progress updates
  - Before releases
- **Location**: `/docs/claude/STATE_OF_REPOSITORY_*.md`

### 6.2 Catalog Updates (Enforceable)
- **Policy**: Update script catalogs when adding/removing scripts
- **Enforcement**: CI/CD catalog generator
- **Files**:
  - `SCRIPT_CATALOG.md`
  - `SCRIPT_INVENTORY.md`

## 7. Deployment Policies

### 7.1 Deployment Testing (Policy)
- **Policy**: Test in development before production
- **Process**:
  1. Deploy to dev project
  2. Run smoke tests
  3. Deploy to production
- **Enforcement**: Deployment scripts check environment

### 7.2 Rollback Plan (Policy)
- **Policy**: Maintain ability to rollback deployments
- **Method**: Git tags for releases
- **Process**: Document in deployment logs

## 8. Monitoring Policies

### 8.1 Error Logging (Enforceable)
- **Policy**: All errors must be logged
- **Enforcement**: Linter checks for try/catch blocks
- **Format**: Structured logging with context

### 8.2 Performance Metrics (Future)
- **Policy**: Track execution time for long operations
- **Implementation**: Performance monitoring utilities
- **Target**: Q4 2025

## Policy Enforcement Matrix

| Policy | Current Enforcement | Target Enforcement | Priority |
|--------|-------------------|-------------------|----------|
| Linter Compliance | Pre-commit hook | ✅ Automated | High |
| Naming Conventions | Manual/Scripts | CI/CD automation | High |
| Documentation Headers | Linter checks | ✅ Automated | High |
| Function Documentation | Linter checks | ✅ Automated | High |
| Commit Frequency | Manual | Reminders/Metrics | Medium |
| No Secrets | .gitignore | + Secret scanning | High |
| API Permissions | Manual audit | Automated audit | Medium |
| Batch Operations | Linter warnings | ✅ Automated | Medium |
| Test Coverage | None | CI/CD gates | High |
| Status Updates | Manual | Calendar reminders | Low |

## Implementation Plan

### Phase 1: Immediate (July 2025)
- [x] Enforce linter compliance
- [x] Enforce naming conventions
- [x] Enforce documentation standards
- [ ] Add secret scanning to pre-commit

### Phase 2: Short-term (August 2025)
- [ ] Implement commitlint
- [ ] Add branch protection rules
- [ ] Create security utilities
- [ ] Automate catalog updates

### Phase 3: Medium-term (Q3 2025)
- [ ] Implement test framework
- [ ] Add coverage gates
- [ ] Create performance utilities
- [ ] Add monitoring hooks

### Phase 4: Long-term (Q4 2025)
- [ ] Full CI/CD automation
- [ ] Automated security audits
- [ ] Performance tracking
- [ ] Compliance dashboard

## Exceptions Process

1. **Request**: Create issue with exception request
2. **Justification**: Provide technical rationale
3. **Review**: Team lead approval required
4. **Documentation**: Record in EXCEPTIONS.md
5. **Time-bound**: All exceptions have expiration

## Policy Updates

- Policies reviewed quarterly
- Updates require PR approval
- Changes communicated via README
- Version history maintained

---

**Next Review Date**: October 27, 2025  
**Policy Owner**: Development Team  
**Enforcement Owner**: DevOps Team