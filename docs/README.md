# Documentation

This directory contains all documentation for the Google Workspace Automation project.

## Quick Links

- [Setup Guide](SETUP.md) - Get started with the project
- [Development Guide](development/DEVELOPMENT.md) - Coding standards and practices
- [API Permissions](api/API_PERMISSIONS.md) - Required Google API scopes
- [Script Catalog](catalogs/SCRIPT_CATALOG.md) - Complete list of available scripts
- [Architecture Overview](ARCHITECTURE.md) - System architecture and design

## Documentation Structure

```
docs/
├── README.md                    # This file
├── SETUP.md                    # Installation and setup guide
├── ARCHITECTURE.md             # System architecture overview
├── LICENSE.md                  # License information
│
├── api/                        # API documentation
│   ├── API_PERMISSIONS.md      # Required Google API scopes
│   └── API_PERMISSIONS_AUDIT.md # API audit results
│
├── architecture/               # System architecture docs
│   └── [architecture diagrams and docs]
│
├── catalogs/                   # Script and tool catalogs
│   ├── SCRIPT_CATALOG.md       # Complete script listing
│   ├── SCRIPT_INVENTORY.md     # Script inventory details
│   └── SHELL_SCRIPT_CATALOG.md # Shell script catalog
│
├── claude/                     # AI-generated documentation
│   ├── README.md               # Claude docs index
│   ├── STATE_OF_REPOSITORY_*.md # Repository state reports
│   └── [migration and standardization reports]
│
├── deployment/                 # Deployment documentation
│   └── [deployment guides]
│
├── development/                # Development resources
│   ├── DEVELOPMENT.md          # Development guidelines
│   └── GAS_DEVELOPMENT_TOOLS.md # GAS dev tools guide
│
├── diagrams/                   # Visual documentation
│   ├── ARCHITECTURE.md         # Architecture diagrams
│   ├── DATA_FLOW.md           # Data flow diagrams
│   └── [other diagrams]
│
├── guides/                     # User and developer guides
│   └── [various guides]
│
├── milestones/                 # Project milestones
│   └── [milestone documentation]
│
├── reorganization/             # Reorganization docs
│   └── [reorganization plans and logs]
│
├── reports/                    # Various reports
│   ├── daily/                  # Daily reports
│   ├── weekly/                 # Weekly reports
│   └── [other reports]
│
├── security/                   # Security documentation
│   ├── README.md              # Security overview
│   ├── SECURITY_REVIEW.md     # Security review results
│   └── Snyk/                  # Snyk security tools
│
├── setup/                      # Setup documentation
│   ├── CONTRIBUTING.md        # Contribution guidelines
│   └── [setup guides]
│
├── standards/                  # Coding standards
│   ├── README.md              # Standards overview
│   ├── gas-style-guide.md     # GAS style guide
│   ├── templates/             # Code templates
│   └── [other standards]
│
└── tools/                      # Tool documentation
    ├── README.md              # Tools overview
    └── [tool documentation]
```

## Key Documentation

### For Users
- **[Setup Guide](SETUP.md)** - Installation and configuration
- **[Script Catalog](catalogs/SCRIPT_CATALOG.md)** - Available automation scripts
- **[API Permissions](api/API_PERMISSIONS.md)** - Required permissions

### For Developers
- **[Development Guide](development/DEVELOPMENT.md)** - Coding standards and practices
- **[Architecture](ARCHITECTURE.md)** - System design and structure
- **[Style Guide](standards/gas-style-guide.md)** - Google Apps Script style guide

### Project Management
- **[State of Repository](claude/STATE_OF_REPOSITORY_2025-07-26.md)** - Current project status
- **[Milestones](milestones/)** - Project milestones and progress
- **[Reports](reports/)** - Various project reports

## Contributing

Please read [CONTRIBUTING.md](setup/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

*Last Updated: July 26, 2025*