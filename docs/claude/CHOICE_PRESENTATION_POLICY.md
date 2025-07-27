# Choice Presentation Policy

**Effective: Immediately**  
**Purpose**: Ensure all choices presented to users are clear, contextual, and actionable

## Policy Requirements

When presenting numbered choices (1, 2, 3, etc.), ALWAYS include:

### 1. Context Section
- **What you're being asked to do** - Plain language explanation
- **Why this choice matters** - Impact and importance
- **Current state** - What exists now

### 2. Before/After Section
- **Before** - Current state with specific examples
- **After** - Expected state after each choice
- **Differences** - Clear comparison table when helpful

### 3. Choice Explanations
Each option must include:
- **Plain language description** - What selecting this means
- **Consequences** - What will happen
- **Recommendations** - When to choose this option
- **Examples** - Concrete examples of the outcome

## Template

```markdown
## Decision Required: [Title]

### What You're Being Asked to Do
[Plain language explanation of the decision needed]

### Current State (Before)
- [Specific current state points]
- [Examples from the actual system]

### Options Available

#### Option 1: [Descriptive Name]
**What this means**: [Plain language explanation]
**What will happen**: 
- [Specific action 1]
- [Specific action 2]
**After this choice**:
- [Resulting state 1]
- [Resulting state 2]
**Choose this when**: [Specific scenarios]
**Example outcome**: [Concrete example]

#### Option 2: [Descriptive Name]
[Same structure as Option 1]

#### Option 3: [Descriptive Name]
[Same structure as Option 1]

### Recommendation
[If applicable, which option is recommended and why]
```

## Example Implementation

### Bad Example ❌
```
Choose an option:
1. Fix headers
2. Update linter
3. Skip
```

### Good Example ✅
```
## Decision Required: Linter Header Format Mismatch

### What You're Being Asked to Do
The linter expects a different header format than what we standardized across 148 scripts. You need to decide how to resolve this mismatch.

### Current State (Before)
- **Our headers**: 8-section format (Script Name, Summary, Purpose, Steps, Functions, Helper Functions, Dependencies, Google Services)
- **Linter expects**: Different format with Title, Service, Created, Updated, Author, Contact, License
- **148 scripts** have our format, but fail linter checks

### Options Available

#### Option 1: Update All Script Headers to Match Linter
**What this means**: Change all 148 script headers to the format the linter expects
**What will happen**: 
- Run script to replace current headers with linter-expected format
- All scripts will pass linter checks
- Lose our standardized 8-section documentation
**After this choice**:
- 100% linter compliance
- Different documentation structure
- Need to update documentation standards
**Choose this when**: Linter compliance is more important than current documentation
**Example outcome**: Scripts will have metadata-focused headers instead of functional documentation

#### Option 2: Update Linter to Match Our Standards
**What this means**: Modify the linter to accept our 8-section header format
**What will happen**: 
- Edit gas-linter.js validation rules
- Keep all current headers unchanged
- Linter will validate our format
**After this choice**:
- 100% linter compliance with current headers
- No changes to 148 scripts needed
- Documentation remains functional-focused
**Choose this when**: You want to preserve current documentation investment
**Example outcome**: Linter checks for our 8 sections instead of metadata fields

#### Option 3: Hybrid Approach - Add Metadata to Current Headers
**What this means**: Keep our 8 sections but add linter-required metadata
**What will happen**: 
- Add metadata section to existing headers
- Keep functional documentation
- Scripts have both formats
**After this choice**:
- Headers are longer but comprehensive
- Both documentation styles preserved
- Some redundancy in headers
**Choose this when**: You want both compliance and current documentation
**Example outcome**: Headers with 8 sections plus metadata block

### Recommendation
Option 2 is recommended because:
- Preserves significant documentation work already completed
- Maintains functional focus that helps developers
- Easier to implement (1 file change vs 148)
- Aligns with our established standards
```

## Enforcement

1. **Immediate**: All choices in current session must follow this format
2. **Review**: Add to code review checklist
3. **Automation**: Create template generator for common choices
4. **Documentation**: Include in developer guidelines

## Benefits

- **Clarity**: Users understand exactly what they're choosing
- **Context**: Decisions are made with full information  
- **Confidence**: Users can predict outcomes
- **Traceability**: Decisions are well-documented
- **Reduced Errors**: Fewer misunderstandings and wrong choices

---

*This policy is effective immediately and applies to all future choice presentations*