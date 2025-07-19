# Snyk Security Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Run the Setup Script
```bash
chmod +x setup-snyk-security.sh
./setup-snyk-security.sh
```

### 2. Authenticate with Snyk
```bash
# Get your token from https://app.snyk.io/account
snyk auth YOUR_SNYK_TOKEN
```

### 3. Test the Integration
```bash
npm run security:scan
npm run snyk:test
```

### 4. Configure GitHub Actions
Add these secrets to your repository:
- `SNYK_TOKEN`: Your Snyk API token
- `SNYK_ORG_ID`: Your Snyk organization ID (optional)

---

## 📊 Available Commands

| Command | Description |
|---------|-------------|
| `npm run security:scan` | Run comprehensive security scan |
| `npm run security:dashboard` | Generate security dashboard |
| `npm run security:gas-scan` | Scan Google Apps Script files only |
| `npm run snyk:test` | Test for vulnerabilities |
| `npm run snyk:monitor` | Monitor project with Snyk |
| `npm run snyk:wizard` | Interactive vulnerability fixing |

---

## 🛡️ Security Workflows

### GitHub Actions Workflows

1. **`snyk-security.yml`** - Comprehensive security scanning
   - Triggers: Push, PR, Weekly schedule
   - Includes: Snyk test, code analysis, GAS scanning

2. **`snyk-monitor.yml`** - Continuous monitoring
   - Triggers: Daily, push to main
   - Monitors: Dependencies, new vulnerabilities

3. **`snyk-pr-checks.yml`** - Pull request validation
   - Triggers: Pull requests
   - Validates: New code, dependency changes

---

## 📁 Directory Structure

```
workspace-automation/
├── .snyk                           # Snyk configuration
├── security/
│   ├── SECURITY.md                 # Security policy
│   ├── vulnerability-disclosure.md # Vulnerability reporting
│   ├── security-guidelines.md      # Development guidelines
│   ├── reports/                    # Security scan results
│   └── dashboard/                  # Security dashboards
├── tools/
│   ├── gas-security-scanner.js     # GAS security scanner
│   └── security-dashboard.js       # Dashboard generator
└── .github/workflows/              # Security workflows
```

---

## 🔍 What Gets Scanned

### Snyk Scanning
- ✅ NPM dependencies
- ✅ Security vulnerabilities
- ✅ License compliance
- ✅ Infrastructure as Code

### Custom GAS Scanning
- ✅ Hardcoded credentials
- ✅ API key exposure
- ✅ Insecure patterns
- ✅ Input validation
- ✅ Error handling
- ✅ Documentation compliance

---

## 🚨 Severity Levels

| Level | Response Time | Examples |
|-------|---------------|----------|
| **Critical** | Immediate | Hardcoded API keys, credential exposure |
| **High** | 24 hours | Authentication bypass, data exposure |
| **Medium** | 1 week | Input validation, configuration issues |
| **Low** | 2 weeks | Documentation, best practices |

---

## 📋 Quick Fixes

### Common Issues and Solutions

**Hardcoded Credentials**
```javascript
// ❌ Bad
const API_KEY = 'sk-1234567890';

// ✅ Good
const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');
```

**Input Validation**
```javascript
// ❌ Bad
function processFolder(folderId) {
  DriveApp.getFolderById(folderId);
}

// ✅ Good
function processFolder(folderId) {
  if (!folderId || typeof folderId !== 'string') {
    throw new Error('Invalid folder ID');
  }
  DriveApp.getFolderById(folderId);
}
```

**Error Handling**
```javascript
// ❌ Bad
try {
  // risky operation
} catch (error) {
  throw error; // Exposes internal details
}

// ✅ Good
try {
  // risky operation
} catch (error) {
  Logger.log('Operation failed: ' + error.message);
  throw new Error('Operation failed');
}
```

---

## 🔗 Important Links

- **Snyk Dashboard**: https://app.snyk.io
- **Security Policy**: [security/SECURITY.md](security/SECURITY.md)
- **Report Vulnerabilities**: security@averageintelligence.ai
- **Development Guidelines**: [security/security-guidelines.md](security/security-guidelines.md)

---

## 🆘 Troubleshooting

### Snyk Authentication Issues
```bash
# Re-authenticate
snyk auth

# Check authentication
snyk config get api
```

### GitHub Actions Failing
1. Check if `SNYK_TOKEN` secret is set
2. Verify repository permissions
3. Check workflow file syntax

### Scanner Not Finding Files
1. Ensure you're in repository root
2. Check `scripts/` directory exists
3. Verify `.gs` file extensions

---

## 📞 Support

- **Security Issues**: security@averageintelligence.ai
- **General Support**: kevin@averageintelligence.ai
- **Documentation**: See `security/` directory

---

*This integration provides enterprise-grade security monitoring for your Google Apps Script automation tools.*
