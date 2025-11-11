# ✅ Essential Skills Installation Checklist

Use this checklist to install all three essential skills in order.

---

## Prerequisites ✓

- [ ] Claude Code installed and working
- [ ] Python 3.10+ installed (`python3 --version`)
- [ ] Git installed (`git --version`)
- [ ] Terminal/command line access
- [ ] 30-60 minutes for full setup

---

## Part 1: Superpowers (Core Skills Library)

### Install Superpowers ✓
- [ ] Open Claude Code
- [ ] Run: `/plugin marketplace add obra/superpowers-marketplace`
- [ ] Run: `/plugin install superpowers@superpowers-marketplace`
- [ ] Restart Claude Code
- [ ] Verify: Run `/help` and look for superpowers commands

### Expected Output ✓
You should see:
```
/superpowers:brainstorm - Interactive design refinement
/superpowers:write-plan - Create implementation plan
/superpowers:execute-plan - Execute plan in batches
```

### Test It ✓
- [ ] Run: `/superpowers:brainstorm`
- [ ] Claude should start asking you questions about your project
- [ ] If it works, you're good! ✅

### Time: ~5 minutes

---

## Part 2: Superpowers Lab (Experimental Features)

### Prerequisites ✓
- [ ] tmux installed
  - macOS: `brew install tmux`
  - Ubuntu/Debian: `sudo apt-get install tmux`
  - Verify: `tmux -V`

### Install Superpowers Lab ✓
- [ ] Open Claude Code
- [ ] Run: `claude-code plugin install https://github.com/obra/superpowers-lab`
- [ ] OR add to your `claude.json`:
```json
{
  "plugins": [
    "https://github.com/obra/superpowers-lab"
  ]
}
```
- [ ] Restart Claude Code

### Test It ✓
- [ ] Skills auto-activate when needed
- [ ] Try asking Claude to automate an interactive command
- [ ] If Claude can use tmux, you're good! ✅

### Time: ~5 minutes

---

## Part 3: Skill Seekers (Documentation to Skills)

### Clone Repository ✓
```bash
# Navigate to your projects folder
cd ~/Projects  # Or wherever you keep projects

# Clone
git clone https://github.com/yusufkaraaslan/Skill_Seekers.git
cd Skill_Seekers
```
- [ ] Repository cloned successfully

### Create Virtual Environment ✓
```bash
# Create venv
python3 -m venv venv

# Activate (choose your OS)
source venv/bin/activate           # macOS/Linux
# OR
venv\Scripts\activate              # Windows
```
- [ ] Virtual environment created
- [ ] Virtual environment activated (you see `(venv)` in prompt)

### Install Dependencies ✓
```bash
# Core dependencies (REQUIRED)
pip install requests beautifulsoup4 pytest

# PDF support (OPTIONAL but recommended)
pip install PyMuPDF

# GitHub scraping (OPTIONAL but recommended)
pip install PyGithub

# Save requirements
pip freeze > requirements.txt
```
- [ ] Core dependencies installed
- [ ] PDF support installed
- [ ] GitHub support installed

### Test Basic Functionality ✓
```bash
# List available presets
ls configs/

# Test with React preset (small, fast test)
python3 cli/doc_scraper.py --config configs/react.json --max-pages 5
```
- [ ] Command runs without errors
- [ ] Output folder created: `output/react_data/`
- [ ] If successful, you're ready to go! ✅

### Set Up MCP (OPTIONAL - for Claude Code integration) ✓
```bash
# One-time setup
./setup_mcp.sh

# Restart Claude Code

# Test in Claude Code
# Just ask: "List all available configs"
```
- [ ] MCP setup completed
- [ ] Claude Code restarted
- [ ] Can use Skill Seekers with natural language

### Time: ~15 minutes

---

## Part 4: Create Your First Real Skill

Let's create a Next.js skill as a complete test.

### Step 1: Scrape & Enhance ✓
```bash
# Make sure venv is activated
source venv/bin/activate

# Scrape Next.js docs with local enhancement
python3 cli/doc_scraper.py --config configs/nextjs.json --enhance-local

# Wait ~20-30 minutes for scraping
# Plus ~60 seconds for enhancement
```
- [ ] Scraping completed
- [ ] Enhancement completed
- [ ] Check: `output/nextjs/SKILL.md` exists

### Step 2: Package ✓
```bash
python3 cli/package_skill.py output/nextjs/
```
- [ ] `output/nextjs.zip` created
- [ ] Output folder opened automatically

### Step 3: Upload to Claude ✓
**Option A: Automatic (if you have API key)**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key
python3 cli/package_skill.py output/nextjs/ --upload
```
- [ ] Uploaded successfully

**Option B: Manual**
- [ ] Go to https://claude.ai/skills
- [ ] Click "Upload Skill"
- [ ] Select `output/nextjs.zip`
- [ ] Upload successful

### Step 4: Test the Skill ✓
- [ ] Open new chat in Claude
- [ ] Ask: "How do I create a new Next.js app with TypeScript?"
- [ ] Claude should reference the skill you created
- [ ] Success! Your first skill works! ✅

### Time: ~25-35 minutes

---

## Part 5: Kenneth's SalesDash Setup

Now let's create skills specific to your SalesDash project.

### Create Framework Skills ✓
```bash
source venv/bin/activate

# Next.js (if not already done)
python3 cli/doc_scraper.py --config configs/nextjs.json --enhance-local
python3 cli/package_skill.py output/nextjs/ --upload

# Prisma
python3 cli/doc_scraper.py --config configs/prisma.json --enhance-local
python3 cli/package_skill.py output/prisma/ --upload

