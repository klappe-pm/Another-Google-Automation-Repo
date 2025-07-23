# Contributing Guidelines

Welcome to the Workspace Automation project! This guide will help you contribute effectively to our Google Apps Script automation tools.

## Branch Strategy

We use a Git flow approach with two main branches:

- **`develop`** → Development environment: All feature branches should be branched off from `develop`
- **`main`** → Production environment: Only stable, tested code gets merged here

### Workflow:
1. Create feature branches from `develop`
2. Submit PRs to merge into `develop`
3. Periodically merge `develop` into `main` for releases

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples:
- `feat(gmail): add PDF export functionality`
- `fix(calendar): correct date parsing in event creation`
- `docs: update API documentation for drive automation`
- `chore: update dependencies to latest versions`

## Pull Request Checklist

Before submitting a pull request, ensure all of the following items are completed:

### Code Quality
- [ ] **Linting**: Code passes ESLint without errors (`npm run lint` if available)
- [ ] **Unit Tests**: All existing tests pass and new features include tests
- [ ] **CI Green**: All GitHub Actions workflows pass successfully
- [ ] **Code Review**: Code has been self-reviewed for clarity and efficiency

### Google Apps Script Specific
- [ ] **File Naming**: Follows convention `service-function-descriptor.gs`
- [ ] **Script Headers**: Include required headers (Title, Service, Purpose, Author)
- [ ] **README**: Service directories have appropriate README.md files
- [ ] **No Secrets**: No hardcoded API keys, passwords, or sensitive information

### Documentation
- [ ] **Comments**: Code is well-commented, especially complex logic
- [ ] **Documentation**: Update relevant documentation if needed
- [ ] **Changelog**: Add entry to CHANGELOG.md for significant changes

### Testing
- [ ] **Manual Testing**: Feature has been manually tested
- [ ] **Edge Cases**: Consider and test edge cases
- [ ] **Error Handling**: Proper error handling is implemented

## Code Style Guidelines

### ESLint Configuration
Our code style is enforced by ESLint. Please adhere to the rules defined in [`.eslintrc.temp.js`](./.eslintrc.temp.js).

### Google Apps Script Standards
- Use descriptive variable and function names
- Follow camelCase naming convention
- Include proper JSDoc comments for functions
- Handle errors gracefully with try-catch blocks
- Use consistent indentation (2 spaces)

### File Structure
```
scripts/
├── service-name/
│   ├── README.md
│   ├── service-function-descriptor.gs
│   └── service-helper-utilities.gs
```

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/klappe-pm/another-google-automation-repo.git
   cd workspace-automation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Google Apps Script CLI** (if needed):
   ```bash
   npm install -g @google/clasp
   clasp login
   ```

4. **Run setup scripts**:
   ```bash
   npm run setup
   ```

## Testing

- Run validation: `npm run validate`
- Security scan: `npm run security:scan`
- Repository review: `npm run repo:review`

## Getting Help

- Check existing [Issues](https://github.com/klappe-pm/another-google-automation-repo/issues)
- Review the [README.md](./README.md) for project overview
- Look at existing scripts for examples
- Create a new issue for questions or bug reports

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](./LICENSE.md) that covers the project.
