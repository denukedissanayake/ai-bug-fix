# Composite Actions Reference

Quick reference guide for the modular security scanning composite actions.

## 📦 Available Actions

### 1. scan-vulnerabilities
**Location:** `.github/actions/scan-vulnerabilities/action.yml`

Runs Snyk dependency and code analysis scans, then merges results.

#### Usage
```yaml
- uses: ./.github/actions/scan-vulnerabilities
  with:
    snyk-token: ${{ secrets.SNYK_TOKEN }}
    node-version: '18'
    working-directory: '.'
```

#### Inputs
| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `snyk-token` | ✅ Yes | - | Snyk API token |
| `node-version` | No | `'18'` | Node.js version |
| `working-directory` | No | `'.'` | Directory to scan |

#### Outputs
| Name | Description |
|------|-------------|
| `scan-results-path` | Path to merged scan results JSON |

#### What It Does
1. Sets up Node.js
2. Installs dependencies with `npm ci`
3. Installs Snyk CLI
4. Authenticates with Snyk
5. Runs dependency scan → `dependency-scan-results.json`
6. Runs code scan → `code-scan-results.json`
7. Merges results → `full-scan-results.json`

---

### 2. process-vulnerabilities
**Location:** `.github/actions/process-vulnerabilities/action.yml`

Processes scan results, generates reports, and creates summaries.

#### Usage
```yaml
- uses: ./.github/actions/process-vulnerabilities
  with:
    scan-results-path: 'full-scan-results.json'
    repository: ${{ github.repository }}
```

#### Inputs
| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `scan-results-path` | ✅ Yes | `'full-scan-results.json'` | Path to scan results |
| `repository` | ✅ Yes | - | Repository name (owner/repo) |

#### Outputs
| Name | Description |
|------|-------------|
| `vulnerability-count` | Number of vulnerabilities found |
| `has-vulnerabilities` | Boolean: true if vulnerabilities exist |
| `detailed-results-path` | Path to `detailed-vulnerabilities.json` |
| `report-path` | Path to `vulnerability-context.md` |

#### What It Does
1. Extracts vulnerabilities from scan results
2. Counts by severity (Critical, High, Medium, Low)
3. Generates GitHub Actions Step Summary
4. Creates detailed vulnerability JSON
5. Generates markdown report with:
   - Vulnerability details
   - CVE IDs and CVSS scores
   - Fix recommendations
   - Dependency paths

#### Generated Files
- `detailed-vulnerabilities.json`: Structured vulnerability data
- `vulnerability-context.md`: Human-readable report
- `snyk-results.json`: Raw Snyk results

---

### 3. create-security-issue
**Location:** `.github/actions/create-security-issue/action.yml`

Creates GitHub issues with vulnerability details and assigns to Copilot.

#### Usage
```yaml
- uses: ./.github/actions/create-security-issue
  with:
    github-token: ${{ secrets.GH_TOKEN }}
    vulnerability-data-path: 'vulnerability-data/detailed-vulnerabilities.json'
    repository: ${{ github.repository }}
    run-id: ${{ github.run_id }}
    server-url: ${{ github.server_url }}
```

#### Inputs
| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `github-token` | ✅ Yes | - | GitHub token with issue write permissions |
| `vulnerability-data-path` | ✅ Yes | - | Path to detailed vulnerabilities JSON |
| `repository` | ✅ Yes | - | Repository name (owner/repo) |
| `run-id` | ✅ Yes | - | GitHub Actions run ID |
| `server-url` | No | `'https://github.com'` | GitHub server URL |

#### What It Does
1. Creates/ensures labels exist:
   - `security`, `vulnerability`, `high-priority`, `critical`
   - `ai-fix-requested`, `copilot-task`, `scheduled`
2. Reads vulnerability data
3. Builds comprehensive issue body with:
   - Vulnerability details
   - Fix commands
   - Action items checklist
   - Copilot assistance request
4. Creates GitHub issue
5. Assigns to GitHub Copilot SWE agent (if available)
6. Pins critical issues
7. Generates summary report

#### Created Issue Structure
```markdown
# Security Vulnerability Analysis Report

**Repository:** owner/repo
**Scan Date:** 2025-10-16
**Workflow Run:** [link]
**Total Vulnerabilities:** X

## Detected Vulnerabilities

### [Vulnerability Title] (SEVERITY)
**Package:** package@version
**CVE ID:** CVE-XXXX-XXXX
**CVSS Score:** X.X
...

## Action Items
- [ ] Review vulnerabilities
- [ ] Apply fixes
...

## GitHub Copilot Assistance Request
@github-copilot please analyze and fix...
```

---

## 🔄 Complete Workflow Example