# Upload to Claude
```
- [ ] Next.js skill created
- [ ] Prisma skill created
- [ ] Both uploaded to Claude

### Create Supplier Skills ✓
If your suppliers have online API docs:

```bash
# Diamond Cargo (adjust URL to real docs)
python3 cli/doc_scraper.py \
  --name diamond-cargo \
  --url https://diamondcargo.com/docs \
  --description "Diamond Cargo trailer specs and ordering API" \
  --enhance-local

python3 cli/package_skill.py output/diamond-cargo/ --upload

# Repeat for Quality Cargo and Panther Cargo
```
- [ ] Diamond Cargo skill created
- [ ] Quality Cargo skill created
- [ ] Panther Cargo skill created

### Create Internal Documentation Skill ✓
If you have internal PDFs or wikis:

```bash
# Internal sales manual
python3 cli/pdf_scraper.py \
  --pdf "path/to/MJ_Cargo_Sales_Manual.pdf" \
  --name mj-cargo-internal \
  --extract-tables \
  --enhance-local

python3 cli/package_skill.py output/mj-cargo-internal/ --upload
```
- [ ] Internal documentation skill created
- [ ] Uploaded to Claude

### Time: ~1-2 hours (depending on number of skills)

---

## Part 6: Daily Workflow Setup

### Create Shell Aliases (OPTIONAL but helpful) ✓
Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# Skill Seekers shortcuts
alias ss-activate='cd ~/Projects/Skill_Seekers && source venv/bin/activate'
alias ss-react='python3 cli/doc_scraper.py --config configs/react.json'
alias ss-package='python3 cli/package_skill.py'

# Claude Code shortcuts
alias cc='claude-code'
alias cc-brainstorm='/superpowers:brainstorm'
```

Reload your shell:
```bash
source ~/.zshrc  # or ~/.bashrc
```
- [ ] Aliases added
- [ ] Shell reloaded
- [ ] Test: `ss-activate` works

### Time: ~5 minutes

---

## Part 7: Verification & Testing

### Superpowers Checklist ✓
- [ ] Can run `/superpowers:brainstorm`
- [ ] Can run `/superpowers:write-plan`
- [ ] Can run `/superpowers:execute-plan`
- [ ] Skills auto-activate (e.g., TDD skill when writing code)

### Superpowers Lab Checklist ✓
- [ ] tmux is installed
- [ ] Plugin is installed
- [ ] Skills auto-activate when needed

### Skill Seekers Checklist ✓
- [ ] Can scrape documentation
- [ ] Can extract PDFs
- [ ] Can scrape GitHub repos
- [ ] Can package skills
- [ ] Can upload skills to Claude
- [ ] MCP integration works (if set up)

### Skills in Claude ✓
- [ ] At least 1 framework skill uploaded
- [ ] Can reference skills in new chats
- [ ] Skills appear in Claude skills settings

---

## Troubleshooting

### Superpowers not showing commands?
```bash
/plugin update superpowers
# Restart Claude Code
```

### Skill Seekers venv activation fails?
```bash
# Make sure you're in the Skill_Seekers directory
cd ~/Projects/Skill_Seekers

# Try creating venv again
python3 -m venv venv
source venv/bin/activate
```

### Package/upload fails?
```bash
# Check if output exists
ls output/myskill/

# Check if SKILL.md exists
cat output/myskill/SKILL.md

# Try packaging manually
python3 cli/package_skill.py output/myskill/
```

### Skills not working in Claude?
- Check you uploaded the .zip file
- Check skills settings at https://claude.ai/skills
- Try in a new conversation
- Reference the skill explicitly: "Using the Next.js skill, how do I..."

---

## Next Steps

Now that everything is installed:

1. **Daily SalesDash Development**:
   - Start with `/superpowers:brainstorm` before each feature
   - Use TDD skill (auto-activates)
   - Use systematic debugging for OAuth issues

2. **Create More Skills**:
   - Any framework you use frequently
   - Any supplier documentation
   - Any internal company knowledge

3. **Optimize Your Workflow**:
   - Use MCP for natural language skill creation
   - Use shell aliases for common commands
   - Create custom configs for your specific needs

4. **Share Knowledge**:
   - Export skills for your team
   - Contribute to Superpowers or Skill Seekers if you create useful skills

---

## Summary

✅ **Superpowers**: Installed & Working
- Systematic workflows for coding
- TDD, debugging, git worktrees
- Planning and execution commands

✅ **Superpowers Lab**: Installed & Working
- Experimental tmux automation
- New features as they develop

✅ **Skill Seekers**: Installed & Working
- Convert any docs to skills
- PDF, GitHub, documentation scraping
- MCP integration for natural language

✅ **Your First Skills**: Created & Uploaded
- Framework skills (Next.js, Prisma, etc.)
- Supplier documentation skills
- Internal company knowledge skills

---

## Time Investment vs. ROI

**Time Spent**: ~2-3 hours for full setup
**Time Saved**:
- 9 hours/week (manual data entry reduction)
- Countless hours (not searching docs constantly)
- Faster debugging (systematic approach)
- Better code quality (TDD enforcement)

**ROI**: Pays for itself in the first week! 🚀

---

## Resources

- Superpowers: `SUPERPOWERS_GUIDE.md`
- Superpowers Lab: `SUPERPOWERS_LAB_GUIDE.md`
- Skill Seekers: `SKILL_SEEKERS_GUIDE.md`
- Quick Reference: `QUICK_REFERENCE.md`

## Support

- Superpowers: https://github.com/obra/superpowers/issues
- Superpowers Lab: https://github.com/obra/superpowers-lab/issues
- Skill Seekers: https://github.com/yusufkaraaslan/Skill_Seekers/issues

---

**Congratulations! You're now equipped with the essential skills toolkit! 🎉**
