#!/bin/bash

# Fix Google Apps Script syntax errors
echo "🚀 Fixing Google Apps Script syntax errors..."

# Find all .gs files and fix the common issues
find apps/ -name "*.gs" -type f | while read -r file; do
    echo "Processing: $file"
    
    # Fix malformed comment endings: "* /" -> "*/"
    sed -i '' 's/ \* \// \*\//g' "$file"
    
    # Fix malformed line comments: "/ /" -> "//"
    sed -i '' 's/\/ \/ /\/\/ /g' "$file"
    
    # Fix malformed line comments at start of line: "/ /" -> "//"
    sed -i '' 's/^/ \/ /\/\/ /g' "$file"
    
    # Fix specific pattern: "* / / * *" -> "*/\n/**"
    sed -i '' 's/\* \/ \/ \* \*/\*\/\n\/\*\*/g' "$file"
    
    # Fix specific pattern: "* / / / Main Functions" -> "*/\n\n// Main Functions"
    sed -i '' 's/\* \/ \/ \/ Main Functions/\*\/\n\n\/\/ Main Functions/g' "$file"
    
    # Fix any remaining "* / /" patterns -> "*/"
    sed -i '' 's/\* \/ \//\*\//g' "$file"
done

echo "✅ Completed fixing Google Apps Script syntax errors"
