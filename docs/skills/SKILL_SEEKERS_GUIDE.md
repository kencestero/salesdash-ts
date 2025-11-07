# 🔍 Skill Seekers by yusufkaraaslan - Documentation to Skills Converter

## Quick Install
```bash
# Clone repository
git clone https://github.com/yusufkaraaslan/Skill_Seekers.git
cd Skill_Seekers

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# OR: venv\Scripts\activate  # Windows

# Install dependencies
pip install requests beautifulsoup4 pytest

# Optional: For PDF support
pip install PyMuPDF

# Optional: For GitHub scraping
pip install PyGithub
```

## Repository
- **GitHub**: https://github.com/yusufkaraaslan/Skill_Seekers
- **Latest Version**: v2.0.0 (Unified Multi-Source Scraping)
- **License**: MIT
- **Status**: Production Ready ✅

## What It Is
Automated tool that transforms documentation websites, GitHub repositories, and PDF files into production-ready Claude AI skills in 20-40 minutes instead of hours of manual work.

## The Problem It Solves
You need to teach Claude about:
- Your company's internal framework
- A new library/framework
- PDF documentation
- GitHub codebases

**Without Skill Seekers**: Copy/paste docs into every conversation
**With Skill Seekers**: Point at docs once → Generate skill → Claude knows it forever

## Kenneth's Use Case: Trailer Industry Knowledge
```bash
# Example: Create skill for Diamond Cargo's API docs
python3 cli/doc_scraper.py \
  --name diamond-cargo \
  --url https://diamondcargo.com/dealer-docs \
  --description "Diamond Cargo trailer specifications and ordering API"

# Upload to Claude
python3 cli/package_skill.py output/diamond-cargo/ --upload

# Now Claude knows Diamond Cargo's specs WITHOUT you pasting docs every time!
```

## Key Features

### 1. Documentation Scraping
- ✅ Works with ANY documentation website
- ✅ Auto-detects llms.txt files (10x faster)
- ✅ Smart categorization
- ✅ Code language detection
- ✅ 8 ready-to-use presets (React, Vue, Django, FastAPI, Godot, etc.)

### 2. PDF Support
- ✅ Basic PDF text extraction
- ✅ OCR for scanned PDFs
- ✅ Password-protected PDFs
- ✅ Table extraction
- ✅ Parallel processing (3x faster)

### 3. GitHub Repository Scraping
- ✅ Deep code analysis (AST parsing)
- ✅ API extraction (functions, classes, methods)
- ✅ Repository metadata
- ✅ GitHub Issues & PRs
- ✅ CHANGELOG & Releases
- ✅ Conflict detection

### 4. Unified Multi-Source Scraping (NEW in v2.0)
Combine documentation + GitHub + PDF into ONE comprehensive skill!
- ✅ Conflict detection between docs and code
- ✅ Documentation gap analysis
- ✅ Side-by-side comparisons
- ✅ Single source of truth

### 5. MCP Integration
Use directly from Claude Code with natural language!
```bash
# After setup:
"Generate config for Tailwind at https://tailwindcss.com/docs"
"Scrape docs using configs/react.json"
"Package skill at output/react/"
```

## Quick Start Examples

### Example 1: Scrape Documentation (Fast)
```bash
# Activate venv
source venv/bin/activate

# Use preset (React example)
python3 cli/doc_scraper.py --config configs/react.json --enhance-local

# Package
python3 cli/package_skill.py output/react/

# Result: output/react.zip ready to upload!
# Time: ~25 minutes
```

### Example 2: Scrape PDF
```bash
# Basic PDF
python3 cli/pdf_scraper.py --pdf docs/manual.pdf --name myskill

# With advanced features
python3 cli/pdf_scraper.py --pdf docs/manual.pdf --name myskill \
  --extract-tables \
  --parallel \
  --workers 8

# Scanned PDF with OCR
pip install pytesseract Pillow
python3 cli/pdf_scraper.py --pdf docs/scanned.pdf --name myskill --ocr

# Password-protected PDF
python3 cli/pdf_scraper.py --pdf docs/encrypted.pdf --name myskill --password mypass

# Time: ~5-15 minutes
```

### Example 3: Scrape GitHub Repository
```bash
# Basic repo scraping
python3 cli/github_scraper.py --repo facebook/react

# With issues and releases
python3 cli/github_scraper.py --repo django/django \
  --include-issues \
  --max-issues 100 \
  --include-changelog \
  --include-releases

# With authentication (higher rate limits)
export GITHUB_TOKEN=ghp_your_token_here
python3 cli/github_scraper.py --repo facebook/react

# Time: ~5-10 minutes
```

