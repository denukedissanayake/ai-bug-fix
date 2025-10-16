# 📁 Project Directory Structure

Clean, organized structure for the production-ready security scanning system.

## 📊 Overview

```
ai-bug-fix/
│
├── 📚 Documentation (Root Level)
│   ├── README.md                          # Main project README
│   ├── SUMMARY.md                         # Quick overview of modular system ⭐
│   ├── INDEX.md                           # Documentation navigation hub ⭐
│   ├── WORKFLOW_DOCUMENTATION.md          # Complete user guide (30 min read)
│   ├── COMPOSITE_ACTIONS_REFERENCE.md     # API reference for actions
│   ├── MIGRATION_GUIDE.md                 # Migration from monolithic workflow
│   ├── ARCHITECTURE.md                    # System design & diagrams
│   ├── CHECKLIST.md                       # Production readiness checklist
│   ├── SECURITY.md                        # Security policy
│   └── LICENSE                            # Project license
│
├── 📂 .github/                            # GitHub-specific files
│   │
│   ├── 📄 README.md                       # Quick start guide ⭐
│   │
│   ├── 📂 workflows/                      # GitHub Actions workflows
│   │   ├── security-scan-reusable.yml     # Main reusable workflow ⭐⭐
│   │   └── security-scan-caller.yml       # Example caller workflow ⭐
│   │
│   └── 📂 actions/                        # Composite actions
│       ├── scan-vulnerabilities/
│       │   └── action.yml                 # Snyk scanning logic
│       ├── process-vulnerabilities/
│       │   └── action.yml                 # Result processing logic
│       └── create-security-issue/
│           └── action.yml                 # GitHub issue creation logic
│
├── 📂 src/                                # Application source code
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   └── components/
│       ├── AdminPanel.js
│       ├── Comments.js
│       ├── Dashboard.js
│       ├── FileUpload.js
│       ├── Login.js
│       └── UserProfile.js
│
├── 📂 server/                             # Backend server
│   └── app.js
│
├── 📂 public/                             # Static files
│   └── index.html
│
├── 📂 uploads/                            # File uploads directory
│   └── README.md
│
├── ⚙️  Configuration Files
│   ├── package.json                       # NPM dependencies
│   ├── package-lock.json
│   ├── webpack.config.js                  # Webpack configuration
│   ├── .babelrc                           # Babel configuration
│   ├── .eslintrc.js                       # ESLint configuration
│   ├── .gitignore                         # Git ignore rules
│   └── .env                               # Environment variables
│
└── 📂 node_modules/                       # Dependencies (gitignored)
```

## 📋 File Categories

### ⭐ Essential Files (Start Here)

1. **SUMMARY.md** - Overview of the entire system (10 min read)
2. **INDEX.md** - Navigate all documentation
3. **.github/README.md** - Quick start guide
4. **security-scan-reusable.yml** - Main workflow
5. **security-scan-caller.yml** - Usage example

### 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Project overview & vulnerable app documentation | Everyone |
| `SUMMARY.md` | Modular system overview | Everyone |
| `INDEX.md` | Documentation navigation | Everyone |
| `WORKFLOW_DOCUMENTATION.md` | Complete guide with examples | Users & Admins |
| `COMPOSITE_ACTIONS_REFERENCE.md` | API reference | Developers |
| `MIGRATION_GUIDE.md` | Migration instructions | Migrators |
| `ARCHITECTURE.md` | System design & diagrams | Architects |
| `CHECKLIST.md` | Production readiness | DevOps |
| `.github/README.md` | Quick start | New users |
| `SECURITY.md` | Security policy | Security team |

### 🔄 Workflow Files

| File | Purpose | Status |
|------|---------|--------|
| `security-scan-reusable.yml` | Main reusable workflow | ✅ Production |
| `security-scan-caller.yml` | Example caller | ✅ Production |

### 🧩 Action Files

