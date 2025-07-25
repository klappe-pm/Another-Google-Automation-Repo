#!/bin/bash
# Restore actual scripts from backup to projects folder

set -e

echo "🔄 Restoring Scripts from Backup"
echo "================================"

# Gmail scripts
echo "📧 Restoring Gmail scripts..."
rm -f projects/gmail/src/*.gs  # Remove stub files
cp "scripts-backup-20250723/gmail/Export Functions/"*.gs projects/gmail/src/ 2>/dev/null || true
cp "scripts-backup-20250723/gmail/Analysis Tools/"*.gs projects/gmail/src/ 2>/dev/null || true
cp "scripts-backup-20250723/gmail/Label Management/"*.gs projects/gmail/src/ 2>/dev/null || true
cp "scripts-backup-20250723/gmail/Utility Tools/"*.gs projects/gmail/src/ 2>/dev/null || true
cp "scripts-backup-20250723/gmail/Legacy Files/"*.gs projects/gmail/src/ 2>/dev/null || true

# Photos scripts  
echo "📷 Checking Photos scripts..."
# Already has the correct script

# Chat scripts
echo "💬 Checking Chat scripts..."
# Already has the correct script

# Count scripts
echo ""
echo "📊 Script Count Summary:"
echo "========================"
for service in calendar chat docs drive gmail photos sheets slides tasks utility; do
    count=$(ls -1 projects/$service/src/*.gs 2>/dev/null | wc -l | tr -d ' ')
    echo "$service: $count scripts"
done

echo ""
echo "✅ Script restoration complete!"