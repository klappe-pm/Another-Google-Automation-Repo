#!/bin/bash
# Add missing appsscript.json manifest files

MANIFEST_CONTENT='{
  "timeZone": "America/Los_Angeles",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}'

# Projects that need manifest files
PROJECTS_NEEDING_MANIFEST=(
    "docs"
    "photos"
    "sheets"
    "slides"
    "tasks"
    "utility"
)

echo "Adding missing appsscript.json files..."

for project in "${PROJECTS_NEEDING_MANIFEST[@]}"; do
    MANIFEST_PATH="projects/$project/src/appsscript.json"
    
    # Create src directory if it doesn't exist
    mkdir -p "projects/$project/src"
    
    # Create manifest file
    echo "$MANIFEST_CONTENT" > "$MANIFEST_PATH"
    echo "✅ Created $MANIFEST_PATH"
done

echo "Done! All manifest files created."