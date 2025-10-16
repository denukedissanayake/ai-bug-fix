# Multi-Language Security Scanning - Usage Guide

This security scanning solution now supports multiple programming languages and repositories. It automatically detects your project type and uses the appropriate security scanner.

## 🌍 Supported Languages & Scanners

| Language | Auto-Detected Files | Default Scanner | Alternative Scanners |
|----------|-------------------|-----------------|---------------------|
| **Node.js** | `package.json` | npm-audit (or Snyk with token) | snyk, trivy |
| **Python** | `requirements.txt`, `setup.py`, `pyproject.toml`, `Pipfile` | pip-audit (or Snyk with token) | snyk, trivy |
| **Rust** | `Cargo.toml` | cargo-audit | trivy |
| **Scala** | `build.sbt`, `build.sc` | Snyk (with token) or Trivy | snyk, trivy |
| **Java** | `pom.xml`, `build.gradle` | Snyk (with token) or OWASP Dependency Check | snyk, trivy |
| **Go** | `go.mod` | govulncheck | trivy |
| **.NET** | `*.csproj`, `*.sln` | dotnet list package | trivy |
| **Ruby** | `Gemfile` | bundler-audit | trivy |
| **PHP** | `composer.json` | composer audit | trivy |
| **Unknown** | - | Trivy (universal) or Snyk | trivy, snyk |

## 🚀 Quick Start

### Option 1: Fully Automatic (Recommended)

The workflow will automatically detect your language and use the best scanner:

```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday at 2 AM
  workflow_dispatch:

jobs:
  security-scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}  # Optional - only if you want Snyk
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Option 2: Specify Language

If you want to override auto-detection:

```yaml
jobs:
  security-scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      language: 'python'  # Force Python scanning
      scanner: 'auto'     # Auto-select best scanner for Python
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Option 3: Specify Scanner

Use a specific scanner tool:

```yaml
jobs:
  security-scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      language: 'auto'
      scanner: 'trivy'  # Use Trivy regardless of language
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 📋 Configuration Options

### Input Parameters

| Parameter | Description | Default | Options |
|-----------|-------------|---------|---------|
| `language` | Programming language | `auto` | `auto`, `nodejs`, `python`, `rust`, `scala`, `java`, `go`, `dotnet`, `ruby`, `php` |
| `scanner` | Scanner tool to use | `auto` | `auto`, `snyk`, `npm-audit`, `pip-audit`, `cargo-audit`, `trivy`, `govulncheck`, etc. |
| `working-directory` | Directory to scan | `.` | Any valid path |
| `severity-threshold` | Minimum severity to report | `low` | `low`, `medium`, `high`, `critical` |
| `create-issue` | Create GitHub issue | `true` | `true`, `false` |

### Secrets

| Secret | Required | Description |
|--------|----------|-------------|
| `SNYK_TOKEN` | Optional | Snyk API token (only needed if using Snyk scanner) |
| `GH_TOKEN` | Optional | GitHub token (defaults to `GITHUB_TOKEN` if not provided) |

## 🔍 Scanner Selection Logic

The workflow follows this logic:

1. **Auto-detect language** from project files (package.json, requirements.txt, etc.)
2. **Select scanner**:
   - If `SNYK_TOKEN` is provided → Use Snyk
   - If no token → Use language-specific free scanner
   - If language unknown → Use Trivy (universal scanner)

## 📊 Examples by Language

### Node.js Project

```yaml
# Auto-detection works automatically
jobs:
  scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What happens:**
- Detects `package.json`
- Uses `npm audit` (free) or Snyk (if token provided)
- Generates npm/yarn fix commands

### Python Project

```yaml
jobs:
  scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      severity-threshold: 'high'  # Only report high/critical
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What happens:**
- Detects `requirements.txt`, `pyproject.toml`, or `Pipfile`
- Uses `pip-audit` (free)
- Generates pip install fix commands

### Rust Project

```yaml
jobs:
  scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What happens:**
- Detects `Cargo.toml`
- Uses `cargo-audit`
- Generates cargo update fix commands

### Multi-Language Monorepo

Scan different directories with different languages:

