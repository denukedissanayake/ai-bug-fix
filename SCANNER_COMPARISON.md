# Scanner Comparison Guide

This guide helps you choose the right security scanner for your project.

## 🎯 Quick Decision Tree

```
Do you have a Snyk account?
├── YES → Use Snyk (comprehensive, paid)
│   └── Set scanner: 'snyk' and provide SNYK_TOKEN
│
└── NO → Use language-specific free scanners
    └── Set scanner: 'auto' (recommended)
```

## 📊 Scanner Capabilities Matrix

| Scanner | Languages | Cost | Dependency Scan | Code Scan | Database | Setup |
|---------|-----------|------|-----------------|-----------|----------|-------|
| **Snyk** | All | Free/Paid | ✅ Excellent | ✅ Excellent | ✅ Largest | Need token |
| **npm audit** | Node.js | Free | ✅ Good | ❌ No | ✅ Large | Built-in |
| **pip-audit** | Python | Free | ✅ Good | ❌ No | ✅ Good | Auto-install |
| **cargo-audit** | Rust | Free | ✅ Excellent | ❌ No | ✅ Good | Auto-install |
| **govulncheck** | Go | Free | ✅ Excellent | ✅ Good | ✅ Official | Auto-install |
| **bundler-audit** | Ruby | Free | ✅ Good | ❌ No | ✅ Good | Auto-install |
| **composer audit** | PHP | Free | ✅ Good | ❌ No | ✅ Good | Built-in |
| **dotnet list** | .NET | Free | ✅ Good | ❌ No | ✅ Microsoft | Built-in |
| **Trivy** | All (incl. Scala) | Free | ✅ Excellent | ✅ Good | ✅ Large | Auto-install |
| **OWASP Dep-Check** | Java | Free | ✅ Good | ❌ No | ✅ Good | Heavy |

## 🔍 Scanner Details

### Snyk
**Best for:** Production environments, comprehensive scanning
```yaml
with:
  scanner: 'snyk'
secrets:
  SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Pros:**
- ✅ Scans all languages
- ✅ Code and dependency scanning
- ✅ Largest vulnerability database
- ✅ Excellent fix recommendations
- ✅ License compliance checking

**Cons:**
- ❌ Requires account and token
- ❌ Paid plans for full features
- ❌ Rate limits on free tier

**When to use:**
- Production applications
- When you need code scanning
- When you have a Snyk subscription
- For comprehensive security analysis

---

### npm audit (Node.js)
**Best for:** Node.js projects without Snyk

```yaml
with:
  scanner: 'npm-audit'  # or auto for Node.js
```

**Pros:**
- ✅ Built into npm (no installation)
- ✅ Free and unlimited
- ✅ Official npm vulnerability database
- ✅ Fast execution

**Cons:**
- ❌ Node.js only
- ❌ No code scanning
- ❌ Smaller database than Snyk

**When to use:**
- Node.js projects
- CI/CD pipelines
- Quick vulnerability checks
- When Snyk token not available

---

### pip-audit (Python)
**Best for:** Python projects

```yaml
with:
  scanner: 'pip-audit'  # or auto for Python
```

**Pros:**
- ✅ Free and open source
- ✅ PyPI Advisory Database
- ✅ Good Python ecosystem coverage
- ✅ Multiple output formats

**Cons:**
- ❌ Python only
- ❌ No code scanning
- ❌ Requires installation

**When to use:**
- Python projects
- requirements.txt scanning
- Virtual environment audits

---

### cargo-audit (Rust)
**Best for:** Rust projects

```yaml
with:
  scanner: 'cargo-audit'  # or auto for Rust
```

**Pros:**
- ✅ Official Rust security advisory database
- ✅ Excellent Rust ecosystem coverage
- ✅ Fast and reliable
- ✅ Active maintenance

**Cons:**
- ❌ Rust only
- ❌ No code scanning

**When to use:**
- Rust/Cargo projects
- Cargo.toml dependency audits

---

### govulncheck (Go)
**Best for:** Go projects

```yaml
with:
  scanner: 'govulncheck'  # or auto for Go
```

**Pros:**
- ✅ Official Go security scanner
- ✅ Go vulnerability database
- ✅ Code reachability analysis
- ✅ Maintained by Go team

**Cons:**
- ❌ Go only

**When to use:**
- Go projects with go.mod
- Official Go ecosystem scanning
- When you need reachability analysis

---

### Trivy
**Best for:** Universal scanning, containers, multi-language

```yaml
with:
  scanner: 'trivy'
