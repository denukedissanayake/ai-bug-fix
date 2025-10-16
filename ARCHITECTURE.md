# Architecture Diagrams

Visual representations of the modular security scanning system architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Trigger Events                               │
│  ⏰ Schedule (Cron)  │  🔀 Push/PR  │  🖱️ Manual (workflow_dispatch) │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              security-scan-reusable.yml                          │
│                  (Orchestrator Workflow)                         │
│                                                                   │
│  Inputs:                        Secrets:                         │
│  • node-version                 • SNYK_TOKEN                     │
│  • working-directory            • GH_TOKEN                       │
│  • create-issue                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                  ▼
┌──────────────────┐            ┌──────────────────────┐
│  Job: Detection  │            │  Job: Issue Creation │
└────────┬─────────┘            └──────────┬───────────┘
         │                                  │
         │                                  │
┌────────▼─────────────────────────────────▼──────────────────┐
│                  Composite Actions                           │
│                                                               │
│  1️⃣  scan-vulnerabilities/                                   │
│      ├─ Setup Node.js                                        │
│      ├─ Install dependencies                                 │
│      ├─ Install & auth Snyk                                  │
│      ├─ Run dependency scan                                  │
│      ├─ Run code scan                                        │
│      └─ Merge results → full-scan-results.json              │
│                                                               │
│  2️⃣  process-vulnerabilities/                                │
│      ├─ Extract vulnerabilities                              │
│      ├─ Count by severity                                    │
│      ├─ Generate summaries                                   │
│      ├─ Create detailed JSON                                 │
│      └─ Generate markdown report                             │
│                                                               │
│  3️⃣  create-security-issue/                                  │
│      ├─ Create/ensure labels                                 │
│      ├─ Read vulnerability data                              │
│      ├─ Build issue body                                     │
│      ├─ Create GitHub issue                                  │
│      ├─ Assign to Copilot                                    │
│      └─ Pin critical issues                                  │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────┐
│  Source  │
│   Code   │
└─────┬────┘
      │
      ▼
┌─────────────────┐
│  Snyk Scanner   │◄─── SNYK_TOKEN
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Dependency   │  │  Code        │  │              │
│ Scan         │  │  Scan        │  │              │
│ Results      │  │  Results     │  │              │
└──────┬───────┘  └──────┬───────┘  │              │
       │                 │           │              │
       └────────┬────────┘           │              │
                ▼                    │              │
       ┌────────────────┐            │              │
       │  Merged        │            │              │
       │  Results       │            │              │
       │  (JSON)        │            │              │
       └───────┬────────┘            │              │
               │                     │              │
               ▼                     │              │
       ┌────────────────┐            │              │
       │  Processor     │            │              │
       │  (Filter &     │            │              │
       │   Transform)   │            │              │
       └───────┬────────┘            │              │
               │                     │              │
      ┌────────┴─────────┐           │              │
      ▼                  ▼           ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Detailed     │  │ Vulnerability│  │ GitHub       │
│ JSON         │  │ Report (MD)  │  │ Actions      │
│              │  │              │  │ Summary      │
└──────┬───────┘  └──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│ GitHub       │◄─── GH_TOKEN
│ Issue        │
│              │
│ Assigned to  │
│ @copilot     │
└──────────────┘
```

## Component Interaction

```
                    ┌─────────────────────┐
                    │  Caller Workflow    │
                    │  (Your Repo)        │
                    └──────────┬──────────┘
                               │
                               │ uses
                               │
                    ┌──────────▼──────────┐
                    │  Reusable Workflow  │
                    │  (ai-bug-fix repo)  │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                │ uses         │ uses         │ uses
                │              │              │
        ┌───────▼──────┐  ┌───▼──────┐  ┌───▼──────┐
        │  Composite   │  │ Composite│  │ Composite│
        │  Action 1    │  │ Action 2 │  │ Action 3 │
        │              │  │          │  │          │
        │  Scan        │  │ Process  │  │ Issue    │
        └──────────────┘  └──────────┘  └──────────┘
```

## Workflow Execution Timeline

```
Time  │ vulnerability-detection job           │ create-vulnerability-issue job
──────┼───────────────────────────────────────┼────────────────────────────────
00:00 │ ✓ Checkout code                       │
00:05 │ ✓ scan-vulnerabilities action         │
      │   ├─ Setup Node.js (10s)               │
      │   ├─ Install deps (30s)                │
      │   ├─ Install Snyk (15s)                │
      │   ├─ Auth Snyk (2s)                    │
      │   ├─ Dependency scan (45s)             │
      │   ├─ Code scan (60s)                   │
      │   └─ Merge results (3s)                │
02:45 │ ✓ process-vulnerabilities action      │
      │   ├─ Extract vulnerabilities (5s)      │
      │   ├─ Count by severity (2s)            │
      │   ├─ Generate summary (3s)             │
      │   └─ Create reports (8s)               │
03:03 │ ✓ Upload artifacts (5s)                │
03:08 │ [Job Complete]                         │ ✓ Checkout code
03:10 │                                        │ ✓ Download artifacts
03:15 │                                        │ ✓ create-security-issue action
      │                                        │   ├─ Create labels (10s)
      │                                        │   ├─ Read vulnerability data (1s)
      │                                        │   ├─ Build issue body (2s)
      │                                        │   ├─ Create issue (3s)
      │                                        │   ├─ Assign to Copilot (4s)
      │                                        │   └─ Pin issue (2s)
