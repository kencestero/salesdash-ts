# 🔐 Secret Scanning Setup Guide

Prevent secrets from being committed to your repository with these FREE tools!

---

## 🎯 Quick Setup (Recommended)

### Option 1: Gitleaks (Easiest - 5 minutes)

**Step 1: Install Gitleaks**

```bash
# Windows: Download from releases
# Visit: https://github.com/gitleaks/gitleaks/releases
# Download: gitleaks_X.X.X_windows_x64.zip
# Extract and add to PATH

# Mac (if you have Homebrew)
brew install gitleaks

# Verify installation
gitleaks version
```

**Step 2: Run the setup script**

```bash
cd /c/Users/kence/salesdash-ts

# Make script executable (Git Bash)
chmod +x setup-secret-scanning.sh

# Run setup
./setup-secret-scanning.sh
```

**Step 3: Test it!**

```bash
# Try to commit a test secret
echo "DATABASE_URL=postgresql://fake" > test-secret.txt
git add test-secret.txt
git commit -m "test"

# Should be BLOCKED! ✅
# Remove test file
rm test-secret.txt
```

**That's it!** Every commit is now protected.

---

### Option 2: GitGuardian CLI (Most Powerful)

**Step 1: Install**

```bash
# Requires Python
pip install ggshield

# Or with pipx
pipx install ggshield
```

**Step 2: Authenticate**

```bash
# Login to GitGuardian (free account)
ggshield auth login

# Follow the prompts to authenticate
```

**Step 3: Install pre-commit hook**

```bash
cd /c/Users/kence/salesdash-ts

# Install the hook
ggshield install -m local

# Now every commit is scanned!
```

**Bonus:** GitGuardian also monitors your repo and sends alerts

---

### Option 3: Husky + Gitleaks (For Node.js projects - Best Integration)

Since you're using pnpm, this integrates perfectly!

**Step 1: Install Husky**

```bash
cd /c/Users/kence/salesdash-ts

pnpm add -D husky

# Initialize husky
pnpm exec husky install

# Auto-install hooks after npm install
npm pkg set scripts.prepare="husky install"
```

**Step 2: Create pre-commit hook**

```bash
# Create the hook file
pnpm exec husky add .husky/pre-commit "gitleaks protect --staged --verbose --config .gitleaks.toml"

# Make it executable
chmod +x .husky/pre-commit
```

**Step 3: Test**

```bash
# Try committing a secret
echo "PASSWORD=secret123" > test.txt
git add test.txt
git commit -m "test"

# Should be blocked!
rm test.txt
```

---

## 🛠️ Tools Comparison

| Tool | Installation | Speed | Accuracy | Best For |
|------|-------------|-------|----------|----------|
| **Gitleaks** | Easy | Fast | High | Most people |
| **GitGuardian** | Medium | Fast | Very High | Teams |
| **git-secrets** | Medium | Fast | Medium | AWS projects |
| **TruffleHog** | Easy | Slow | High | Deep scans |
| **Husky** | Easy | N/A | N/A | Node.js projects |

---

## 📋 What's Already Set Up

I've created these files for you:

1. **`.gitleaks.toml`** - Configuration for Gitleaks
   - Detects database URLs
   - Detects API keys
   - Detects private keys
   - Detects auth secrets
   - Allows documentation files (like README.md)

2. **`setup-secret-scanning.sh`** - One-command setup
   - Installs pre-commit hook
   - Tests configuration
   - Shows usage instructions

---

## 🧪 How to Test Secret Detection

### Test 1: Database URL
```bash
echo "DATABASE_URL=postgresql://user:pass@host/db" > test.env
git add test.env
git commit -m "test"
# Should be BLOCKED ✅

rm test.env
```

### Test 2: API Key
```bash
echo "API_KEY=sk_live_1234567890abcdef" > test.txt
git add test.txt
git commit -m "test"
# Should be BLOCKED ✅

rm test.txt
```

