#!/bin/bash

# Security Automation Setup Script
# This script helps you set up the automated security scanning workflow

echo "🔒 Security Automation Setup"
echo "============================"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed. Please install it first:"
    echo "   https://cli.github.com/manual/installation"
    exit 1
fi

# Check if user is authenticated with GitHub CLI
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Please run:"
    echo "   gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Get current repository info
REPO=$(git remote get-url origin | sed 's/.*github\.com[:/]\([^/]*\/[^/]*\)\.git/\1/' | sed 's/\.git$//')
if [ -z "$REPO" ]; then
    echo "❌ Could not determine GitHub repository. Make sure you're in a git repository with a GitHub remote."
    exit 1
fi

echo "📁 Repository: $REPO"
echo ""

# Check if SNYK_TOKEN secret exists
echo "🔍 Checking existing secrets..."
if gh secret list --repo "$REPO" | grep -q "SNYK_TOKEN"; then
    echo "✅ SNYK_TOKEN secret already exists"
    SNYK_TOKEN_EXISTS=true
else
    echo "❌ SNYK_TOKEN secret not found"
    SNYK_TOKEN_EXISTS=false
fi

echo ""

# Setup Snyk token if needed
if [ "$SNYK_TOKEN_EXISTS" = false ]; then
    echo "🔑 Snyk Token Setup Required"
    echo "----------------------------"
    echo "To set up automated security scanning, you need a Snyk auth token:"
    echo ""
    echo "1. Go to https://app.snyk.io/account"
    echo "2. Log in or create a free account"
    echo "3. Navigate to 'General Account Settings'"
    echo "4. Click 'Auth Tokens' in the left sidebar"
    echo "5. Click 'Generate token'"
    echo "6. Copy the generated token"
    echo ""
    
    read -p "Enter your Snyk auth token: " -s SNYK_TOKEN
    echo ""
    
    if [ -n "$SNYK_TOKEN" ]; then
        echo "🚀 Setting SNYK_TOKEN secret..."
        echo "$SNYK_TOKEN" | gh secret set SNYK_TOKEN --repo "$REPO"
        if [ $? -eq 0 ]; then
            echo "✅ SNYK_TOKEN secret has been set successfully!"
        else
            echo "❌ Failed to set SNYK_TOKEN secret"
            exit 1
        fi
    else
        echo "❌ No token provided. Skipping secret setup."
    fi
fi

echo ""
echo "📋 Workflow Configuration"
echo "------------------------"

# Check if the workflow file exists
WORKFLOW_FILE=".github/workflows/security-scan.yml"
if [ -f "$WORKFLOW_FILE" ]; then
    echo "✅ Security scan workflow file exists: $WORKFLOW_FILE"
else
    echo "❌ Security scan workflow file not found: $WORKFLOW_FILE"
    echo "   Make sure you have committed the workflow file."
fi

echo ""
echo "🎯 Next Steps"
echo "------------"
echo "1. ✅ Commit and push your workflow file if you haven't already:"
echo "   git add .github/workflows/security-scan.yml"
echo "   git commit -m 'Add automated security scanning workflow'"
echo "   git push"
echo ""
echo "2. 🔍 The workflow will automatically run:"
echo "   - Daily at 2 AM UTC"
echo "   - On pull requests to main branch"
echo "   - When code is pushed to main branch"
echo ""
echo "3. 📊 Monitor the workflow:"
echo "   - Go to GitHub Actions tab in your repository"
echo "   - Watch for 'Fix security vulnerabilities with AI' workflow runs"
echo "   - Review any automatically created security fix PRs"
echo ""
echo "4. 📖 Read the full documentation:"
echo "   - Open SECURITY_AUTOMATION_GUIDE.md for detailed information"
echo "   - Understand the workflow steps and customization options"
echo ""

# Check if there are any immediate vulnerabilities
echo "🔬 Quick Security Check"
echo "----------------------"
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    echo "Running quick npm audit..."
    npm audit --audit-level=high 2>/dev/null | head -20
    echo ""
    echo "💡 Tip: The automated workflow will handle these vulnerabilities!"
else
    echo "⚠️  npm not found or no package.json. Make sure you have a Node.js project."
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "Your automated security scanning is now configured."
echo "The workflow will create pull requests automatically when vulnerabilities are found."
echo ""
echo "For support, check the SECURITY_AUTOMATION_GUIDE.md file or GitHub Actions logs."