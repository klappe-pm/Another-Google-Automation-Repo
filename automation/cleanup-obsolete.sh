#!/bin/bash
set -euo pipefail

# Cleanup obsolete scripts
# This script removes old/duplicate scripts that have been consolidated

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Cleaning up obsolete scripts..."
echo ""

# List of obsolete scripts to remove
OBSOLETE_SCRIPTS=(
  # Old formatters (consolidated into fixers/)
  "automation/tools/formatters/add-function-comments.js"
  "automation/tools/formatters/apply-smart-formatting.js"
  "automation/tools/formatters/clean-duplicates-final.js"
  "automation/tools/formatters/final-header-fix.js"
  "automation/tools/formatters/fix-all-naming-issues.js"
  "automation/tools/formatters/fix-script-headers.js"
  "automation/tools/formatters/fix-script-issues.js"
  "automation/tools/formatters/gas-formatter-smart.js"
  "automation/tools/formatters/gas-formatter.js"
  "automation/tools/formatters/lint-google-apps-scripts.js"
  "automation/tools/formatters/standardize-filenames.js"
  "automation/tools/formatters/standardize-script-headers.js"
  
  # Old validators (consolidated into precommit/)
  "automation/validation/javascript/analyze-and-verify-scripts.js"
  "automation/validation/javascript/script-validator.js"
  "automation/validation/javascript/validate-google-samples.js"
  "automation/validation/javascript/validate-projects.js"
  "automation/validation/javascript/validate-updates.js"
  "automation/validation/javascript/validation-script-validator.js"
  
  # Old git scripts (consolidated into deployment/)
  "automation/utilities/git-automation/auto-commit-push.sh"
  "automation/utilities/git-automation/auto-sync-full.sh"
  "automation/utilities/git-automation/cleanup-repo.sh"
  "automation/utilities/git-automation/fix-repo-quality.sh"
  "automation/utilities/git-automation/git-sync.sh"
  "automation/utilities/git-automation/init-git.sh"
  "automation/utilities/git-automation/migrate-unique-files.sh"
  "automation/utilities/git-automation/quick-sync.sh"
  "automation/utilities/git-automation/remove-duplicate-txt.sh"
  "automation/utilities/git-automation/remove-repo-duplicates.sh"
  "automation/utilities/git-automation/sync-control.sh"
  
  # Old deployment scripts
  "automation/deployment/scripts/add-missing-manifests.sh"
  "automation/deployment/scripts/manage-cloud-build-triggers.sh"
  "automation/deployment/scripts/restore-scripts.sh"
  "automation/deployment/scripts/update-project-mappings.sh"
  "automation/deployment/setup/complete_wif_setup.sh"
  "automation/deployment/setup/setup-auto-push.sh"
  "automation/deployment/setup/setup-git-hooks.sh"
  "automation/deployment/setup/setup-github-actions.sh"
  "automation/deployment/setup/setup-ide.sh"
  "automation/deployment/setup/unified_setup.sh"
  "automation/deployment/setup/verify_config_fixed.sh"
  
  # Old tools
  "automation/tools/gas-tools/gas-download-and-clean.js"
  "automation/tools/gas-tools/gas-quick-duplicate-check.js"
  "automation/tools/gas-tools/process-batch-projects.js"
  "automation/tools/gas-tools/process-external-scripts.js"
  "automation/tools/gas-tools/update-final-catalogs.js"
  "automation/tools/gas-tools/update-google-samples.js"
  
  # Duplicate/old scripts in docs
  "docs/tools/repo-review.js"
  "docs/tools/version-manager.js"
)

# Remove obsolete scripts
REMOVED=0
for script in "${OBSOLETE_SCRIPTS[@]}"; do
  FILE_PATH="$REPO_ROOT/$script"
  if [[ -f "$FILE_PATH" ]]; then
    rm "$FILE_PATH"
    echo "Removed: $script"
    ((REMOVED++))
  fi
done

# Clean up empty directories
echo ""
echo "Cleaning up empty directories..."
find "$REPO_ROOT/automation" -type d -empty -delete
find "$REPO_ROOT/docs/tools" -type d -empty -delete

echo ""
echo "Cleanup complete!"
echo "Removed $REMOVED obsolete scripts"