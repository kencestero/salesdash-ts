# 🦸 Superpowers by obra - Essential Skills Library

## Quick Install (Claude Code)
```bash
# In Claude Code
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace

# Verify installation
/help
# Should see:
# /superpowers:brainstorm - Interactive design refinement
# /superpowers:write-plan - Create implementation plan
# /superpowers:execute-plan - Execute plan in batches
```

## Repository
- **Main**: https://github.com/obra/superpowers
- **Skills Repo**: https://github.com/obra/superpowers-skills
- **Marketplace**: https://github.com/obra/superpowers-marketplace
- **Version**: 3.2.3
- **License**: MIT

## What It Is
Core skills library for Claude Code with 20+ battle-tested skills. Think of it as a Swiss Army knife that teaches Claude systematic approaches to coding tasks.

## Key Features
- **Slash Commands**: `/brainstorm`, `/write-plan`, `/execute-plan`
- **Auto-Activation**: Skills activate when relevant (no manual triggering)
- **Systematic Workflows**: TDD, debugging, git workflows, code review
- **Meta Skills**: Create, test, and share your own skills

## Core Skills Included

### Testing Skills (`skills/testing/`)
- **test-driven-development** - RED-GREEN-REFACTOR cycle
- **condition-based-waiting** - Async test patterns
- **testing-anti-patterns** - Common pitfalls to avoid

### Debugging Skills (`skills/debugging/`)
- **systematic-debugging** - 4-phase root cause process
- **root-cause-tracing** - Find the real problem
- **verification-before-completion** - Ensure it's actually fixed
- **defense-in-depth** - Multiple validation layers

### Collaboration Skills (`skills/collaboration/`)
- **brainstorming** - Socratic design refinement
- **writing-plans** - Detailed implementation plans
- **executing-plans** - Batch execution with checkpoints
- **dispatching-parallel-agents** - Concurrent subagent workflows
- **requesting-code-review** - Pre-review checklist
- **receiving-code-review** - Responding to feedback

### Development Skills
- **using-git-worktrees** - Parallel development branches
- **finishing-a-development-branch** - Merge/PR decision workflow
- **subagent-driven-development** - Fast iteration with quality gates

### Meta Skills (`skills/meta/`)
- **writing-skills** - Create new skills following best practices
- **sharing-skills** - Contribute skills back via branch and PR
- **testing-skills-with-subagents** - Validate skill quality
- **using-superpowers** - Introduction to the skills system

## How Skills Work
1. **SessionStart Hook** - Loads `using-superpowers` skill at session start
2. **Automatic Discovery** - Claude finds and uses relevant skills for your task
3. **Mandatory Workflows** - When a skill exists for a task, using it becomes required
4. **On-Demand Loading** - Skills only consume 30-50 tokens until activated

## Philosophy
- **Test-Driven Development** - Write tests first, always
- **Systematic over ad-hoc** - Process over guessing
- **Complexity reduction** - Simplicity as primary goal
- **Evidence over claims** - Verify before declaring success
- **Domain over implementation** - Work at problem level, not solution level

## Quick Workflow
```bash
# 1. Brainstorm a design
/superpowers:brainstorm

# 2. Create implementation plan
/superpowers:write-plan

# 3. Execute the plan
/superpowers:execute-plan
```

## Common Use Cases

### For Your SalesDash CRM
```bash
# Planning a new feature
/superpowers:brainstorm
# > "I want to add automated SMS follow-ups"

# Create detailed plan
/superpowers:write-plan

# Execute with checkpoints
/superpowers:execute-plan
```

### Git Worktree Workflow
The `using-git-worktrees` skill is perfect for:
- Working on OAuth fix while testing another feature
- Parallel development of SMS integration and payment calculator
- Isolated testing environments

```bash
# Automatically creates worktree structure
# Tests in isolation
# Handles cleanup and merging
```

## Update Skills
```bash
/plugin update superpowers
```

## Contributing Skills
Skills live directly in the repository. To contribute:
1. Fork the repository
2. Create a branch for your skill
3. Follow the `writing-skills` skill for structure
4. Use `testing-skills-with-subagents` to validate
5. Submit a PR

## File Structure
```
superpowers/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── testing/
│   ├── debugging/
│   ├── collaboration/
│   ├── development/
│   └── meta/
└── commands/
    ├── brainstorm.md
    ├── write-plan.md
    └── execute-plan.md
```

## Tips for Kenneth's Workflow
1. **Use `/brainstorm` before coding** - Plan OAuth callback loop fix systematically
2. **Enable TDD skill** - Will activate automatically when implementing features
3. **Git worktrees** - Perfect for your multi-tasking style (sales + dev work)
4. **Systematic debugging** - Use for the email verification bugs
5. **Parallel agents** - Delegate tasks while you focus on high-priority items

## Resources
- **Blog Post**: https://blog.fsck.com/2025/10/09/superpowers/
- **Release Notes**: https://github.com/obra/superpowers/blob/main/RELEASE-NOTES.md
- **Skills Documentation**: All skills have detailed SKILL.md files

## Why This Matters for You
You're juggling:
- 700+ leads syncing daily
- OAuth callback loops blocking 20-30 users
- 9 hours/week of manual data entry
- Multiple supplier integrations
- Late-night debugging sessions

Superpowers gives you **systematic workflows** to handle this complexity without burning out. The skills enforce best practices when you're tired at 3 AM debugging.