### Example 4: Unified Scraping (Docs + GitHub + PDF)
```bash
# Create unified config
cat > configs/myframework_unified.json << 'EOF'
{
  "name": "myframework",
  "description": "Complete framework knowledge from docs + code",
  "merge_mode": "rule-based",
  "sources": [
    {
      "type": "documentation",
      "base_url": "https://docs.myframework.com/",
      "max_pages": 200
    },
    {
      "type": "github",
      "repo": "owner/myframework",
      "include_code": true
    }
  ]
}
EOF

# Run unified scraper
python3 cli/unified_scraper.py --config configs/myframework_unified.json

# Time: ~30-45 minutes
# Result: Skill with conflict detection!
```

## MCP Setup (Use from Claude Code)
```bash
# One-time setup
cd Skill_Seekers
./setup_mcp.sh

# Restart Claude Code

# Then just ask:
"List all available configs"
"Generate config for Tailwind at https://tailwindcss.com/docs"
"Scrape docs using configs/react.json"
"Package and upload the React skill"
```

## Uploading Skills to Claude

### Option 1: Automatic Upload (Recommended)
```bash
# Set API key (one-time)
export ANTHROPIC_API_KEY=sk-ant-...

# Package and upload automatically
python3 cli/package_skill.py output/react/ --upload

# OR upload existing .zip
python3 cli/upload_skill.py output/react.zip
```

### Option 2: Manual Upload
```bash
# Package skill
python3 cli/package_skill.py output/react/
# Creates output/react.zip and opens folder

# Then:
# 1. Go to https://claude.ai/skills
# 2. Click "Upload Skill"
# 3. Select output/react.zip
# 4. Done!
```

## Available Presets
```bash
configs/
├── godot.json           # Godot Engine (game dev)
├── react.json           # React framework
├── vue.json             # Vue.js
├── django.json          # Django (Python)
├── fastapi.json         # FastAPI (Python)
├── ansible-core.json    # Ansible automation
└── ...

# Use any preset:
python3 cli/doc_scraper.py --config configs/[preset].json
```

## Creating Custom Config
```json
{
  "name": "myframework",
  "description": "When to use this skill",
  "base_url": "https://docs.myframework.com/",
  "selectors": {
    "main_content": "article",
    "title": "h1",
    "code_blocks": "pre code"
  },
  "url_patterns": {
    "include": ["/docs", "/guide"],
    "exclude": ["/blog", "/about"]
  },
  "categories": {
    "getting_started": ["intro", "quickstart"],
    "api": ["api", "reference"]
  },
  "rate_limit": 0.5,
  "max_pages": 500
}
```

## Advanced Features

### Async Mode (2-3x Faster)
```bash
# Enable async with 8 workers
python3 cli/doc_scraper.py --config configs/react.json --async --workers 8

# Performance: ~55 pages/sec vs ~18 pages/sec
# Memory: 40 MB vs 120 MB
```

### Large Documentation (10K-40K+ pages)
```bash
# 1. Estimate pages first
python3 cli/estimate_pages.py configs/godot.json

# 2. Auto-split into focused sub-skills
python3 cli/split_config.py configs/godot.json --strategy router

# 3. Scrape all in parallel
for config in configs/godot-*.json; do
  python3 cli/doc_scraper.py --config $config &
done
wait

# 4. Generate intelligent router/hub skill
python3 cli/generate_router.py configs/godot-*.json

# 5. Package all
python3 cli/package_multi.py output/godot*/
```

### Checkpoint/Resume (Never Lose Progress)
```json
{
  "checkpoint": {
    "enabled": true,
    "interval": 1000
  }
}
```

```bash
# If interrupted, resume:
python3 cli/doc_scraper.py --config configs/godot.json --resume
```

### AI Enhancement (Better SKILL.md)
```bash
# Option 1: LOCAL enhancement (no API costs, uses Claude Code Max)
python3 cli/doc_scraper.py --config configs/react.json --enhance-local

# Option 2: API-based enhancement
export ANTHROPIC_API_KEY=sk-ant-...
python3 cli/doc_scraper.py --config configs/react.json --enhance

# Option 3: Enhance after scraping
python3 cli/enhance_skill_local.py output/react/
```

## Real-World Use Cases for SalesDash