03:37 │                                        │ ✓ Generate summary (2s)
03:39 │                                        │ [Job Complete]
```

## Repository Structure Visualization

```
ai-bug-fix/
│
├── 📂 .github/
│   │
│   ├── 📂 workflows/
│   │   ├── 📄 security-scan-reusable.yml      ← Main reusable workflow
│   │   └── 📄 security-scan-caller.yml        ← Example caller
│   │
│   ├── 📂 actions/                             ← Modular components
│   │   ├── 📂 scan-vulnerabilities/
│   │   │   └── 📄 action.yml                   ← Composite action 1
│   │   ├── 📂 process-vulnerabilities/
│   │   │   └── 📄 action.yml                   ← Composite action 2
│   │   └── 📂 create-security-issue/
│   │       └── 📄 action.yml                   ← Composite action 3
│   │
│   └── 📄 README.md                            ← Quick start guide
│
├── 📄 WORKFLOW_DOCUMENTATION.md                ← Complete documentation
├── 📄 COMPOSITE_ACTIONS_REFERENCE.md           ← API reference
├── 📄 MIGRATION_GUIDE.md                       ← Migration guide
└── 📄 ARCHITECTURE.md                          ← This file
```

## Deployment Models

### Model 1: Local Repository (This Repo)

```
Your Repo (ai-bug-fix)
├── .github/
│   ├── workflows/
│   │   └── security-scan-caller.yml
│   └── actions/
│       ├── scan-vulnerabilities/
│       ├── process-vulnerabilities/
│       └── create-security-issue/

Uses: ./.github/workflows/security-scan-reusable.yml
```

### Model 2: Cross-Repository (External Use)

```
External Repo
└── .github/
    └── workflows/
        └── security.yml

Uses: your-org/ai-bug-fix/.github/workflows/security-scan-reusable.yml@main
```

### Model 3: Hybrid (Mix and Match)

```
Your Repo
├── .github/
│   ├── workflows/
│   │   └── custom-security.yml
│   └── actions/
│       └── custom-reporter/           ← Your custom action

Uses reusable workflow for scanning
Uses custom action for custom reporting
```

## Permission Flow

```
┌─────────────────────┐
│  Repository         │
│  Permissions        │
│                     │
│  contents: write    │◄─── Checkout code
│  issues: write      │◄─── Create issues
│  pull-requests:     │◄─── Comment on PRs
│     write           │
│  actions: read      │◄─── Read workflow runs
│  security-events:   │◄─── Upload SARIF reports
│     write           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Workflow Level     │
│  Inherits all       │
└──────────┬──────────┘
           │
    ┌──────┴───────┐
    │              │
    ▼              ▼
┌────────┐    ┌────────┐
│  Job 1 │    │  Job 2 │
│        │    │        │
│ Can    │    │ Can    │
│ override   │    │ override   │
└────────┘    └────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│  Scan Action    │
└────────┬────────┘
         │
         ├─ Snyk scan fails (|| true)
         │
         ▼
┌─────────────────┐
│ Still continues │
│ with empty      │
│ results         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Process Action │
└────────┬────────┘
         │
         ├─ No vulnerabilities found
         │
         ▼
┌─────────────────┐
│ Set output:     │
│ has-vulns=false │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Issue Action   │
│  (Skipped due   │
│   to condition) │
└─────────────────┘
```

## Scalability Model

```
Single Repo           Multi-Repo           Enterprise
─────────            ─────────            ─────────

┌────────┐           ┌────────┐           ┌─────────────┐
│ Repo A │           │ Repo A │           │   Central   │
│        │           │        │           │  Security   │
│ [Scan] │           │ [Scan] │           │   Repo      │
└────────┘           └───┬────┘           │             │
                         │                │ [Reusable   │
                         │ uses           │  Workflow]  │
                     ┌───▼────┐           └──────┬──────┘
                     │ Repo B │                  │
                     │        │           ┌──────┴──────┐
                     │ [Scan] │           │             │
                     └───┬────┘      ┌────▼───┐    ┌────▼───┐
                         │           │ Team A │    │ Team B │
                         │ uses      │ Repos  │    │ Repos  │
                     ┌───▼────┐      │ (10+)  │    │ (10+)  │
                     │ Repo C │      └────────┘    └────────┘
                     │        │
                     │ [Scan] │      All use centralized workflow
                     └────────┘      Consistent security standards
```

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                External Integrations                     │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Snyk    │  │  GitHub  │  │  Slack   │  │  JIRA   │ │
│  │   API    │  │   API    │  │ (Custom) │  │(Custom) │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
└───────┼────────────┼─────────────┼─────────────┼───────┘
        │            │             │             │
        │            │             │             │
    ┌───▼────────────▼─────────────▼─────────────▼───┐
    │         Security Scan Workflow                  │
    │                                                  │
    │  Inputs:     Actions:        Outputs:           │
    │  • Tokens    • Scan          • Issues           │
    │  • Config    • Process        • Reports         │
    │              • Create         • Metrics         │
    └──────────────────────────────────────────────────┘
```

---

*This architecture supports high scalability, maintainability, and reusability across organizations.*