```

**Pros:**
- ✅ Scans all languages
- ✅ Container image scanning
- ✅ IaC scanning (Terraform, K8s)
- ✅ Large vulnerability database
- ✅ Fast and accurate
- ✅ Free and open source

**Cons:**
- ❌ Larger installation size
- ❌ May have false positives

**When to use:**
- Multi-language projects
- Container/Docker scanning
- Infrastructure as Code
- Comprehensive free scanning
- Unknown project types

---

## 🎨 Usage Examples

### Automatic Selection (Recommended)
```yaml
# Auto-detects language and selects best free scanner
jobs:
  scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What happens:**
- Node.js project → npm audit
- Python project → pip-audit
- Rust project → cargo-audit
- Scala project → Trivy
- Go project → govulncheck
- Unknown → Trivy

### Force Specific Scanner
```yaml
# Use Trivy for everything
jobs:
  scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      scanner: 'trivy'
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Use Snyk When Available
```yaml
# Use Snyk if token available, otherwise auto-select free tool
jobs:
  scan:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      scanner: 'auto'
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}  # Optional
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Compare Multiple Scanners
```yaml
# Run both Snyk and Trivy for comprehensive coverage
jobs:
  scan-snyk:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      scanner: 'snyk'
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  
  scan-trivy:
    uses: ./.github/workflows/security-scan-reusable.yml
    with:
      scanner: 'trivy'
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🏆 Recommendations by Use Case

### Startup / Small Projects
**Recommendation:** Auto-select free scanners
```yaml
with:
  scanner: 'auto'
# No SNYK_TOKEN needed - saves money
```

### Enterprise / Production
**Recommendation:** Snyk for comprehensive coverage
```yaml
with:
  scanner: 'snyk'
secrets:
  SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Open Source Projects
**Recommendation:** Language-specific free tools or Trivy
```yaml
with:
  scanner: 'auto'  # Uses free tools
```

### CI/CD Pipelines
**Recommendation:** Fast scanners (npm audit, pip-audit)
```yaml
with:
  scanner: 'auto'
  severity-threshold: 'high'  # Only critical issues
```

### Containerized Apps
**Recommendation:** Trivy
```yaml
with:
  scanner: 'trivy'
# Also scans container images
```

### Multi-Language Monorepos
**Recommendation:** Trivy or per-directory auto
```yaml
# Option 1: Trivy for everything
with:
  scanner: 'trivy'

# Option 2: Auto-detect per directory
strategy:
  matrix:
    dir: [frontend, backend, services]
with:
  working-directory: ${{ matrix.dir }}
  scanner: 'auto'
```

## 📈 Performance Comparison

| Scanner | Avg Scan Time | Resource Usage | Accuracy |
|---------|---------------|----------------|----------|
| npm audit | 10-30s | Low | High |
| pip-audit | 20-60s | Low | High |
| cargo-audit | 15-45s | Low | Very High |
| govulncheck | 30-90s | Medium | Very High |
| Snyk | 60-180s | Medium | Very High |
| Trivy | 30-120s | Medium | High |

## 🔧 Troubleshooting

### Scanner Installation Fails
**Solution:** Use Trivy as fallback
```yaml
with:
  scanner: 'trivy'  # Universal fallback
```

### Too Many False Positives
**Solution:** Increase severity threshold
```yaml
with:
  severity-threshold: 'high'  # Only high/critical
```

### Want Fastest Scan
**Solution:** Use language-specific tools
```yaml
with:
  scanner: 'auto'  # Selects fast native tools
```

### Need Most Coverage
**Solution:** Use Snyk or run multiple scanners
```yaml
jobs:
  scan-primary:
    with:
      scanner: 'snyk'
  
  scan-secondary:
    with:
      scanner: 'trivy'
```

## 📚 Additional Resources

- [Snyk Documentation](https://docs.snyk.io/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [npm audit Documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [pip-audit Documentation](https://pypi.org/project/pip-audit/)
- [cargo-audit Documentation](https://github.com/rustsec/rustsec)
- [govulncheck Documentation](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck)

## 🎯 Summary

**Default recommendation:** Use `scanner: 'auto'`
- ✅ Free
- ✅ Language-optimized
- ✅ No configuration needed
- ✅ Works everywhere

**For production:** Add Snyk token
- ✅ Most comprehensive
- ✅ Code scanning included
- ✅ Better fix recommendations

**For containers:** Use Trivy
- ✅ Container scanning
- ✅ Multi-language support
- ✅ IaC scanning