| File | Purpose | Lines |
|------|---------|-------|
| `scan-vulnerabilities/action.yml` | Runs Snyk scans | ~80 |
| `process-vulnerabilities/action.yml` | Processes results | ~150 |
| `create-security-issue/action.yml` | Creates GitHub issues | ~250 |

### 💻 Application Files

- `src/` - React frontend components
- `server/` - Express backend
- `public/` - Static assets
- `uploads/` - File upload directory

### ⚙️ Configuration Files

- `package.json` - Project dependencies
- `webpack.config.js` - Build configuration
- `.babelrc` - JavaScript transpilation
- `.eslintrc.js` - Code linting rules
- `.gitignore` - Git exclusions
- `.env` - Environment variables

## 🗑️ Removed Files (Cleanup)

The following obsolete files were removed:

### Obsolete Documentation
- ❌ `COPILOT_INTEGRATION_GUIDE.md` - Old architecture (superseded)
- ❌ `SECURITY_AUTOMATION_GUIDE.md` - Old workflow docs (replaced)
- ❌ `GITHUB_CLI_SETUP_GUIDE.md` - Specific setup (not needed)
- ❌ `test-github-cli.md` - Test file (not production)

### Obsolete Scripts
- ❌ `setup-security-automation.sh` - Old setup script
- ❌ `setup.sh` - Old setup script
- ❌ `.github/scripts/` - Empty directory

### Renamed Files
- 🔄 `security-scan.yml` → ~~Deleted~~ (replaced by modular system)

## 📊 Directory Statistics

```
Total Documentation Files:    10 (clean, organized)
Total Workflow Files:         2 (modular, production-ready)
Total Composite Actions:      3 (focused components)
Total Lines of Workflow Code: ~500 (modular) vs 500+ (old monolithic - now removed)
Documentation Pages:          ~35 pages total
Code Reduction:               88% in main workflow file
```

## 🎯 Quick Navigation

### For First-Time Users
```
1. Start: README.md (project overview)
2. Then:  SUMMARY.md (system overview)
3. Next:  .github/README.md (quick start)
```

### For Implementers
```
1. Read:   WORKFLOW_DOCUMENTATION.md
2. Review: security-scan-caller.yml
3. Use:    CHECKLIST.md
```

### For Developers
```
1. Study:  ARCHITECTURE.md
2. Review: COMPOSITE_ACTIONS_REFERENCE.md
3. Extend: Individual action files
```

### For Migrators
```
1. Follow: MIGRATION_GUIDE.md
2. Check:  COMPOSITE_ACTIONS_REFERENCE.md
3. Test:   security-scan-caller.yml
```

## 🔍 File Locations Quick Reference

### Need to find...

**Main workflow?**
→ `.github/workflows/security-scan-reusable.yml`

**Example usage?**
→ `.github/workflows/security-scan-caller.yml`

**Action inputs/outputs?**
→ `COMPOSITE_ACTIONS_REFERENCE.md`

**Quick start?**
→ `.github/README.md`

**Complete guide?**
→ `WORKFLOW_DOCUMENTATION.md`

**System architecture?**
→ `ARCHITECTURE.md`

**Migration help?**
→ `MIGRATION_GUIDE.md`

**All documentation?**
→ `INDEX.md`

## ✅ Validation Commands

```bash
# List all documentation
ls -1 *.md | sort

# List workflows
ls -1 .github/workflows/

# List actions
find .github/actions -name "action.yml"

# Check structure
tree .github -L 3 -I node_modules
```

## 🎓 Maintenance

### When adding new files:
1. Update this DIRECTORY_STRUCTURE.md
2. Update INDEX.md if adding documentation
3. Update .gitignore if needed
4. Document in relevant guides

### When removing files:
1. Update this DIRECTORY_STRUCTURE.md
2. Update INDEX.md references
3. Update any cross-references
4. Create backup if important

---

**Last Updated:** October 16, 2025
**Structure Version:** 2.0 (Modular, Production-Ready)
**Status:** ✅ Clean and Organized
