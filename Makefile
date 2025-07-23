# Workspace Automation Makefile
# Provides common development and maintenance tasks

.PHONY: help lint lint-fix test clean setup install

# Default target
help:
	@echo "Available targets:"
	@echo "  lint       - Run shellcheck on all shell scripts"
	@echo "  lint-fix   - Run shellcheck and attempt to fix issues"
	@echo "  test       - Run tests (if available)"
	@echo "  clean      - Clean temporary files"
	@echo "  setup      - Run initial project setup"
	@echo "  install    - Install dependencies"

# Lint all shell scripts with shellcheck
lint:
	@echo "🔍 Running shellcheck on all shell scripts..."
	@find . -name "*.sh" -type f -exec shellcheck -f gcc {} \; || true
	@echo "✅ Shellcheck complete"

# Lint with more detailed output and suggestions
lint-fix:
	@echo "🔧 Running shellcheck with suggestions..."
	@find . -name "*.sh" -type f -exec shellcheck -f gcc -x {} \; || true
	@echo "💡 Consider running: shellcheck --help for more options"

# Run tests (placeholder for future test framework)
test:
	@echo "🧪 Running tests..."
	@if [ -d "tests" ]; then \
		echo "Running test suite..."; \
		# Add test runner here when tests are implemented \
	else \
		echo "No tests directory found. Create tests/ directory and add test scripts."; \
	fi

# Clean temporary files and build artifacts
clean:
	@echo "🧹 Cleaning temporary files..."
	@find . -name "*.tmp" -type f -delete
	@find . -name "*.temp" -type f -delete
	@find . -name ".DS_Store" -type f -delete
	@echo "✅ Cleanup complete"

# Run initial project setup
setup:
	@echo "⚙️  Running project setup..."
	@if [ -f "unified_setup.sh" ]; then \
		echo "Running unified setup script..."; \
		./unified_setup.sh; \
	else \
		echo "Setup script not found. Please run setup manually."; \
	fi

# Install dependencies (placeholder for package managers)
install:
	@echo "📦 Installing dependencies..."
	@if command -v npm >/dev/null 2>&1 && [ -f "package.json" ]; then \
		npm install; \
	elif command -v clasp >/dev/null 2>&1; then \
		echo "Google Apps Script CLI (clasp) is available"; \
	else \
		echo "Installing clasp..."; \
		npm install -g @google/clasp; \
	fi
	@echo "✅ Dependencies installed"

# Continuous linting - watch for changes and run shellcheck
watch-lint:
	@echo "👀 Watching for shell script changes..."
	@if command -v fswatch >/dev/null 2>&1; then \
		fswatch -o . --include=".*\.sh$$" | xargs -n1 -I{} make lint; \
	else \
		echo "fswatch not found. Install with: brew install fswatch"; \
	fi

# Check shell script compliance
check-compliance:
	@echo "📋 Checking shell script compliance..."
	@scripts_total=$$(find . -name "*.sh" -type f | wc -l | tr -d ' '); \
	bash_header_count=$$(find . -name "*.sh" -type f -exec grep -l "^#!/usr/bin/env bash" {} \; | wc -l | tr -d ' '); \
	set_pipefail_count=$$(find . -name "*.sh" -type f -exec grep -l "set -euo pipefail" {} \; | wc -l | tr -d ' '); \
	echo "Total shell scripts: $$scripts_total"; \
	echo "Scripts with #!/usr/bin/env bash: $$bash_header_count"; \
	echo "Scripts with set -euo pipefail: $$set_pipefail_count"; \
	if [ "$$bash_header_count" -eq "$$scripts_total" ] && [ "$$set_pipefail_count" -eq "$$scripts_total" ]; then \
		echo "✅ All scripts are compliant"; \
	else \
		echo "❌ Some scripts need fixes"; \
		exit 1; \
	fi

# Generate shell script report
report:
	@echo "📊 Generating shell script report..."
	@echo "# Shell Script Compliance Report" > shell-script-report.md
	@echo "Generated: $$(date)" >> shell-script-report.md
	@echo "" >> shell-script-report.md
	@echo "## Summary" >> shell-script-report.md
	@scripts_total=$$(find . -name "*.sh" -type f | wc -l | tr -d ' '); \
	echo "- Total shell scripts: $$scripts_total" >> shell-script-report.md
	@echo "" >> shell-script-report.md
	@echo "## Scripts by Directory" >> shell-script-report.md
	@find . -name "*.sh" -type f | sed 's|^\./||' | sort >> shell-script-report.md
	@echo "" >> shell-script-report.md
	@echo "## Shellcheck Results" >> shell-script-report.md
	@echo '```' >> shell-script-report.md
	@find . -name "*.sh" -type f -exec shellcheck -f gcc {} \; >> shell-script-report.md 2>&1 || true
	@echo '```' >> shell-script-report.md
	@echo "✅ Report generated: shell-script-report.md"
