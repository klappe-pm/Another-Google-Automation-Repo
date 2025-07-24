# Documentation Style Guide

This document outlines the documentation standards and conventions for all services built from this template.

## File Headers

Every Google Apps Script file (`.gs`) must include a standardized header with the following format:

```javascript
/**
 * @fileoverview [Brief description of the file's purpose and functionality]
 * @author [Your Full Name] <[your.email@domain.com]>
 * @version [Semantic version number, e.g., 1.0.0]
 * @since [Date when file was created, format: YYYY-MM-DD]
 * @lastmodified [Date when file was last modified, format: YYYY-MM-DD]
 */
```

### Example:
```javascript
/**
 * @fileoverview Gmail automation service for processing daily reports
 * @author John Doe <john.doe@company.com>
 * @version 1.2.0
 * @since 2024-01-15
 * @lastmodified 2024-02-01
 */
```

## Function Documentation

All functions must be documented using JSDoc format with the following elements:

- **Description**: Brief explanation of what the function does
- **@param**: For each parameter, specify type and description
- **@returns**: Specify return type and description
- **@throws**: Document any exceptions that may be thrown
- **@example**: Provide usage example for complex functions
- **@deprecated**: Mark deprecated functions (if applicable)
- **@since**: Version when function was added (if applicable)

### Template:
```javascript
/**
 * [Brief description of what the function does]
 * 
 * [Optional: More detailed description if needed]
 * 
 * @param {type} paramName - Description of the parameter
 * @param {type} [optionalParam] - Description of optional parameter
 * @param {type} [optionalParam=defaultValue] - Optional parameter with default
 * @returns {returnType} Description of what is returned
 * @throws {ErrorType} Description of when this error is thrown
 * @example
 * // Example usage
 * const result = myFunction('value', 42);
 * console.log(result);
 * 
 * @since 1.1.0
 */
function myFunction(paramName, optionalParam = null) {
  // Implementation
}
```

### Parameter Types

Use these standard types for parameters:

- `string` - Text string
- `number` - Numeric value
- `boolean` - True/false value
- `Date` - Date object
- `Array` - Array of items
- `Array<type>` - Array of specific type (e.g., `Array<string>`)
- `Object` - Generic object
- `{key: type}` - Object with specific structure
- `Function` - Function reference
- `*` - Any type
- `void` - No return value

### Example Function Documentation:
```javascript
/**
 * Processes email messages and extracts attachment data
 * 
 * This function searches for emails matching the given criteria,
 * downloads attachments, and returns metadata about each file.
 * 
 * @param {string} searchQuery - Gmail search query string
 * @param {number} [maxResults=50] - Maximum number of emails to process
 * @param {boolean} [includeAttachments=true] - Whether to download attachments
 * @returns {Array<Object>} Array of email objects with attachment metadata
 * @throws {Error} When Gmail API access fails or search query is invalid
 * @example
 * // Process recent invoices
 * const emails = processEmails('subject:invoice newer_than:7d', 25);
 * console.log(`Processed ${emails.length} emails`);
 * 
 * @since 1.0.0
 */
function processEmails(searchQuery, maxResults = 50, includeAttachments = true) {
  // Implementation
}
```

## Code Style Guidelines

### Naming Conventions

- **Variables and Functions**: camelCase
  ```javascript
  const userName = 'john';
  function getUserData() { }
  ```

- **Constants**: UPPER_SNAKE_CASE
  ```javascript
  const MAX_RETRY_ATTEMPTS = 3;
  const API_BASE_URL = 'https://api.example.com';
  ```

- **Classes**: PascalCase
  ```javascript
  class EmailProcessor { }
  class DataValidator { }
  ```

- **Private Methods**: Prefix with underscore
  ```javascript
  function _privateHelper() { }
  class MyClass {
    _privateMethod() { }
  }
  ```

### Formatting Rules

- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Maximum 100 characters
- **Semicolons**: Always use semicolons
- **Quotes**: Use single quotes for strings
- **Trailing Commas**: Use in multi-line objects and arrays

### Example:
```javascript
const CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
};

function processData(input) {
  const result = input
    .filter(item => item.isValid)
    .map(item => ({
      id: item.id,
      name: item.name,
      timestamp: new Date(),
    }));
  
  return result;
}
```

## Comments

### Single-line Comments
Use `//` for single-line comments. Comments should explain "why", not "what".

```javascript
// Calculate tax amount using current rate
const tax = amount * TAX_RATE;

// Retry API call due to potential network issues
const result = RetryHelper.execute(() => callAPI());
```

### Multi-line Comments
Use `/* */` for multi-line comments.

```javascript
/*
 * Complex algorithm explanation:
 * 1. First we sort the data by timestamp
 * 2. Then we group by user ID
 * 3. Finally we calculate aggregates
 */
```

### TODO Comments
Use a consistent format for TODO items:

```javascript
// TODO(username): Add error handling for edge case
// FIXME(username): Performance issue with large datasets
// HACK(username): Temporary workaround for API limitation
```

## Error Handling Documentation

### Error Messages
Error messages should be clear, actionable, and include context:

```javascript
// Good
throw new Error(`Failed to process email with ID ${emailId}: ${apiResponse.error}`);

// Bad
throw new Error('Email processing failed');
```

### Error Documentation
Document all possible errors a function might throw:

```javascript
/**
 * @throws {ValidationError} When input parameters are invalid
 * @throws {ApiError} When external API call fails
 * @throws {TimeoutError} When operation exceeds time limit
 */
```

## README Documentation

Every service should have a comprehensive README.md with:

1. **Service Description**: What the service does
2. **Installation**: How to set up the service
3. **Configuration**: Required settings and environment variables
4. **Usage**: How to use the service with examples
5. **API Reference**: Available functions and their signatures
6. **Error Handling**: Common errors and solutions
7. **Contributing**: Guidelines for contributors
8. **Support**: Contact information

## Changelog Documentation

Maintain a CHANGELOG.md file following semantic versioning:

```markdown
# Changelog

## [1.2.0] - 2024-02-01
### Added
- New email filtering functionality
- Support for batch processing

### Changed
- Improved error handling
- Updated API endpoints

### Fixed
- Memory leak in attachment processing

## [1.1.0] - 2024-01-15
### Added
- Initial release
```

## Documentation Review Process

1. **Self Review**: Author reviews their own documentation
2. **Peer Review**: At least one team member reviews changes
3. **Style Check**: Ensure adherence to this style guide
4. **Example Validation**: Verify all code examples work
5. **Link Check**: Ensure all links are functional

## Tools and Automation

- Use JSDoc to generate API documentation
- Validate code examples in documentation
- Use spell-check tools for documentation
- Automate style guide enforcement where possible

## Common Mistakes to Avoid

1. **Outdated Documentation**: Keep documentation current with code changes
2. **Missing Examples**: Always provide usage examples for public functions
3. **Vague Descriptions**: Be specific about what functions do and return
4. **Inconsistent Formatting**: Follow the established patterns
5. **Missing Error Documentation**: Document all possible exceptions
6. **Unclear Parameter Descriptions**: Explain what each parameter does
7. **No Version Information**: Always include version and modification dates

## Documentation Templates

Use the templates provided in this service template as starting points for new services. Customize them as needed while maintaining consistency with the overall documentation standards.
