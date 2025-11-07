# 🚀 Essential Skills Quick Reference

## Quick Install Commands

### Superpowers (Stable - Core Skills Library)
```bash
# In Claude Code
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
/help  # Verify installation
```

### Superpowers Lab (Experimental - Tmux & New Features)
```bash
claude-code plugin install https://github.com/obra/superpowers-lab
```

### Skill Seekers (Doc → Skill Converter)
```bash
git clone https://github.com/yusufkaraaslan/Skill_Seekers.git
cd Skill_Seekers
python3 -m venv venv
source venv/bin/activate
pip install requests beautifulsoup4 pytest
```

---

## Superpowers - Essential Commands

```bash
# Core workflow
/superpowers:brainstorm      # Plan before coding
/superpowers:write-plan      # Create implementation plan
/superpowers:execute-plan    # Execute with checkpoints

# Update
/plugin update superpowers
```

**Key Skills**:
- TDD (test-driven-development)
- Systematic debugging
- Git worktrees
- Code review workflows
- Parallel agents

**When to use**: Every coding session. Start with `/brainstorm`, always.

---

## Superpowers Lab - Experimental Features

**Main Feature**: Tmux automation for interactive CLI tools

**Use cases**:
- Interactive editors (vim, nano)
- Git rebase -i automation
- Interactive REPLs
- Terminal UI tools

**Requirements**: tmux installed (`brew install tmux` or `apt-get install tmux`)

---

## Skill Seekers - Quick Recipes

### Recipe 1: Basic Documentation Scraping
```bash
source venv/bin/activate
python3 cli/doc_scraper.py --config configs/react.json --enhance-local
python3 cli/package_skill.py output/react/
# Upload output/react.zip to https://claude.ai/skills
```

### Recipe 2: PDF to Skill
```bash
pip install PyMuPDF
python3 cli/pdf_scraper.py --pdf manual.pdf --name myskill
python3 cli/package_skill.py output/myskill/
```

### Recipe 3: GitHub Repo to Skill
```bash
pip install PyGithub
export GITHUB_TOKEN=ghp_your_token
python3 cli/github_scraper.py --repo facebook/react
python3 cli/package_skill.py output/react/
```

### Recipe 4: Unified (Docs + GitHub + PDF)
```bash
python3 cli/unified_scraper.py --config configs/myframework_unified.json
python3 cli/package_skill.py output/myframework/
```

### Recipe 5: MCP Mode (Natural Language)
```bash
./setup_mcp.sh
# Restart Claude Code
# Then: "Generate config for Tailwind at https://tailwindcss.com/docs"
```

---

## Kenneth's SalesDash Use Cases

### Use Case 1: Learn Framework Once
```bash
# Create Next.js skill
python3 cli/doc_scraper.py --config configs/nextjs.json --enhance-local
python3 cli/package_skill.py output/nextjs/ --upload

# Claude now knows Next.js in EVERY conversation!
```

### Use Case 2: Supplier Documentation
```bash
# Diamond Cargo API
python3 cli/doc_scraper.py \
  --name diamond-cargo \
  --url https://diamondcargo.com/api-docs \
  --enhance-local

# Quality Cargo API
python3 cli/doc_scraper.py \
  --name quality-cargo \
  --url https://qualitycargo.com/api-docs \
  --enhance-local

# Panther Cargo API
python3 cli/doc_scraper.py \
  --name panther-cargo \
  --url https://panthercargo.com/api-docs \
  --enhance-local
```

### Use Case 3: Internal Company Docs
```bash
# PDF manual
python3 cli/pdf_scraper.py \
  --pdf "MJ_Cargo_Sales_Manual.pdf" \
  --name mj-internal \
  --extract-tables

# Company wiki
python3 cli/doc_scraper.py \
  --name mj-procedures \
  --url https://mjcargo.internal/wiki
```

### Use Case 4: OAuth Fix Workflow
```bash
# In Claude Code with Superpowers installed:
/superpowers:brainstorm
# > "OAuth callback loop blocking 20-30 users"

/superpowers:write-plan
# > Creates systematic debugging plan

/superpowers:execute-plan
# > Executes with checkpoints, runs tests
```

---

## Key Reminders

### Superpowers Philosophy
- **Test first** - Always TDD
- **Systematic** - Process over guessing
- **Simple** - Reduce complexity
- **Verify** - Evidence over claims

### Skill Seekers Workflow
1. **Scrape** - Point at docs/PDF/GitHub
2. **Enhance** - AI improves SKILL.md (use `--enhance-local`)
3. **Package** - Creates .zip file
4. **Upload** - To claude.ai/skills

### Performance Tips
- Use `--async` for large docs (2-3x faster)
- Use `--skip-scrape` to rebuild without re-scraping
- Use `--enhance-local` (no API costs, uses Claude Code Max)
- Enable checkpoints for long scrapes

---

## Common Issues & Fixes

### Superpowers not working?
```bash
/plugin update superpowers
# Restart Claude Code
```

### Skill Seekers scraping fails?
```bash
# Check main_content selector
# Try: article, main, div[role="main"]

# Re-scrape fresh
rm -rf output/myframework_data/
python3 cli/doc_scraper.py --config configs/myframework.json
```

### PDF extraction issues?
```bash
# Install OCR for scanned PDFs
pip install pytesseract Pillow

# Use parallel processing
python3 cli/pdf_scraper.py --pdf doc.pdf --name skill --parallel --workers 8
```

---

## File Locations

### Superpowers
- Skills: `/Users/kenneth/.claude/plugins/cache/Superpowers/skills/`
- Personal skills: `~/.claude/skills/`

### Skill Seekers
- Configs: `configs/*.json`
- Output data: `output/*_data/` (cached)
- Built skills: `output/*/`
- Packaged skills: `output/*.zip`

---

## Time Estimates

| Task | Time |
|------|------|
| Superpowers install | 2 min |
| Skill Seekers setup | 5 min |
| Doc scraping (small) | 5-15 min |
| Doc scraping (large) | 15-45 min |
| PDF extraction | 5-15 min |
| GitHub scraping | 5-10 min |
| Unified scraping | 30-45 min |
| Enhancement (local) | 30-60 sec |
| Packaging | 5-10 sec |

---

## Links

### Superpowers
- Main: https://github.com/obra/superpowers
- Lab: https://github.com/obra/superpowers-lab
- Blog: https://blog.fsck.com/2025/10/09/superpowers/

### Skill Seekers
- GitHub: https://github.com/yusufkaraaslan/Skill_Seekers
- Start here: BULLETPROOF_QUICKSTART.md
- Docs: docs/*.md

### Claude
- Skills: https://claude.ai/skills
- API Console: https://console.anthropic.com/

---

## Pro Tips for Kenneth

1. **Start every coding session with `/superpowers:brainstorm`**
2. **Create skills for ALL your frameworks** (Next.js, Prisma, TypeScript, Vonage, Resend)
3. **Create skills for supplier APIs** (Diamond, Quality, Panther Cargo)
4. **Use git worktrees** for parallel dev (OAuth fix + new features)
5. **Enable TDD skill** - It'll save you from 3 AM debugging
6. **Create internal MJ Cargo skill** - Company knowledge in every chat
7. **Use `--enhance-local`** - No API costs!
8. **Set up MCP** - Use Skill Seekers from Claude Code naturally

**The Goal**:
- Superpowers = HOW to code systematically
- Skill Seekers = WHAT knowledge to give Claude
- Together = Unstoppable development flow 🚀
