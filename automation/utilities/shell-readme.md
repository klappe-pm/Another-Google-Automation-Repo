# Shell Automation Scripts

This directory contains Bash shell scripts for system-level automation, organized by functionality.

## Subdirectories

### `git-automation/`
Git and repository management scripts for automated commits, synchronization, cleanup, and quality control.

### `deployment/`
Deployment and project management scripts for local deployment, testing, cloud build management, and project restoration.

### `security/`
Security scanning and analysis scripts for comprehensive security assessment and vulnerability detection.

### `setup/`
Environment and project setup scripts for configuring development environments, git hooks, and CI/CD pipelines.

## General Usage

Make scripts executable and run directly:
```bash
chmod +x script-name.sh
./script-name.sh
```

Most scripts include help information when run with `-h` or `--help` flags.

## Prerequisites

- Bash shell
- Git
- Various command-line tools (specified in individual scripts)

## Security Note

Review all scripts before execution, especially those that modify system configurations or handle credentials.

## Contact

Kevin Lappe - kevin@averageintelligence.ai
