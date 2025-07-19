# Security Policy

## Supported Versions

We actively maintain security updates for the following versions of Workspace Automation:

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | ✅ Active support  |
| 1.x     | ⚠️ Security fixes only |
| < 1.0   | ❌ No longer supported |

## Vulnerability Reporting

### How to Report a Security Vulnerability

If you discover a security vulnerability in Workspace Automation, please report it responsibly:

**🔒 Private Reporting (Preferred)**
- Email: security@averageintelligence.ai
- Subject: [SECURITY] Workspace Automation Vulnerability Report
- Include: Detailed description, steps to reproduce, potential impact

**📋 What to Include in Your Report**
- Affected components (Gmail, Drive, Calendar scripts, etc.)
- Vulnerability type (e.g., credential exposure, insecure API usage)
- Steps to reproduce the issue
- Potential impact assessment
- Suggested remediation (if known)

### Response Timeline

| Timeline | Action |
|----------|--------|
| 48 hours | Initial acknowledgment |
| 7 days | Preliminary assessment |
| 30 days | Resolution or detailed response plan |

### Security Assessment Criteria

We evaluate vulnerabilities based on:
- **Critical**: Immediate data exposure, credential theft
- **High**: Potential unauthorized access to Google services
- **Medium**: Information disclosure, denial of service
- **Low**: Minor information leaks, non-exploitable issues

## Security Scanning & Monitoring

### Automated Security Measures

Our repository includes comprehensive security monitoring:

✅ **Snyk Integration**
- Continuous vulnerability scanning
- Dependency security monitoring
- Infrastructure as Code security checks
- Code quality security analysis

✅ **Custom Google Apps Script Security**
- Hardcoded credential detection
- Insecure pattern analysis
- API key exposure prevention
- Security best practice enforcement

✅ **GitHub Security Features**
- Code scanning with SARIF uploads
- Dependabot security updates
- Secret scanning
- Security advisories

### Security Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `snyk-security.yml` | Push, PR, Weekly | Comprehensive security scan |
| `snyk-monitor.yml` | Daily | Continuous monitoring |
| `snyk-pr-checks.yml` | Pull Requests | Pre-merge security validation |

## Security Best Practices

### For Contributors

**🔐 Credential Management**
```javascript
// ✅ Good: Use PropertiesService
const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');

// ❌ Bad: Hardcoded credentials
const apiKey = 'AIzaSyAbc123def456ghi789'; // Never do this!
```

**🛡️ Input Validation**
```javascript
// ✅ Good: Validate inputs
function processFolder(folderId) {
  if (!folderId || typeof folderId !== 'string') {
    throw new Error('Invalid folder ID');
  }
  // Continue processing...
}

// ❌ Bad: No validation
function processFolder(folderId) {
  DriveApp.getFolderById(folderId); // Could fail with invalid input
}
```

**⚠️ Error Handling**
```javascript
// ✅ Good: Secure error handling
try {
  const result = riskyOperation();
  return result;
} catch (error) {
  Logger.log('Operation failed: ' + error.message);
  throw new Error('Operation failed'); // Don't expose internal details
}

// ❌ Bad: Exposing sensitive information
try {
  const result = riskyOperation();
  return result;
} catch (error) {
  throw error; // May expose internal file paths, API details, etc.
}
```

### Required Security Headers

All Google Apps Script files must include:

```javascript
/**
 * Title: [Descriptive Name]
 * Service: [Google Service]
 * Purpose: [Primary function]
 * Security Review: [Date of last security review]
 * Risk Level: [LOW/MEDIUM/HIGH]
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Security Considerations:
- [List specific security considerations]
- [Data access patterns]
- [Authentication requirements]
- [Potential risk factors]
*/
```

## Scope Minimization

### Required OAuth Scopes by Service

**📧 Gmail Scripts**
```javascript
// Minimum required scopes
"oauthScopes": [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.file"
]
```

**📁 Drive Scripts**
```javascript
// Minimum required scopes  
"oauthScopes": [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file"
]
```

**📅 Calendar Scripts**
```javascript
// Minimum required scopes
"oauthScopes": [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/drive.file"
]
```

### Principle of Least Privilege

- Request only necessary permissions
- Use read-only scopes when possible
- Limit file access to specific folders
- Implement proper error boundaries

## Incident Response

### Security Incident Classification

**🚨 P0 - Critical (Response: Immediate)**
- Active credential exposure
- Unauthorized data access
- Service compromise

**⚠️ P1 - High (Response: 24 hours)**
- Potential data exposure
- Authentication bypass
- Privilege escalation

**📋 P2 - Medium (Response: 7 days)**
- Information disclosure
- Denial of service
- Configuration issues

**ℹ️ P3 - Low (Response: 30 days)**
- Minor security improvements
- Documentation updates
- Best practice violations

### Response Actions

1. **Immediate Assessment** (0-2 hours)
   - Confirm vulnerability scope
   - Assess potential impact
   - Implement temporary mitigations

2. **Investigation** (2-24 hours)
   - Root cause analysis
   - Affected system identification
   - Evidence collection

3. **Resolution** (24 hours - 30 days)
   - Develop permanent fix
   - Security testing
   - Deployment coordination

4. **Post-Incident** (After resolution)
   - Lessons learned documentation
   - Process improvements
   - Security control updates

## Compliance & Standards

### Security Standards Adherence

- **OWASP Top 10** compliance for web applications
- **Google Cloud Security** best practices
- **OAuth 2.0** secure implementation
- **GDPR/CCPA** data protection considerations

### Regular Security Reviews

- **Monthly**: Automated scan review
- **Quarterly**: Manual security assessment  
- **Annually**: Comprehensive security audit
- **Ad-hoc**: Post-incident reviews

## Contact Information

### Security Team
- **Primary**: security@averageintelligence.ai
- **Secondary**: Kevin Lappe (kevin@averageintelligence.ai)
- **Emergency**: Available 24/7 for P0 incidents

### External Resources
- **Snyk Support**: [Snyk Help Center](https://support.snyk.io/)
- **Google Security**: [Google Cloud Security](https://cloud.google.com/security)
- **GitHub Security**: [GitHub Security Lab](https://securitylab.github.com/)

---

*This security policy is reviewed quarterly and updated as needed to reflect current threats and best practices.*

**Last Updated**: July 18, 2025  
**Next Review**: October 18, 2025
