# 🧪 Superpowers Lab by obra - Experimental Skills

## Quick Install (Claude Code)
```bash
# Install the plugin
claude-code plugin install https://github.com/obra/superpowers-lab

# Or add to your claude.json
{
  "plugins": [
    "https://github.com/obra/superpowers-lab"
  ]
}
```

## Repository
- **GitHub**: https://github.com/obra/superpowers-lab
- **License**: MIT
- **Status**: Experimental (but functional and tested)

## What It Is
Experimental/bleeding-edge version of Superpowers. Contains new techniques and tools that are still being refined and tested based on real-world usage.

## Key Difference from Main Superpowers
- **Main Superpowers**: Battle-tested, stable skills
- **Superpowers Lab**: Experimental features, new techniques, cutting-edge tools
- **Evolution**: Skills may change based on feedback

## Current Experimental Skills

### Using tmux for Interactive Commands
**Status**: ✅ Functional and tested

Enables Claude Code to control interactive CLI tools through tmux sessions:
- Interactive text editors (vim, nano)
- Terminal UI tools (menuconfig, htop)
- Interactive REPLs (Python, Node.js, etc.)
- Interactive git operations (rebase -i, add -p)
- Any tool requiring keyboard navigation and real-time interaction

**How It Works**:
1. Creates detached tmux sessions
2. Sends keystrokes programmatically
3. Captures terminal output
4. Enables automation of traditionally manual workflows

**Use Cases for Your SalesDash Project**:
- Interactive database migrations
- Git rebase workflows when resolving conflicts
- Testing interactive CLI tools you build
- Debugging with interactive debuggers (pdb, node inspect)

**Documentation**: See `skills/using-tmux-for-interactive-commands/SKILL.md` for full guide

## Requirements
- **tmux** must be installed on your system
- Tested on Linux/macOS

```bash
# Install tmux
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt-get install tmux

# Check installation
tmux -V
```

## Skills Characteristics
All skills in Superpowers Lab are:
- ✅ **Functional and tested** - They work, they're just newer
- 🧪 **Under active refinement** - Based on real-world usage
- 📝 **May evolve** - APIs and workflows might change
- 🔬 **Open to feedback** - Contributions welcome

## When to Use Lab vs Main
- **Use Main Superpowers** when you need stability and proven workflows
- **Use Lab** when you want cutting-edge features or need tmux automation
- **Use Both** - They complement each other!

## Related Projects
- **superpowers** - Core skills library (stable)
- **superpowers-chrome** - Browser automation skills
- **superpowers-skills** - Community-editable skills repository
- **superpowers-marketplace** - Curated plugin marketplace

## Contributing
Found a bug or have an improvement?
1. Open an issue on GitHub
2. Submit a PR
3. Share feedback about your use case

## Installation Verification
```bash
# After installation, restart Claude Code
# Skills will auto-activate when relevant

# To see if tmux skill is available:
# Just try to use it - Claude will know when to activate it
```

## Potential Future Skills
Lab is where new ideas get tested. Future experimental skills might include:
- Advanced memory systems
- Multi-agent coordination
- Custom LLM integrations
- Novel development workflows

## Why This Matters for Kenneth
You're already pushing boundaries:
- Building a CRM from scratch
- Learning to code with AI assistance
- Working at 3 AM debugging OAuth
- Juggling sales and development

Lab skills give you **experimental tools** for edge cases. The tmux skill could help automate interactive debugging sessions when you're troubleshooting those callback loops.

## Example: Tmux for Interactive Git Rebase
```bash
# Instead of manually doing:
git rebase -i HEAD~10
# [manually pick/squash commits]
# [resolve conflicts]

# Claude can automate it through tmux:
# - Opens rebase in tmux session
# - Sends keystrokes
# - Handles conflicts
# - Completes the rebase
```

## Status Updates
Skills move from Lab to main Superpowers once they're proven stable. Check release notes for graduations.

## Community
Part of the broader Superpowers ecosystem:
- Growing community of AI-assisted developers
- Skills-based approach becoming industry standard
- Integration with MCP (Model Context Protocol)

## Resources
- **Main Superpowers**: https://github.com/obra/superpowers
- **Blog Post**: https://blog.fsck.com/2025/10/09/superpowers/
- **Issues**: https://github.com/obra/superpowers-lab/issues
