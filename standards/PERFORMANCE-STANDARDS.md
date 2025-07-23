# Google Apps Script Performance Standards

## Overview
Performance optimization guidelines for Google Apps Script development.

## Core Performance Principles

### 1. Minimize API Calls
- Batch operations when possible
- Use getRange() instead of multiple getValue() calls
- Cache frequently accessed data

### 2. Execution Time Management
- Keep functions under 6-minute execution limit
- Use time-based triggers for long operations
- Implement progress tracking for complex tasks

### 3. Memory Management
- Release large objects when done
- Avoid memory-intensive operations
- Use efficient data structures

## Implementation
All scripts should follow these performance guidelines for optimal execution.

---
**Contact**: kevin@averageintelligence.ai  
**Last Updated**: 2025-07-23
