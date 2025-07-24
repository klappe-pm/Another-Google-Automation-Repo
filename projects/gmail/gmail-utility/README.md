# Service Template

This is a reusable template for Google Apps Script services that provides a standardized foundation for all service teams.

## Structure

```
service-template/
├── src/
│   ├── config.gs      # Configuration and constants
│   ├── common.gs      # Common utilities and shared functions
│   ├── utils.gs       # Utility functions
│   └── test.gs        # Testing framework and helpers
├── test/              # Test files
├── docs/              # Documentation
├── deploy/
│   └── deploy.gs      # Deployment scripts
├── appsscript.json    # Apps Script manifest
└── README.md          # This file
```

## Usage

1. **Copy the template**: Create a new directory and copy all files from this template
2. **Customize**: Update the configuration in `src/config.gs` for your specific service
3. **Implement**: Add your service-specific code following the established patterns
4. **Test**: Use the testing framework in `src/test.gs` to validate your implementation
5. **Deploy**: Use the deployment script in `deploy/deploy.gs` to publish your service

## File Headers

All Google Apps Script files should include the following header format:

```javascript
/**
 * @fileoverview [Brief description of the file's purpose]
 * @author Platform Team <platform-team@company.com>
 * @version 1.0.0
 * @since 2025-07-24
 * @lastmodified 2025-07-24
 */
```

## Documentation Style Guide

### Function Documentation

Use JSDoc format for all functions:

```javascript
/**
 * Brief description of what the function does
 * @param {string} param1 - Description of parameter 1
 * @param {number} param2 - Description of parameter 2
 * @returns {boolean} Description of return value
 * @throws {Error} When something goes wrong
 * @example
 * // Example usage
 * const result = myFunction('test', 42);
 */
function myFunction(param1, param2) {
  // Implementation
}
```

### Code Style

- Use camelCase for variables and functions
- Use PascalCase for classes and constructors
- Use UPPER_SNAKE_CASE for constants
- Indent with 2 spaces
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters

### Comments

- Use `//` for single-line comments
- Use `/* */` for multi-line comments
- Write comments that explain "why", not "what"
- Keep comments up-to-date with code changes

## Getting Started

1. Replace `gmail-utility` placeholders with your actual service name
2. Update the configuration constants in `src/config.gs`
3. Implement your service logic in the `src/` directory
4. Write tests using the framework in `src/test.gs`
5. Document your API and usage in the `docs/` directory
6. Use the deployment script to publish your service

## Support

For questions or issues with this template, please contact the platform team.