### Use Case 1: Supplier Documentation
```bash
# Create skills for each supplier's API
python3 cli/doc_scraper.py \
  --name diamond-cargo \
  --url https://diamondcargo.com/api-docs

python3 cli/doc_scraper.py \
  --name quality-cargo \
  --url https://qualitycargo.com/dealer-api

python3 cli/doc_scraper.py \
  --name panther-cargo \
  --url https://panthercargo.com/integration

# Now Claude knows all three APIs!
```

### Use Case 2: Internal Documentation
```bash
# Convert your company's internal docs
python3 cli/pdf_scraper.py \
  --pdf "MJ_Cargo_Sales_Process.pdf" \
  --name mj-cargo-internal

# Or scrape your internal wiki/docs site
python3 cli/doc_scraper.py \
  --name mj-sales-procedures \
  --url https://mjcargo.internal/docs
```

### Use Case 3: Framework Documentation
```bash
# Learn Next.js, Prisma, etc. once
python3 cli/doc_scraper.py --config configs/nextjs.json
python3 cli/doc_scraper.py --config configs/prisma.json

# Claude now knows these frameworks in every conversation!
```

## Directory Structure
```
Skill_Seekers/
├── cli/
│   ├── doc_scraper.py          # Main scraping tool
│   ├── pdf_scraper.py          # PDF extraction
│   ├── github_scraper.py       # GitHub scraping
│   ├── unified_scraper.py      # Multi-source
│   ├── package_skill.py        # Package to .zip
│   └── upload_skill.py         # Auto-upload
├── mcp/
│   └── server.py               # MCP server (9 tools)
├── configs/
│   └── *.json                  # Presets
└── output/
    ├── *_data/                 # Scraped data (cached)
    ├── */                      # Built skills
    └── *.zip                   # Packaged skills
```

## Performance & Time
| Task | Time | Notes |
|------|------|-------|
| Doc scraping (sync) | 15-45 min | First time only |
| Doc scraping (async) | 5-15 min | 2-3x faster |
| PDF extraction | 5-15 min | Basic extraction |
| GitHub scraping | 5-10 min | Repo analysis |
| Unified scraping | 30-45 min | Docs + GitHub + PDF |
| Building | 1-3 min | Fast! |
| Re-building | <1 min | With --skip-scrape |
| Enhancement | 30-60 sec | LOCAL mode |
| Packaging | 5-10 sec | Final zip |

## Troubleshooting

### Pages Not Being Found?
- Check your `main_content` selector
- Try: `article`, `main`, `div[role="main"]`

### Categorization Issues?
- Edit the `categories` section with better keywords
- Re-scrape to test

### Need to Re-scrape?
```bash
# Delete old data
rm -rf output/myframework_data/

# Re-scrape
python3 cli/doc_scraper.py --config configs/myframework.json
```

## Documentation Resources
- **Bulletproof Quick Start**: BULLETPROOF_QUICKSTART.md (START HERE!)
- **Quick Start**: QUICKSTART.md
- **Troubleshooting**: TROUBLESHOOTING.md
- **Large Docs**: docs/LARGE_DOCUMENTATION.md
- **Async Support**: ASYNC_SUPPORT.md
- **Enhancement**: docs/ENHANCEMENT.md
- **Upload Guide**: docs/UPLOAD_GUIDE.md
- **MCP Setup**: docs/MCP_SETUP.md
- **Architecture**: docs/CLAUDE.md

## Why This Matters for Kenneth
You're learning frameworks (Next.js, Prisma, TypeScript) while building SalesDash. Instead of:
- Constantly searching docs
- Pasting documentation into every conversation
- Forgetting API details

You can:
- Create skills for every framework you use
- Claude knows them in EVERY conversation
- Focus on building, not doc lookup

Example: Create a "Next.js + Prisma + TypeScript" unified skill, and Claude will know all three in every SalesDash conversation!

## Community & Support
- **GitHub Issues**: https://github.com/yusufkaraaslan/Skill_Seekers/issues
- **Discussions**: https://github.com/yusufkaraaslan/Skill_Seekers/discussions
- **Contributing**: See FLEXIBLE_ROADMAP.md (134 tasks available!)

## Version History
- **v2.0.0** (Oct 26, 2025) - Unified multi-source scraping, conflict detection
- **v1.1.0** - PDF enhancements, OCR support, parallel processing
- **v1.0.0** (Oct 22, 2025) - First production release

## The Big Picture
Skill Seekers is THE tool for converting any documentation into Claude skills. Point it at:
- Documentation websites
- GitHub repos
- PDF manuals
- Internal wikis

Get production-ready skills in 20-40 minutes that make Claude an expert on YOUR specific tools and frameworks.
