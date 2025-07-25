# Security

Security configuration and vulnerability management for the Workspace Automation project.

## Overview

This directory contains security integration tools, policies, and configurations for maintaining secure Google Apps Script automation. It includes Snyk vulnerability monitoring, custom security scanning, and automated security workflows.

## Quick Start

### Initial Setup

```bash
# Make setup script executable
chmod +x setup-snyk-security.sh

# Run security setup
./setup-snyk-security.sh

# Authenticate with Snyk
snyk auth

# Run initial security scan
npm run security:scan
```

### Generate Security Dashboard

```bash
npm run security:dashboard
open security/dashboard/security-dashboard.html
```

## Available Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run security:scan` | Complete security analysis | CI/CD, regular audits |
| `npm run security:dashboard` | Generate visual dashboard | Management reporting |
| `npm run security:gas-scan` | Google Apps Script analysis only | Development workflow |
| `npm run snyk:test` | Dependency vulnerability scan | Pre-deployment checks |
| `npm run snyk:monitor` | Continuous monitoring setup | Production monitoring |
| `npm run snyk:wizard` | Interactive fix guidance | Vulnerability remediation |

## Security Coverage

### Google Apps Script Analysis

- **Credential Detection**: API keys, passwords, tokens
- **Insecure Patterns**: eval(), innerHTML, dangerous functions
- **API Security**: Google API usage validation
- **Input Validation**: User input handling checks
- **Documentation**: Security header compliance

### Dependency Security

- **Vulnerability Detection**: Known CVEs in npm packages
- **License Compliance**: Open source license validation
- **Outdated Packages**: Dependencies needing updates
- **Supply Chain Security**: Package integrity verification

### Infrastructure Security

- **GitHub Actions**: Workflow security validation
- **Configuration Files**: Secure defaults verification
- **Secrets Management**: Credential handling assessment
- **Access Controls**: Permission minimization

## Configuration Files

### Core Configuration

- **`.snyk`** - Snyk configuration and vulnerability exceptions
- **`SECURITY.md`** - Security policy and reporting guidelines
- **`vulnerability-disclosure.md`** - Responsible disclosure process

### GitHub Actions Workflows

Located in `.github/workflows/`:
- **`snyk-security.yml`** - Comprehensive security scanning
- **`snyk-monitor.yml`** - Continuous monitoring
- **`snyk-pr-checks.yml`** - Pull request security validation

### Security Tools

Located in `tools/`:
- **`gas-security-scanner.js`** - Custom Google Apps Script analyzer
- **`security-dashboard.js`** - Interactive dashboard generator

## Directory Structure

```
security/
├── SECURITY.md                    # Security policy
├── vulnerability-disclosure.md    # Disclosure guidelines
├── reports/                       # Generated security reports
│   ├── gas-security-report.json  # GAS analysis results
│   ├── dashboard-data.json       # Dashboard data
│   ├── executive-summary.json    # Executive summary
│   └── security-trends.json      # Historical trends
├── dashboard/                     # Generated dashboards
│   └── security-dashboard.html   # Interactive HTML dashboard
└── policies/                      # Security policies
```

## GitHub Actions Setup

### Required Secrets

Configure these in repository settings:

1. **SNYK_TOKEN**
   - Obtain from https://app.snyk.io/account
   - Add as repository secret

2. **SNYK_ORG_ID** (Optional)
   - Find in Snyk dashboard
   - Helps organize projects

### Workflow Triggers

- **Push to main**: Full security scan
- **Pull Requests**: Security validation
- **Daily Schedule**: Continuous monitoring
- **Manual**: On-demand analysis

## Security Dashboard Features

### Executive Overview
- Overall security score (0-100)
- Risk level assessment
- Vulnerability counts by severity
- Files and dependencies analyzed

### Detailed Analysis
- Vulnerability breakdown by source
- Service-specific security status
- Security metrics trending
- Compliance framework assessment

### Actionable Recommendations
- Prioritized remediation steps
- Effort and timeline estimates
- Security best practice guidance
- Links to documentation

## Best Practices

### Development

1. Run security scans before committing
2. Address high/critical vulnerabilities immediately
3. Keep dependencies updated regularly
4. Follow secure coding guidelines

### Deployment

1. Ensure all security checks pass
2. Review security dashboard before release
3. Monitor production for new vulnerabilities
4. Maintain security documentation

## Troubleshooting

### Common Issues

**Snyk Authentication Failed**
- Re-run `snyk auth`
- Verify token in repository secrets
- Check network connectivity

**Security Scan Timeout**
- Reduce scan scope temporarily
- Check for large dependencies
- Increase timeout in configuration

**Dashboard Generation Error**
- Ensure reports directory exists
- Check JSON report validity
- Verify Node.js version compatibility

## Resources

- [Snyk Documentation](https://docs.snyk.io)
- [OWASP Security Guidelines](https://owasp.org)
- [Google Apps Script Security Best Practices](https://developers.google.com/apps-script/guides/security)

---

Last Updated: July 2025