### Test 3: Private Key
```bash
echo "-----BEGIN PRIVATE KEY-----" > test.pem
git add test.pem
git commit -m "test"
# Should be BLOCKED ✅

rm test.pem
```

### Test 4: Should ALLOW (false positive check)
```bash
echo "DATABASE_URL=your-database-url-here" > .env.example
git add .env.example
git commit -m "add example env"
# Should PASS ✅ (because it's in .env.example)
```

---

## ⚙️ Configuration

### Customize Detection Rules

Edit `.gitleaks.toml` to add/remove rules:

```toml
[[rules]]
id = "custom-secret"
description = "My custom secret pattern"
regex = '''my-secret-[0-9]+'''
tags = ["custom"]
```

### Add Allowlist Paths

If you have files that should be ignored:

```toml
[allowlist]
paths = [
  '''docs/examples/.*''',  # Ignore docs/examples
  '''test/fixtures/.*''',   # Ignore test fixtures
]
```

### Add Allowlist Patterns

For placeholder values:

```toml
regexes = [
  '''placeholder-.*''',
  '''REPLACE_ME''',
]
```

---

## 🚨 What to Do When Secrets Are Detected

### If the secret is real:
1. **Don't commit it!**
2. Move it to a `.env` file (in `.gitignore`)
3. Add the `.env` file to your local environment
4. Use environment variables in your code

### If it's a false positive:
1. Add the file to `.gitleaks.toml` allowlist
2. Or add the pattern to regex allowlist
3. Re-run the commit

### To bypass (NOT RECOMMENDED):
```bash
git commit --no-verify -m "message"

# Only use if you're 100% sure there are no secrets!
```

---

## 📊 Scanning Your Entire Repo History

### With Gitleaks:
```bash
# Scan everything
gitleaks detect --verbose

# Generate report
gitleaks detect --report-path gitleaks-report.json

# Scan specific commit
gitleaks detect --log-opts="<commit-sha>"
```

### With TruffleHog:
```bash
# Deep scan with entropy detection
truffleHog git file:///c/Users/kence/salesdash-ts --json
```

### With GitGuardian:
```bash
# Scan entire repo
ggshield secret scan repo .

# Scan specific branch
ggshield secret scan repo . --branch main
```

---

## 🔄 Integrating with CI/CD

### GitHub Actions (Free)

Create `.github/workflows/secrets-scan.yml`:

```yaml
name: Secret Scanning

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Vercel (with Husky)

Already works! Husky runs before every commit locally.

---

## 💡 Best Practices

1. **Use environment variables for ALL secrets**
   - Database URLs
   - API keys
   - Auth secrets
   - Service account keys

2. **Never commit `.env` files**
   - `.gitignore` is already configured
   - Only commit `.env.example` with placeholders

3. **Use different secrets for dev/staging/production**
   - Local: `.env.local`
   - Production: Vercel environment variables

4. **Rotate secrets regularly**
   - Every 90 days minimum
   - Immediately after suspected compromise

5. **Enable all available protections**
   - Pre-commit hooks (Gitleaks/GitGuardian)
   - GitHub secret scanning
   - GitGuardian monitoring
   - Vercel environment variables

---

## 🎓 Learning Resources

- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [GitGuardian Best Practices](https://docs.gitguardian.com/secrets-detection/secrets-detection-engine)
- [OWASP Secret Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

## 📞 Need Help?

If secret scanning is blocking legitimate commits:
1. Check if it's a false positive
2. Add to allowlist in `.gitleaks.toml`
3. Or move the value to environment variables

If you accidentally commit secrets:
1. **Don't push!**
2. Run `git reset --soft HEAD~1` to undo commit
3. Remove secrets from files
4. Re-commit

---

**Status:** ✅ Configuration files created
**Next:** Install Gitleaks and run `./setup-secret-scanning.sh`
**Then:** Test with example secrets (see "How to Test" section)

---

**Protection is better than detection!** 🛡️
