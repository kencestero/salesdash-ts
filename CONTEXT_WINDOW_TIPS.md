# HOW TO NOT RUN OUT OF MEMORY WITH CODY & PAPI CLAUDE

**Simple Tips from YouTube Video - For Kenneth**

---

## 🧠 WHAT IS THE CONTEXT WINDOW? (SIMPLE EXPLANATION)

Think of it like **short-term memory** for Claude agents:

```
Context Window = What Claude remembers RIGHT NOW in this conversation

When it fills up → Claude starts forgetting things you just told it!
```

**Size:** 200,000 tokens (sounds like a lot, but fills up FAST!)

**What uses up tokens:**
- ✅ Every message you send
- ✅ Every file Claude reads
- ✅ Every response Claude writes
- ✅ Searching the codebase
- ✅ Reading documentation from the web
- ✅ Looking at screenshots
- ✅ Reading error logs

**Example:**
- Reading 1 file = 500-1,000 tokens
- Reading 10 files = 5,000-10,000 tokens
- Back-and-forth conversation = 1,000-5,000 tokens each
- **You can see how it adds up FAST!**

---

## 🚨 SIGNS YOUR CONTEXT WINDOW IS FULL

You'll notice Claude starts:
- ❌ Forgetting functions you just built
- ❌ Suggesting changes that break what you already made
- ❌ Asking you to repeat things you already said
- ❌ Re-reading files it already read before (wasting MORE tokens!)
- ❌ Losing track of your project structure

**When this happens → Time to clear or compact!**

---

## 🔧 TWO COMMANDS TO MANAGE CONTEXT

### Command #1: `/clear`
**What it does:** Complete reset - starts fresh, forgets EVERYTHING

**When to use:**
```
✅ You're done with a task and moving to something new
✅ The previous context doesn't matter anymore
✅ You want a totally clean slate
```

**Example:**
```
You: "Deploy the changes"
Cody: "Deployed! ✅"
You: "/clear"
You: "Now let's work on a completely different feature"
```

---

### Command #2: `/compact`
**What it does:** Summarizes current conversation, starts fresh context WITH that summary

**When to use:**
```
✅ Context window getting full (Claude will warn you!)
✅ You want to keep going but need more space
✅ Current context IS still important
```

**Basic usage:**
```
/compact
```

**POWER MOVE - Give it instructions!**
```
/compact keep the database schema and authentication logic
/compact remember the color scheme and button layout
/compact preserve the API endpoint structure
```

**Why this is better:**
- Claude knows EXACTLY what to keep
- Won't lose important details in the summary
- Extends your context window intelligently

---

## 🤖 SECRET WEAPON: SUB-AGENTS (SUPER IMPORTANT!)

### What Are Sub-Agents?
**Specialized mini-Claudes that work in THEIR OWN context window!**

**The Magic:**
```
Main Claude's context = 200,000 tokens
Sub-agent's context = ANOTHER 200,000 tokens

When sub-agent does work → Uses ITS OWN tokens, not main Claude's!
```

### Example Sub-Agents:
1. **Context Fetcher** - Reads lots of files, finds information
2. **File Creator** - Creates new files and folders
3. **Git Workflow** - Commits, creates pull requests
4. **Test Runner** - Runs tests, suggests fixes

**Real Example:**
```
You: "Papi Claude, build a new feature"
Papi: "I'll use the File Creator sub-agent to create the files"
[File Creator uses 7,500 tokens in ITS OWN context]
Papi's context: Still has 200,000 tokens available! ✅
```

**The Savings:**
```
Without sub-agents:
- Main context: 200,000 tokens
- After creating files: 192,500 tokens left (used 7,500)

With sub-agents:
- Main context: 200,000 tokens (still full!)
- Sub-agent context: 192,500 tokens left
```

**YOU JUST SAVED 7,500 TOKENS!** 🎉

---

## 📝 TIP #1: BE CONCISE, NOT VERBOSE

### ❌ DON'T DO THIS (Too Wordy):
```
"Hey Claude, I need you to build a feature for me. The feature should
allow users to upload files, and it should support multiple file formats
including PDF, Excel, and CSV. The upload should have a nice UI with
drag-and-drop functionality, and it should show a progress bar while
uploading. Also, make sure to handle errors gracefully and show the user
a message if something goes wrong. And don't forget to add validation
to check if the file size is too big..."
```
**Problem:** 100+ words = LOTS of tokens wasted!

### ✅ DO THIS INSTEAD (Concise):
```
"Build a file upload feature:
- Supports: PDF, Excel, CSV
- Drag-and-drop UI
- Progress bar
- Error handling
- File size validation

Ask questions if you need clarification."
```
**Better:** 30 words = Saves tokens + clearer instructions!

---

## 📝 TIP #2: USE SPECS, NOT LONG EXPLANATIONS

### Instead of explaining everything in chat:
```
❌ "Build X feature that does Y and Z, with A and B, and make sure C..."
(Uses 5,000 tokens explaining in chat)
```

### Create a spec file first:
```
✅ "Read FEATURE_SPEC.md and build it"
(Uses 1,000 tokens to read the spec once)
```

**Why this works:**
- Spec is written once, read once
- No back-and-forth clarifications
- Claude has ALL the info upfront
- Saves TONS of tokens!

---

## 📝 TIP #3: DON'T USE CLAUDE FOR EVERYTHING

**Smart Workflow:**

### Use Claude Code for:
```
✅ Building entire features from specs
✅ Creating new files and folders
✅ Big complex tasks
✅ Setting up new systems
```

### Use Cursor (or simple edits) for:
```
✅ Quick tweaks ("move this function here")
✅ Small refactors
✅ Tiny UI changes
✅ Back-and-forth refinements
```

