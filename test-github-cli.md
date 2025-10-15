# Test GitHub CLI Setup

## Quick Test Commands

1. **Local Test** (if you have gh CLI installed):
```bash
gh auth status
```

2. **Repository Setup Checklist**:
   - [ ] Repository Settings → Actions → General → Workflow permissions = 'Read and write'
   - [ ] Repository Settings → Actions → General → 'Allow GitHub Actions to create and approve pull requests' = Checked
   - [ ] Repository Settings → Secrets → Add SNYK_TOKEN

3. **Test the workflow** by pushing this fixed code or manually triggering the workflow.
