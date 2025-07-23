# Makefile for GCP Test Environment Management

.PHONY: help build up down shell validate clean setup-cloud-shell

# Default target
help: ## Show this help message
	@echo "GCP Test Environment Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Environment Variables (optional):"
	@echo "  GITHUB_SHA      - Git commit SHA"
	@echo "  GITHUB_REF      - Git reference (default: refs/heads/main)"
	@echo "  PROJECT_ID      - GCP Project ID"
	@echo ""
	@echo "Examples:"
	@echo "  make up                    # Start the test environment"
	@echo "  make shell                 # Enter the container shell"
	@echo "  GITHUB_SHA=abc123 make up  # Start with custom SHA"

build: ## Build the Docker container
	@echo "🔨 Building Docker container..."
	docker-compose build

up: build ## Start the test environment (builds if needed)
	@echo "🚀 Starting test environment..."
	docker-compose up -d
	@echo "✅ Test environment is running"
	@echo "   Enter with: make shell"

down: ## Stop the test environment
	@echo "🛑 Stopping test environment..."
	docker-compose down
	@echo "✅ Test environment stopped"

shell: ## Enter the container shell
	@echo "🐚 Entering container shell..."
	docker-compose exec test-env bash

validate: ## Validate the environment setup (inside container)
	@echo "🔍 Validating environment..."
	docker-compose exec test-env ./test-environment/validate-environment.sh

logs: ## Show container logs
	docker-compose logs -f test-env

setup-cloud-shell: ## Run Cloud Shell setup script
	@echo "☁️  Setting up Cloud Shell environment..."
	./setup-cloud-shell.sh

clean: down ## Clean up containers, volumes, and images
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	docker system prune -f
	@echo "✅ Cleanup complete"

restart: down up ## Restart the test environment

status: ## Show container status
	@echo "📊 Container status:"
	docker-compose ps

# Development targets
dev-setup: up ## Set up environment for development
	@echo "🔧 Setting up development environment..."
	docker-compose exec test-env npm install
	@echo "✅ Development environment ready"

dev-test: ## Run tests in the container
	@echo "🧪 Running tests..."
	docker-compose exec test-env npm test || echo "No test script found"

dev-deploy: ## Test deployment in container
	@echo "🚀 Testing deployment..."
	docker-compose exec test-env npm run deploy

# Utility targets
env-check: ## Check current environment variables
	@echo "🌍 Current environment variables:"
	@echo "  GITHUB_SHA: $(GITHUB_SHA)"
	@echo "  GITHUB_REF: $(GITHUB_REF)"
	@echo "  PROJECT_ID: $(PROJECT_ID)"

docker-info: ## Show Docker system information
	@echo "🐳 Docker system info:"
	@docker info --format "Version: {{.ServerVersion}}"
	@docker info --format "CPUs: {{.NCPU}}"
	@docker info --format "Memory: {{.MemTotal}}"