```yaml
jobs:
  scan-frontend:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      working-directory: './frontend'
      language: 'nodejs'
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  scan-backend:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      working-directory: './backend'
      language: 'python'
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  scan-api:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      working-directory: './api'
      language: 'go'
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🔧 Using Without Snyk

The solution now works WITHOUT requiring a Snyk account:

```yaml
jobs:
  free-security-scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    # No SNYK_TOKEN needed!
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Free scanners used:**
- Node.js → npm audit
- Python → pip-audit
- Rust → cargo-audit
- Scala → Trivy
- Go → govulncheck
- Ruby → bundler-audit
- PHP → composer audit
- .NET → dotnet list package
- Others → Trivy

## 📦 Output Format

All scanners are normalized to a common format:

```json
{
  "vulnerabilities": [
    {
      "id": "CVE-2024-1234",
      "title": "Vulnerability Title",
      "severity": "high",
      "packageName": "package-name",
      "version": "1.0.0",
      "nearestFixedInVersion": "1.0.1",
      "isUpgradable": true,
      "description": "...",
      "language": "nodejs",
      "scanner": "npm-audit"
    }
  ],
  "summary": {
    "total": 5,
    "dependency_issues": 3,
    "code_issues": 2,
    "scanner": "npm-audit",
    "language": "nodejs"
  }
}
```

## 🤖 GitHub Issues

Created issues are language-aware:

**For Node.js:**
```bash
npm install package@fixed-version
```

**For Python:**
```bash
pip install package==fixed-version
```

**For Rust:**
```bash
cargo update -p package
```

**For Java:**
```bash
# Update version in pom.xml or build.gradle for package
# Then update version to fixed-version in your build file
```

**For Scala:**
```bash
# Update version in build.sbt or build.sc for package
# Then update version to fixed-version in your build file
```

## 🌐 Cross-Repository Usage

This workflow can be used across multiple repositories:

1. **Create a workflow in any repository:**

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 1'
  workflow_dispatch:

jobs:
  scan:
    uses: YOUR-ORG/ai-bug-fix/.github/workflows/security-scan-reusable.yml@main
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}  # Optional
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

2. **Works automatically for any language!**

## 🎯 Best Practices

### 1. Weekly Scans
```yaml
on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday
```

### 2. PR Checks
```yaml
on:
  pull_request:
    branches: [main, develop]
```

### 3. High Severity Only in PRs
```yaml
jobs:
  pr-scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      severity-threshold: 'high'
      create-issue: false  # Don't create issues for PRs
```

### 4. Multiple Scanners
```yaml
jobs:
  scan-with-trivy:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      scanner: 'trivy'
  
  scan-with-snyk:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      scanner: 'snyk'
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## 🔐 Security Token Setup

### For Snyk (Optional)
1. Sign up at [snyk.io](https://snyk.io)
2. Get your API token from Account Settings
3. Add to GitHub Secrets as `SNYK_TOKEN`

### For GitHub Issues
- The default `GITHUB_TOKEN` works for most cases
- For advanced features (pinning, Copilot assignment), create a Personal Access Token with `repo` scope

## 🐛 Troubleshooting

### Language Not Detected
**Solution:** Explicitly set the `language` parameter:
```yaml
with:
  language: 'python'
```

### Scanner Fails
**Solution:** Try a different scanner:
```yaml
with:
  scanner: 'trivy'  # Universal fallback
```

### No Vulnerabilities Reported
**Check:**
- Severity threshold (try `severity-threshold: 'low'`)
- Scanner output in Actions logs
- Your dependencies are actually installed

### Multi-Project Setup
**For monorepos:**
```yaml
jobs:
  scan-all:
    strategy:
      matrix:
        directory: ['frontend', 'backend', 'services/api']
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      working-directory: ${{ matrix.directory }}
```

## 📚 Additional Resources

- [COMPOSITE_ACTIONS_REFERENCE.md](./COMPOSITE_ACTIONS_REFERENCE.md) - Detailed action documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [WORKFLOW_DOCUMENTATION.md](./WORKFLOW_DOCUMENTATION.md) - Complete workflow guide

## 🎉 Migration from Language-Specific Solutions

### Before (Node.js only)
```yaml
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm audit --json
```

### After (Any language)
```yaml
jobs:
  scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Benefits:**
- ✅ Works with any language
- ✅ Auto-detects project type
- ✅ Creates GitHub issues
- ✅ Assigns to Copilot
- ✅ Normalized output format
- ✅ No Snyk token required