```yaml
name: Complete Security Scan

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      # Step 1: Scan
      - name: Run vulnerability scan
        id: scan
        uses: ./.github/actions/scan-vulnerabilities
        with:
          snyk-token: ${{ secrets.SNYK_TOKEN }}
          node-version: '18'
      
      # Step 2: Process
      - name: Process vulnerabilities
        id: process
        uses: ./.github/actions/process-vulnerabilities
        with:
          scan-results-path: ${{ steps.scan.outputs.scan-results-path }}
          repository: ${{ github.repository }}
      
      # Step 3: Upload artifacts
      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: vulnerability-data
          path: |
            full-scan-results.json
            detailed-vulnerabilities.json
            vulnerability-context.md
      
      # Step 4: Create issue (conditional)
      - name: Download artifacts
        if: steps.process.outputs.has-vulnerabilities == 'true'
        uses: actions/download-artifact@v4
        with:
          name: vulnerability-data
          path: vulnerability-data/
      
      - name: Create issue
        if: steps.process.outputs.has-vulnerabilities == 'true'
        uses: ./.github/actions/create-security-issue
        with:
          github-token: ${{ secrets.GH_TOKEN }}
          vulnerability-data-path: 'vulnerability-data/detailed-vulnerabilities.json'
          repository: ${{ github.repository }}
          run-id: ${{ github.run_id }}
          server-url: ${{ github.server_url }}
```

## 🎯 Use Case Examples

### Use Case 1: Scan Only (No Issue Creation)
```yaml
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/scan-vulnerabilities
        with:
          snyk-token: ${{ secrets.SNYK_TOKEN }}
      - uses: ./.github/actions/process-vulnerabilities
        with:
          scan-results-path: 'full-scan-results.json'
          repository: ${{ github.repository }}
```

### Use Case 2: Custom Processing
```yaml
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - id: scan
        uses: ./.github/actions/scan-vulnerabilities
        with:
          snyk-token: ${{ secrets.SNYK_TOKEN }}
      
      - name: Custom processing
        run: |
          # Your custom logic here
          cat ${{ steps.scan.outputs.scan-results-path }}
          jq '.vulnerabilities | length' ${{ steps.scan.outputs.scan-results-path }}
```

### Use Case 3: Multiple Directories
```yaml
jobs:
  scan-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/scan-vulnerabilities
        with:
          snyk-token: ${{ secrets.SNYK_TOKEN }}
          working-directory: './frontend'
  
  scan-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/scan-vulnerabilities
        with:
          snyk-token: ${{ secrets.SNYK_TOKEN }}
          working-directory: './backend'
```

## 🔍 Debugging

### View Scan Results
```yaml
- name: Debug scan results
  run: |
    echo "Scan results path: ${{ steps.scan.outputs.scan-results-path }}"
    cat ${{ steps.scan.outputs.scan-results-path }} | jq '.'
```

### Check Vulnerability Count
```yaml
- name: Check vulnerabilities
  run: |
    echo "Count: ${{ steps.process.outputs.vulnerability-count }}"
    echo "Has vulns: ${{ steps.process.outputs.has-vulnerabilities }}"
```

### Manual Issue Creation Test
```yaml
- name: Test issue creation
  uses: ./.github/actions/create-security-issue
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    vulnerability-data-path: 'test-data.json'
    repository: ${{ github.repository }}
    run-id: '12345'
    server-url: ${{ github.server_url }}
```

## 📝 Notes

- **Action Resolution**: Composite actions use relative paths (`./.github/actions/...`)
- **Working Directory**: Set in the scan action, other actions inherit it
- **Artifacts**: Process action generates files that should be uploaded
- **Permissions**: Issue creation requires `issues: write` permission
- **Secrets**: Never log or expose secret values in steps

## 🚀 Migration from Monolithic Workflow

**Before (Monolithic):**
```yaml
jobs:
  scan:
    steps:
      - name: Checkout
      - name: Setup Node
      - name: Install deps
      - name: Install Snyk
      - name: Auth Snyk
      - name: Run scan
      - name: Process results
      - name: Create issue
      # ... 200+ lines
```

**After (Modular):**
```yaml
jobs:
  scan:
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/scan-vulnerabilities
      - uses: ./.github/actions/process-vulnerabilities
      - uses: ./.github/actions/create-security-issue
      # Clean, maintainable, reusable!
```

## 📚 Additional Resources

- [GitHub Actions Composite Actions Docs](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [Snyk CLI Documentation](https://docs.snyk.io/snyk-cli)
- [GitHub Copilot for PRs](https://docs.github.com/en/copilot/github-copilot-chat/using-github-copilot-chat)