**Why:**
```
Back-and-forth revisions = CONTEXT KILLER!

Example:
You: "Move this function"
Claude: *moves it*
You: "Now rename it"
Claude: *renames it*
You: "Now add a comment"
Claude: *adds comment*

Result: Used 5,000+ tokens on simple edits!

Better: Do those in Cursor or manually
```

---

## 🎯 KENNETH'S SIMPLE RULES TO FOLLOW

### Rule #1: Clear Between Big Tasks
```
Finished one feature? → /clear
Starting new feature? → Fresh start!
```

### Rule #2: Compact With Instructions
```
Context getting full? → /compact keep [important stuff]
Don't let it auto-compact → You lose control!
```

### Rule #3: Let Sub-Agents Do Heavy Lifting
```
Creating lots of files? → Sub-agent
Reading documentation? → Sub-agent
Running tests? → Sub-agent
Committing to git? → Sub-agent
```

### Rule #4: Be Concise
```
❌ Long paragraphs explaining everything
✅ Bullet points with clear requirements
✅ "Ask questions if unclear"
```

### Rule #5: Use Specs for Big Features
```
❌ Explain the feature in chat (wastes tokens)
✅ Write a spec file, Claude reads it once
```

### Rule #6: Save Context for Building
```
❌ Use Claude for tiny tweaks and revisions
✅ Use Claude for creating and building
✅ Use Cursor/manual edits for refinements
```

---

## 📊 CONTEXT USAGE BREAKDOWN

**What Uses the MOST Tokens:**

1. **Reading Multiple Files** (1,000-10,000 tokens each time)
2. **Back-and-Forth Revisions** (500-2,000 tokens per exchange)
3. **Re-Reading Files** (wasted tokens doing same work twice!)
4. **Fetching Web Documentation** (2,000-5,000 tokens)
5. **Analyzing Screenshots** (1,000-3,000 tokens)
6. **Long Explanations in Chat** (500-5,000 tokens)

**How to Save Tokens:**

1. **Use Sub-Agents** → Offloads 5,000-10,000 tokens per task
2. **Be Concise** → Saves 1,000-5,000 tokens per request
3. **Use Specs** → Saves 3,000-10,000 tokens on explanations
4. **Clear/Compact Smartly** → Keeps context fresh
5. **Don't Over-Explain** → Trust Claude to ask questions

---

## 🚀 POWER WORKFLOW EXAMPLE

### Bad Workflow (Runs Out of Context Fast):
```
1. You: "Build feature X" (long explanation - 5,000 tokens)
2. Claude: *builds it* (10,000 tokens)
3. You: "Move this here" (1,000 tokens)
4. Claude: *moves it* (2,000 tokens)
5. You: "Change the color" (1,000 tokens)
6. Claude: *changes it* (2,000 tokens)
7. You: "Add a button" (1,000 tokens)
8. Claude: *adds button* (2,000 tokens)
9. You: "Wait, move that function" (1,000 tokens)
10. Claude: *moves it* (2,000 tokens)

Total: 27,000 tokens for one feature! 😱
```

### Good Workflow (Saves TONS of Context):
```
1. Write spec: FEATURE_X_SPEC.md (done outside Claude)
2. You: "Read FEATURE_X_SPEC.md and build it" (500 tokens)
3. Claude: *uses File Creator sub-agent* (uses sub-agent's context!)
4. Claude: *builds feature* (8,000 tokens)
5. You: "/clear" (resets context)
6. Do small tweaks in Cursor (0 Claude tokens!)
7. You: "Test the feature" (uses Test Runner sub-agent)
8. You: "Commit changes" (uses Git Workflow sub-agent)

Total: ~9,000 tokens in Claude's main context! 🎉
(Plus sub-agents used their OWN contexts)
```

**YOU JUST SAVED 18,000 TOKENS = 3X MORE EFFICIENT!**

---

## ✅ CHECKLIST FOR EVERY SESSION

**Before Starting:**
- [ ] Know what task you're doing (clear goal)
- [ ] Write a spec if it's a big feature
- [ ] Decide if you need sub-agents

**During Work:**
- [ ] Be concise in your requests
- [ ] Let sub-agents handle file creation, testing, git
- [ ] Watch the context meter (Claude shows this!)
- [ ] Use /compact if getting full (with instructions!)

**After Finishing:**
- [ ] Use /clear if moving to new task
- [ ] Do small tweaks in Cursor, not Claude
- [ ] Keep Claude's context for BUILDING, not TWEAKING

---

## 🆘 EMERGENCY: RAN OUT OF CONTEXT

**If Claude starts forgetting things:**

1. **Stop immediately!**
2. Run: `/compact keep [list the important stuff]`
3. Continue working in fresh context
4. Or use: `/clear` and start over if context doesn't matter

**If you need to preserve EVERYTHING:**
- Ask Claude to write a summary file
- Save that file
- Run `/clear`
- Start fresh and reference the summary file

---

## 💡 FINAL TIPS

1. **Think of context like RAM on a computer** - Limited resource!
2. **Sub-agents are like having multiple computers** - Each with its own RAM!
3. **Specs are like blueprints** - Read once, build efficiently
4. **Clear = Restart** - Fresh context, fresh start
5. **Compact = Summarize** - Keep going with compressed memory

**The Goal:** Build MORE with LESS context waste!

---

**Source:** YouTube video transcript about Claude Code context management
**Created:** 2025-10-24
**For:** Kenneth
**By:** Cody (Quick Fix Agent)

---

**Remember: Efficient context usage = More features built = Happy Kenneth! 😊**
