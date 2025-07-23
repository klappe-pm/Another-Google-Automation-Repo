# Google Apps Script Documentation Style Guide

## 1. Script Documentation Template

### Script Header
```javascript
/**
 * Title: [Script Name]
 * Service: [Google Service Used]
 * Purpose: [Brief description of the script's main functionality]
 * Created: [Creation date]
 * Updated: [Last modification date]
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Usage: [Link to detailed usage guide]
 * 
 * Features:
 * - [Feature 1 description]
 * - [Feature 2 description]
 * - [Feature 3 description]
 * 
 * Requirements:
 * - Required permissions
 * - Required API access
 * - Required dependencies
 */
```

### Inline Comment Standards

#### Section Headers
```javascript
// ========================================
// [Section Name]
// ========================================
```

#### Function Documentation
```javascript
/**
 * [Brief description of function]
 * 
 * @param {Type} paramName Description of parameter
 * @returns {Type} Description of return value
 * @throws {ErrorType} Description of error condition
 */
```

#### Complex Logic
```javascript
// ----------------------------------------------------------------------
// [Complex Logic Section]
// ----------------------------------------------------------------------
//
// [Explanation of complex logic]
//
// Key considerations:
// - [Consideration 1]
// - [Consideration 2]
// - [Consideration 3]
```

#### Error Handling
```javascript
// ----------------------------------------------------------------------
// Error Handling
// ----------------------------------------------------------------------
//
// [Explanation of error handling strategy]
//
// Error conditions:
// - [Condition 1]
// - [Condition 2]
// - [Condition 3]
```

#### Configuration
```javascript
// ----------------------------------------------------------------------
// Configuration Settings
// ----------------------------------------------------------------------
//
// [Explanation of configuration]
//
// Configuration options:
// - [Option 1]: [Default value]
// - [Option 2]: [Default value]
// - [Option 3]: [Default value]
```

## 2. Usage Documentation Template

### Front Matter
```markdown
# [Script Name] Usage Guide

## Overview
[Brief overview of the script's purpose]

## Features
[List of features with brief descriptions]

## Prerequisites
[List of requirements]

## Setup
[Step-by-step setup instructions]

## Usage
[Detailed usage instructions]

### Example 1
[Example usage scenario]

### Example 2
[Another example scenario]

## Troubleshooting
[Common issues and solutions]

## Best Practices
[Best practices for using the script]

## Security Considerations
[Security-related considerations]

## Version History
[List of changes]
```

## 3. Script Metadata Standards

### Summary Header
- Must be at the top of every script
- Must include all required fields
- Must link to corresponding usage guide
- Must be updated with each modification
- Must include timeout handling strategy
- Must specify batch processing requirements (if applicable)

### Inline Comment Guidelines
1. **Clarity**\n   - Write clear, concise comments
   - Explain "why", not just "what"
   - Use proper grammar and spelling
   - Include debugging steps for error conditions
   - Document timeout handling strategy

2. **Consistency**
   - Use consistent formatting
   - Follow established patterns
   - Maintain consistent terminology
   - Use standard error message format
   - Follow batch processing patterns

3. **Maintenance**
   - Keep comments up-to-date
   - Remove outdated comments
   - Review comments during code reviews
   - Update error handling documentation
   - Review batch processing implementation

### Debugging Requirements
1. **Debug Logging**
   - Use debug function for development messages
   - Include timing information
   - Log function entry/exit points
   - Track batch processing progress
   - Document debugging steps

2. **Error Handling**
   - Use plain English error messages
   - Include debugging steps in error messages
   - Log comprehensive error context
   - Implement proper error recovery
   - Document error handling strategy

3. **Batch Processing**
   - Implement batch processing for large operations
   - Use standard batch size (100 items)
   - Include timeout checks
   - Document batch processing strategy
   - Handle partial failures gracefully

### Logging Standards
1. **Error Logging**
   - Use Logger.log('ERROR: ') for errors
   - Include timestamp
   - Include error context
   - Include debugging steps
   - Log error recovery attempts

2. **Debug Logging**
   - Use debug() function for development
   - Include function names
   - Include parameter values
   - Include timing information
   - Document debug log format

3. **Performance Logging**
   - Log start and end times
   - Log batch processing metrics
   - Log memory usage
   - Log API call counts
   - Document logging strategy

### Documentation Quality Checklist
- [ ] Script header is complete
- [ ] All functions are documented
- [ ] Complex logic is explained
- [ ] Error handling is documented
- [ ] Configuration is documented
- [ ] Usage guide link is valid
- [ ] Comments are clear and concise
- [ ] Documentation is up-to-date
- [ ] Examples are provided
- [ ] Security considerations are documented
