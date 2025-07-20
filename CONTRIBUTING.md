# Contributing to AGAR (Another Google Automation Repository)

Thank you for your interest in contributing to AGAR! This document provides guidelines and instructions for contributing to this project.

## 🎯 Ways to Contribute

### 1. **Report Issues**
- Bug reports for existing scripts
- Feature requests for new automation
- Documentation improvements
- Performance issues

### 2. **Submit Code**
- New Google Apps Script automation tools
- Improvements to existing scripts
- Repository management tool enhancements
- Documentation updates

### 3. **Help Others**
- Answer questions in discussions
- Help troubleshoot issues
- Share usage examples
- Improve documentation

## 📋 Before You Start

### Prerequisites
- Google Account with Apps Script access
- Basic knowledge of JavaScript
- Familiarity with Google Workspace APIs
- Understanding of Google Apps Script environment

### Development Setup
1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/workspace-automation.git
   cd workspace-automation
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up development tools**:
   ```bash
   chmod +x tools/git-sync.sh quick-sync.sh
   npm run repo:review  # Check repository health
   ```

## 🛠️ Development Guidelines

### Code Standards

#### Google Apps Script Files (.gs)
- **Naming**: Use format `service-function-descriptor.gs`
  - ✅ `gmail-export-labels.gs`
  - ✅ `calendar-analysis-duration.gs`
  - ❌ `MyScript.gs`
  - ❌ `untitled.gs`

#### Script Headers (Required)
Every `.gs` file must include:
```javascript
/**
 * Title: Descriptive Script Name
 * Service: Google Service (Gmail, Drive, Calendar, etc.)
 * Purpose: What this script accomplishes
 * Created: YYYY-MM-DD
 * Updated: YYYY-MM-DD
 * Author: Your Name
 * Contact: your.email@example.com
 * License: MIT
 */

/*
Script Summary:
- Purpose: Detailed explanation of what the script does
- Description: How it works and key features
- Problem Solved: What specific problem this addresses
- Successful Execution: What success looks like
*/
```

#### Code Quality
- **Use descriptive variable names**
- **Add comments for complex logic**
- **Handle errors gracefully**
- **Follow Google Apps Script best practices**
- **Test scripts with small datasets first**

### Documentation Standards

#### README Files
- Each service directory must have a comprehensive README
- Include installation instructions
- Provide usage examples
- Document required permissions
- List prerequisites

#### Code Comments
- Explain complex algorithms
- Document API limitations
- Note performance considerations
- Include troubleshooting tips

## 🔄 Development Workflow

### 1. **Issue First**
- Check existing issues before starting work
- Create an issue describing your planned contribution
- Discuss approach with maintainers if it's a significant change

### 2. **Branch Strategy**
```bash
# Create feature branch
git checkout -b feature/gmail-new-export-tool

# Create bug fix branch  
git checkout -b fix/calendar-timezone-issue

# Create documentation branch
git checkout -b docs/improve-setup-guide
```

### 3. **Development Process**
1. **Write/modify code** following standards above
2. **Test thoroughly** with various scenarios
3. **Update documentation** as needed
4. **Run quality checks**:
   ```bash
   npm run repo:review
   npm run repo:report
   ```
5. **Commit with descriptive messages**:
   ```bash
   git commit -m "feat(gmail): add advanced label export with filtering
   
   - Support date range filtering
   - Include label statistics
   - Add CSV export option
   - Handle large datasets efficiently"
   ```

### 4. **Pull Request Process**
1. **Push your branch** to your fork
2. **Create Pull Request** with our template
3. **Describe changes** thoroughly
4. **Link related issues**
5. **Wait for review** and address feedback

## 📝 Pull Request Guidelines

### PR Title Format
- `feat(service): add new feature`
- `fix(service): resolve specific issue`
- `docs: improve documentation`
- `chore: update dependencies`

### PR Description Must Include
- **What changed** and why
- **How to test** the changes
- **Screenshots** if UI-related
- **Breaking changes** if any
- **Related issues** linked

### PR Checklist
- [ ] Code follows project standards
- [ ] All scripts have proper headers
- [ ] Documentation updated
- [ ] Changes tested locally
- [ ] No hardcoded credentials or sensitive data
- [ ] Repository review passes (`npm run repo:review`)

## 🧪 Testing

### Manual Testing Required
- **Test with small datasets first**
- **Verify error handling**
- **Check edge cases**
- **Test with different Google account types**
- **Validate output formats**

### Repository Health Check
```bash
# Run before submitting PR
npm run repo:review
npm run repo:report
```

## 🔒 Security Guidelines

### Never Include
- **API keys or tokens**
- **Personal credentials**
- **Private Google Drive IDs**
- **Email addresses** (except in examples)
- **Sensitive organizational data**

### Security Best Practices
- Use environment variables for sensitive data
- Validate all user inputs
- Follow principle of least privilege for API scopes
- Handle authentication errors gracefully
- Document required permissions clearly

## 📖 Documentation Contributions

### Types of Documentation Help Needed
- **Setup guides** for different use cases
- **Troubleshooting** common issues
- **Usage examples** with real scenarios
- **Best practices** guides
- **Video tutorials** or screenshots

### Documentation Standards
- **Clear, concise language**
- **Step-by-step instructions**
- **Include expected outputs**
- **Provide troubleshooting steps**
- **Test all instructions before submitting**

## 🎯 Priority Contribution Areas

### High Priority
1. **New Service Automation**: Slides, Forms, Sites automation
2. **Error Handling**: Improve robustness of existing scripts
3. **Performance**: Optimize scripts for large datasets
4. **Documentation**: More detailed setup and usage guides

### Medium Priority
1. **Testing Framework**: Automated testing for scripts
2. **Examples**: Real-world usage scenarios
3. **Integration**: Third-party service integrations
4. **Monitoring**: Enhanced analytics and reporting

### Lower Priority
1. **UI Improvements**: Better user interfaces
2. **Advanced Features**: Machine learning integration
3. **Mobile Support**: Mobile-friendly scripts
4. **Localization**: Multiple language support

## 🚀 Getting Help

### Where to Ask Questions
- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Email**: kevin@averageintelligence.ai for urgent matters

### Response Time Expectations
- **Issues**: Within 2-3 business days
- **Pull Requests**: Within 1 week
- **Discussions**: Within 1-2 business days

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

### Quick Summary
- **Be respectful** and inclusive
- **Be collaborative** and helpful
- **Be patient** with newcomers
- **Focus on constructive** feedback
- **Report inappropriate behavior**

## 🏆 Recognition

### Contributors Will Be
- **Listed** in project documentation
- **Mentioned** in release notes
- **Invited** to maintainer discussions
- **Credited** in relevant scripts

### Ways We Recognize Contributions
- GitHub contributor graph
- Release notes mentions
- Social media shoutouts
- Special contributor badges

## 📄 License

By contributing to AGAR, you agree that your contributions will be licensed under the [MIT License](LICENSE.md).

---

## 🎉 Thank You!

Your contributions help make Google Workspace automation accessible to everyone. Whether you're fixing a typo or building a complex automation tool, every contribution matters!

**Happy coding!** 🚀

---

**Contact**: kevin@averageintelligence.ai  
**Repository**: https://github.com/kevinlappe/workspace-automation  
**License**: MIT
