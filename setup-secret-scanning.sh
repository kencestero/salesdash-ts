#!/bin/bash

# Setup script for secret scanning with Gitleaks

echo "🔐 Setting up secret scanning for MJ Cargo Sales Dashboard"
echo ""

# Check if gitleaks is installed
if ! command -v gitleaks &> /dev/null; then
    echo "❌ Gitleaks is not installed!"
    echo ""
    echo "Please install gitleaks:"
    echo "  • Windows: Download from https://github.com/gitleaks/gitleaks/releases"
    echo "  • Mac: brew install gitleaks"
    echo "  • Linux: Download binary from releases page"
    echo ""
    exit 1
fi

echo "✅ Gitleaks found: $(gitleaks version)"
echo ""

# Create pre-commit hook
echo "📝 Creating pre-commit hook..."

cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Scanning for secrets before commit..."

# Run gitleaks on staged files
if gitleaks protect --staged --verbose --config .gitleaks.toml; then
    echo "✅ No secrets detected!"
    exit 0
else
    echo ""
    echo "❌ SECRETS DETECTED!"
    echo ""
    echo "Your commit has been blocked to protect sensitive data."
    echo ""
    echo "Options:"
    echo "  1. Remove the secrets from your files"
    echo "  2. Add them to .env files (which are in .gitignore)"
    echo "  3. If this is a false positive, update .gitleaks.toml allowlist"
    echo ""
    echo "To bypass this check (NOT RECOMMENDED):"
    echo "  git commit --no-verify -m 'your message'"
    echo ""
    exit 1
fi
EOF

# Make hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook created!"
echo ""

# Test the configuration
echo "🧪 Testing gitleaks configuration..."
if gitleaks detect --config .gitleaks.toml --verbose; then
    echo "✅ Configuration is valid!"
else
    echo "⚠️  Found existing secrets in history (expected after the incident)"
    echo "   New commits will be protected!"
fi

echo ""
echo "🎉 Secret scanning is now active!"
echo ""
echo "How it works:"
echo "  • Every time you commit, gitleaks will scan your changes"
echo "  • If secrets are found, the commit will be BLOCKED"
echo "  • You'll see what was detected and where"
echo ""
echo "To test it:"
echo "  1. Try adding 'DATABASE_URL=postgresql://test' to a file"
echo "  2. Run: git add . && git commit -m 'test'"
echo "  3. It should be blocked!"
echo ""
echo "Configuration file: .gitleaks.toml"
echo ""
