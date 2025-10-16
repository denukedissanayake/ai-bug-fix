# AI-Powered Security Vulnerability Scanner

A production-ready, modular GitHub Actions workflow system for automated security vulnerability scanning with AI-powered fix suggestions using GitHub Copilot.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [Composite Actions](#composite-actions)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This repository provides a complete, production-ready security scanning solution that:
- Scans for vulnerabilities using Snyk
- Processes and categorizes security issues
- Automatically creates GitHub issues with detailed vulnerability information
- Assigns issues to GitHub Copilot for AI-powered fix suggestions
- Supports both local use and cross-repository sharing

## 🏗️ Architecture

The system is built using a modular architecture with three main components:

```
.github/
├── workflows/
│   ├── security-scan-reusable.yml    # Main reusable workflow
│   └── security-scan-caller.yml      # Example caller workflow
└── actions/
    ├── scan-vulnerabilities/         # Composite action for scanning
    │   └── action.yml
    ├── process-vulnerabilities/      # Composite action for processing
    │   └── action.yml
    └── create-security-issue/        # Composite action for issue creation
        └── action.yml
```

### Component Responsibilities

1. **scan-vulnerabilities**: Runs Snyk dependency and code scans
2. **process-vulnerabilities**: Analyzes scan results and generates reports
3. **create-security-issue**: Creates GitHub issues and assigns to Copilot
4. **security-scan-reusable**: Orchestrates all components into a complete workflow

## ✨ Features

- 🔍 **Comprehensive Scanning**: Both dependency and code vulnerability detection
- 🤖 **AI Integration**: Automatic assignment to GitHub Copilot for fix suggestions
- 📊 **Detailed Reporting**: Rich vulnerability reports with CVSS scores and fix commands
- 🔄 **Reusable**: Use across multiple repositories
- 🧩 **Modular**: Easy to customize and extend
- 🏷️ **Smart Labeling**: Automatic severity-based issue labeling
- 📌 **Issue Pinning**: Critical issues are automatically pinned
- 📈 **GitHub Actions Summary**: Beautiful scan summaries in workflow runs

## 🚀 Quick Start

### For This Repository

1. **Set up secrets** in your repository settings:
   - `SNYK_TOKEN`: Your Snyk API token ([Get one here](https://snyk.io))
   - `GH_TOKEN`: GitHub Personal Access Token with `repo` and `write:discussion` permissions

2. **Enable the workflow**:
   - The workflow runs automatically daily at 2 AM UTC
   - Triggers on pushes/PRs to main branch
   - Can be manually triggered via workflow_dispatch

3. **Run manually** (optional):
   ```bash
   # Via GitHub UI: Actions → Security Scan Caller → Run workflow
   
   # Or via GitHub CLI:
   gh workflow run security-scan-caller.yml
   ```

### For Other Repositories

**Option 1: Use as a Reusable Workflow**

Create `.github/workflows/security-scan.yml` in your repository:

```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  security-scan:
    uses: your-org/ai-bug-fix/.github/workflows/security-scan-reusable.yml@main
    with:
      node-version: '18'
      working-directory: '.'
      create-issue: true
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

**Option 2: Copy the Composite Actions**

1. Copy the `.github/actions/` directory to your repository
2. Use individual actions in your workflows:

```yaml
- name: Scan vulnerabilities
  uses: ./.github/actions/scan-vulnerabilities
  with:
    snyk-token: ${{ secrets.SNYK_TOKEN }}
    node-version: '18'
```

## 📖 Usage

### Using the Reusable Workflow

```yaml
jobs:
  security-scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      # Optional: Node.js version (default: '18')
      node-version: '20'
      
      # Optional: Working directory (default: '.')
      working-directory: './backend'
      
      # Optional: Create GitHub issue (default: true)
      create-issue: true
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

### Using Individual Composite Actions

```yaml
jobs:
  custom-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Step 1: Scan
      - name: Run vulnerability scan
        id: scan
        uses: ./.github/actions/scan-vulnerabilities
        with:
          snyk-token: ${{ secrets.SNYK_TOKEN }}
          node-version: '18'
      
      # Step 2: Process
      - name: Process results
        id: process
        uses: ./.github/actions/process-vulnerabilities
        with:
          scan-results-path: ${{ steps.scan.outputs.scan-results-path }}
          repository: ${{ github.repository }}
      
      # Step 3: Create issue (conditional)
      - name: Create issue
        if: steps.process.outputs.has-vulnerabilities == 'true'
        uses: ./.github/actions/create-security-issue
        with:
          github-token: ${{ secrets.GH_TOKEN }}
          vulnerability-data-path: 'detailed-vulnerabilities.json'
          repository: ${{ github.repository }}
          run-id: ${{ github.run_id }}
          server-url: ${{ github.server_url }}
```

## ⚙️ Configuration

### Required Secrets

| Secret | Description | Required |
|--------|-------------|----------|
| `SNYK_TOKEN` | Snyk API token for vulnerability scanning | ✅ Yes |
| `GH_TOKEN` | GitHub token for creating issues (needs `repo` scope) | ⚠️ Conditional* |

*Required if `create-issue: true` (default). Can fallback to `GITHUB_TOKEN` with limited permissions.

### Workflow Inputs

| Input | Description | Default | Type |
|-------|-------------|---------|------|
| `node-version` | Node.js version to use | `'18'` | string |
| `working-directory` | Directory to run scans in | `'.'` | string |
| `create-issue` | Whether to create GitHub issues | `true` | boolean |

### Workflow Outputs

| Output | Description | Type |
|--------|-------------|------|
| `vulnerabilities-found` | Number of vulnerabilities detected | number |
| `has-vulnerabilities` | Whether any vulnerabilities were found | boolean |

## 🧩 Composite Actions

### 1. scan-vulnerabilities

Runs Snyk dependency and code analysis scans.

**Inputs:**
- `snyk-token` (required): Snyk API token
- `node-version` (optional, default: '18'): Node.js version
- `working-directory` (optional, default: '.'): Scan directory

**Outputs:**
- `scan-results-path`: Path to merged scan results JSON

### 2. process-vulnerabilities

Processes scan results and generates vulnerability reports.

**Inputs:**
- `scan-results-path` (required): Path to scan results
- `repository` (required): Repository name (owner/repo)

**Outputs:**
- `vulnerability-count`: Number of vulnerabilities
- `has-vulnerabilities`: Boolean flag
- `detailed-results-path`: Path to detailed JSON
- `report-path`: Path to markdown report

### 3. create-security-issue

Creates GitHub issues with vulnerability details and assigns to Copilot.

**Inputs:**
- `github-token` (required): GitHub token
- `vulnerability-data-path` (required): Path to vulnerability data
- `repository` (required): Repository name
- `run-id` (required): GitHub Actions run ID
- `server-url` (optional, default: 'https://github.com'): GitHub server URL

## 🎓 Advanced Usage

### Using with Monorepos

```yaml
jobs:
  scan-frontend:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      working-directory: './frontend'
      node-version: '20'
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      GH_TOKEN: ${{ secrets.GH_TOKEN }}
  
  scan-backend:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      working-directory: './backend'
      node-version: '18'
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

### Scan Without Creating Issues

```yaml
jobs:
  scan-only:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      create-issue: false
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Using Outputs in Other Jobs

```yaml
jobs:
  security-scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      create-issue: false
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  
  notify-team:
    needs: security-scan
    if: needs.security-scan.outputs.has-vulnerabilities == 'true'
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack notification
        run: |
          echo "Found ${{ needs.security-scan.outputs.vulnerabilities-found }} vulnerabilities!"
          # Add your notification logic here
```

### Custom Issue Creation

If you want to customize issue creation, disable it and use the artifacts:

```yaml
jobs:
  security-scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      create-issue: false
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  
  custom-issue:
    needs: security-scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: vulnerability-data
      
      - name: Create custom issue
        run: |
          # Your custom issue creation logic
          cat detailed-vulnerabilities.json
```

## 🔧 Troubleshooting

### Common Issues

**Problem: "SNYK_TOKEN not found"**
```
Solution: Add SNYK_TOKEN to repository secrets
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: SNYK_TOKEN
4. Value: Your Snyk API token from https://snyk.io
```

**Problem: "Cannot create issue - GH_TOKEN permissions"**
```
Solution: Ensure GH_TOKEN has correct permissions
1. Create a Personal Access Token with 'repo' scope
2. Add it as GH_TOKEN secret
3. Or use GITHUB_TOKEN (limited functionality)
```

**Problem: "Copilot assignment failed"**
```
Solution: This is a warning, not an error
- The issue is still created successfully
- Copilot assignment requires specific repository settings
- Manual assignment is possible from the issue page
```

**Problem: "No vulnerabilities detected but dependencies are outdated"**
```
Solution: Snyk only reports known vulnerabilities
- Run 'npm audit' for broader security checks
- Update dependencies regularly
- Use Dependabot for automated updates
```

### Debug Mode

Enable debug logging in your workflow:

```yaml
jobs:
  security-scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      node-version: '18'
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      GH_TOKEN: ${{ secrets.GH_TOKEN }}

env:
  ACTIONS_STEP_DEBUG: true
```

## 📊 Output Examples

### GitHub Actions Summary

The workflow generates a rich summary visible in the Actions tab:

```markdown
## Snyk Vulnerability Scan Results

**Scan Date:** 2025-10-16

**Total Vulnerabilities:** 5
**Critical Vulnerabilities:** 1
**High Vulnerabilities:** 2
**Medium Vulnerabilities:** 1
**Low Vulnerabilities:** 1
```

### Created GitHub Issue

Issues include:
- Complete vulnerability details
- Fix commands for each issue
- Severity classification
- Dependency paths
- CVE references
- Automatic Copilot assignment

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Snyk](https://snyk.io) for vulnerability scanning
- [GitHub Actions](https://github.com/features/actions) for automation
- [GitHub Copilot](https://github.com/features/copilot) for AI-powered fixes

## 📞 Support

- 📖 Documentation: This README
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/ai-bug-fix/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/ai-bug-fix/discussions)

---

Made with ❤️ for secure software development
