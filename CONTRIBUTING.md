# Contributing to Workspace Automation

Thank you for your interest in contributing to the Workspace Automation project! This document provides guidelines for contributing to this repository.

## 🚀 Quick Start for Contributors

### Prerequisites
- Google Apps Script experience
- Google Workspace access for testing
- Git/GitHub familiarity
- Understanding of JavaScript

### Development Environment Setup
1. Fork this repository
2. Clone your fork locally
3. Set up Google Apps Script IDE access
4. Enable required Google APIs in your project

## 📝 Contribution Guidelines

### Code Standards

#### File Naming Convention
All scripts must follow the established pattern:
```
{service}-{function}-{descriptor}.gs
```

Examples:
- `gmail-export-pdf-markdown.gs`
- `drive-index-all-files.gs`
- `calendar-analysis-duration-distance.gs`

#### Script Header Requirements
Every script must include this standardized header:

```javascript
/**
 * Title: {Descriptive Script Name}
 * Service: {Google Service}
 * Purpose: {Primary function and goal}
 * Created: {Creation date}
 * Updated: {Last modification date}
 * Author: {Your Name}
 * Contact: {Your Email}
 * License: MIT
 */

/*
Script Summary:
- Purpose: {Detailed purpose explanation}
- Description: {What the script does}
- Problem Solved: {Specific problem addressed}
- Successful Execution: {Expected outcomes}
*/
```

#### Code Quality Standards
- **Error Handling**: Include comprehensive try-catch blocks
- **Logging**: Implement detailed console logging for debugging
- **Comments**: Add inline comments for complex logic
- **Variables**: Use descriptive variable names
- **Constants**: Define configuration constants at the top

### Documentation Requirements

#### README Updates
When adding new scripts:
1. Update the service-specific README.md
2. Add script to the main repository README.md
3. Include usage examples and configuration instructions
4. Document any new dependencies or API requirements

#### Script Documentation
Each script should include:
- Clear purpose statement
- Parameter descriptions
- Return value documentation
- Usage examples
- Error handling information
- Performance considerations

### Testing Guidelines

#### Required Testing
Before submitting a pull request:
1. **Functionality Test**: Verify script works as intended
2. **Permission Test**: Confirm required API permissions
3. **Error Test**: Test error handling with invalid inputs
4. **Performance Test**: Verify reasonable execution times
5. **Integration Test**: Test with other scripts if applicable

#### Test Documentation
Include in your PR:
- Test scenarios executed
- Expected vs actual results
- Any limitations or known issues
- Performance benchmarks if relevant

## 🔄 Development Workflow

### 1. Issue Creation
- Search existing issues before creating new ones
- Use issue templates when available
- Provide detailed problem descriptions
- Include reproduction steps for bugs
- Suggest solutions for enhancements

### 2. Branch Strategy
- Create feature branches from `main`
- Use descriptive branch names: `feature/gmail-bulk-export`
- Keep branches focused on single features/fixes
- Rebase before submitting PRs

### 3. Pull Request Process
1. **Pre-submission Checklist**:
   - [ ] Code follows established conventions
   - [ ] All tests pass
   - [ ] Documentation updated
   - [ ] No sensitive information included
   - [ ] Git history is clean

2. **PR Description Should Include**:
   - Clear description of changes
   - Problem solved or feature added
   - Testing performed
   - Screenshots/examples if applicable
   - Breaking changes (if any)

3. **Review Process**:
   - Address reviewer feedback promptly
   - Update documentation as needed
   - Ensure CI/CD checks pass
   - Squash commits before merge

## 📁 Repository Structure

### Service Folders
Each Google service has its own folder structure:
```
{service}/
├── Analysis Tools/
├── Export Functions/
├── Content Management/
├── Utility Tools/
├── Legacy Files/
├── README.md
└── LICENSE.md
```

### Script Categories
Scripts are organized by function type:
- **Analysis Tools**: Data analysis and reporting
- **Export Functions**: Data export and conversion
- **Content Management**: Content creation and processing
- **Utility Tools**: Helper functions and maintenance
- **Integration Tools**: Third-party service connections

## 🚨 Security Guidelines

### Sensitive Information
- **Never commit**: API keys, passwords, personal data
- **Use placeholders**: Replace sensitive values with examples
- **Environment variables**: Reference configuration patterns
- **User notification**: Warn about sensitive data handling

### Permission Management
- **Minimal permissions**: Request only necessary API access
- **Clear documentation**: Explain why permissions are needed
- **User control**: Allow users to configure access levels
- **Regular audits**: Review and update permission requirements

## 🎯 Contribution Types

### New Scripts
- Solve common Workspace automation problems
- Follow established patterns and conventions
- Include comprehensive documentation
- Provide usage examples

### Bug Fixes
- Address functionality issues
- Improve error handling
- Enhance performance
- Fix documentation errors

### Documentation Improvements
- Clarify installation instructions
- Add usage examples
- Improve troubleshooting guides
- Update API references

### Performance Enhancements
- Optimize API usage
- Reduce execution times
- Implement better error recovery
- Add progress tracking

## 📊 Quality Metrics

### Code Quality Checks
- [ ] Follows naming conventions
- [ ] Includes proper error handling
- [ ] Has comprehensive logging
- [ ] Uses efficient API patterns
- [ ] Includes inline documentation

### Documentation Quality
- [ ] Clear purpose statement
- [ ] Complete setup instructions
- [ ] Usage examples provided
- [ ] Troubleshooting information
- [ ] Performance considerations

### Testing Coverage
- [ ] Basic functionality verified
- [ ] Error scenarios tested
- [ ] Performance benchmarks included
- [ ] Integration testing completed
- [ ] User acceptance criteria met

## 🤝 Community Standards

### Communication
- Be respectful and professional
- Provide constructive feedback
- Ask questions when unclear
- Help other contributors

### Issue Management
- Use clear, descriptive titles
- Provide complete information
- Follow up on responses
- Close resolved issues

### Code Reviews
- Focus on code quality and functionality
- Suggest improvements professionally
- Explain reasoning for requests
- Recognize good contributions

## 📈 Recognition

### Contributor Acknowledgment
- Contributors listed in README.md
- Significant contributions highlighted in releases
- Code attribution in script headers
- Community recognition in discussions

### Contribution Types Recognized
- Code contributions (scripts, fixes, improvements)
- Documentation improvements
- Issue reporting and testing
- Community support and mentoring

## 📞 Getting Help

### Support Channels
- **GitHub Issues**: Technical problems and bugs
- **Discussions**: General questions and ideas
- **Email**: kevin@averageintelligence.ai for direct contact
- **Documentation**: Check README files first

### Response Times
- **Issues**: 24-48 hours for initial response
- **Pull Requests**: 48-72 hours for review
- **Discussions**: 24-48 hours for community questions
- **Email**: 24-72 hours for direct inquiries

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Workspace Automation! Your efforts help create better tools for Google Workspace users worldwide.
