# Contributing to Workspace Automation

Thank you for your interest in contributing to the Workspace Automation project! This document provides guidelines and information for contributors.

## 📋 Quick Start

1. **Fork the repository** and clone your fork
2. **Create a feature branch** from `main`
3. **Follow naming conventions** for scripts and files
4. **Test your changes** thoroughly
5. **Submit a pull request** with clear description

## 🏗️ Project Structure

```
Workspace Automation/
├── projects/           # Service-specific Google Apps Script projects
│   ├── gmail/         # Gmail automation scripts
│   ├── drive/         # Google Drive scripts  
│   ├── calendar/      # Calendar management
│   ├── docs/          # Document processing
│   ├── sheets/        # Spreadsheet automation
│   ├── tasks/         # Task management
│   ├── chat/          # Google Chat integration
│   └── utility/       # General utilities
├── tools/             # Development and deployment tools
├── .github/           # CI/CD workflows and templates
└── docs/              # Documentation
```

## 🎯 Script Naming Convention

All Google Apps Script files must follow this pattern:
```
{service}-{function}-{descriptor}.gs
```

**Examples:**
- `gmail-export-pdf-markdown.gs`
- `drive-index-all-files.gs`
- `calendar-export-obsidian.gs`
- `sheets-create-tree-diagram.gs`

## 📝 Script Header Standard

Every script must include this header format:

```javascript
/**
 * Title: Descriptive Script Name
 * Service: Google Service Name
 * Purpose: Brief description of functionality
 * Created: YYYY-MM-DD
 * Updated: YYYY-MM-DD
 * Author: Your Name
 * Contact: your.email@domain.com
 * License: MIT
 */

/*
Script Summary:
- Purpose: Why this script exists
- Description: What the script accomplishes
- Problem Solved: Specific problem addressed
- Successful Execution: Expected outcomes
*/
```

## 🔧 Development Guidelines

### Code Quality
- **Follow consistent indentation** (2 spaces)
- **Use meaningful variable names**
- **Add comprehensive error handling**
- **Include inline comments for complex logic**
- **Implement proper logging**

### Testing Requirements
- **Test with small datasets first**
- **Verify all OAuth scopes are correct**
- **Test error conditions and edge cases**
- **Document expected inputs/outputs**

### Performance Standards
- **Implement batch processing** for large operations
- **Use appropriate rate limiting**
- **Optimize API calls and reduce redundancy**
- **Monitor execution time limits**

## 🚀 Contribution Workflow

### 1. Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/workspace-automation.git
cd workspace-automation

# Install dependencies
npm install

# Set up development environment
npm run setup:ide
```

### 2. Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Test your changes
npm run validate

# Commit with conventional format
git commit -m "feat(service): add new functionality

- Detailed description of changes
- Any breaking changes noted
- References to issues if applicable"
```

### 3. Submitting Pull Request

1. **Push your feature branch** to your fork
2. **Create pull request** against `main` branch
3. **Provide clear description** of changes
4. **Reference any related issues**
5. **Ensure all CI checks pass**

## 📚 Documentation Requirements

### For New Scripts
- Add script to appropriate service directory
- Update service README.md
- Include usage examples
- Document required OAuth scopes
- Add troubleshooting section

### For New Features
- Update main README.md
- Add configuration examples
- Document any new dependencies
- Include performance considerations

## 🛡️ Security Guidelines

### API Keys and Credentials
- **Never commit API keys** or credentials
- **Use Google Apps Script built-in services** when possible
- **Follow principle of least privilege** for OAuth scopes
- **Document security considerations**

### Data Privacy
- **Minimize data access** to what's necessary
- **No data transmission** outside Google ecosystem
- **Respect user privacy** and data retention policies
- **Document data handling practices**

## 🧪 Testing Standards

### Manual Testing
1. **Small Dataset Testing**: Test with 5-10 items first
2. **Permission Verification**: Ensure proper OAuth authorization
3. **Error Condition Testing**: Test failure scenarios
4. **Performance Testing**: Verify execution within time limits

### Automated Testing
- Add unit tests for complex functions
- Include integration tests for API interactions
- Test error handling and edge cases
- Verify output formats and data integrity

## 📋 Pull Request Checklist

Before submitting your pull request, ensure:

- [ ] **Code follows naming conventions**
- [ ] **Script headers are complete and accurate**
- [ ] **Documentation is updated**
- [ ] **Manual testing completed successfully**
- [ ] **No hardcoded credentials or API keys**
- [ ] **Error handling is comprehensive**
- [ ] **Performance is optimized**
- [ ] **Commit messages follow conventional format**

## 🏷️ Issue Labels

When creating issues, use appropriate labels:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority:high` - High priority items
- `service:gmail` - Gmail-specific issues
- `service:drive` - Drive-specific issues

## 💬 Getting Help

### Community Support
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: kevin@averageintelligence.ai for direct support

### Resources
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Workspace APIs](https://developers.google.com/workspace)
- [Project Wiki](https://github.com/klappe-pm/Another-Google-Automation-Repo/wiki)

## 🎉 Recognition

Contributors will be:
- **Listed in project README**
- **Credited in release notes**
- **Recognized in project documentation**
- **Invited to maintainer discussions**

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Workspace Automation!**

For questions about contributing, please contact the maintainers or create an issue.
