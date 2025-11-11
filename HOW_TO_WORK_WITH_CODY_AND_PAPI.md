# HOW TO WORK WITH CODY & PAPI CLAUDE - SIMPLE RULES

**Quick Reference Guide for Kenneth**

---

## 🚨 GOLDEN RULES (SUPER IMPORTANT!)

### Rule #1: Tell Agents When You're Using Both
```
❌ DON'T: Start tasks with both agents without warning
✅ DO: Say "I'm using both agents right now, don't deploy without asking!"
```

### Rule #2: Never Let Agents Deploy Without Permission
```
❌ DON'T: Let them run "vercel --prod" on their own
✅ DO: Make them ask "Can I deploy this?" and wait for your YES
```

### Rule #3: One Agent = One Type of Task
```
CODY = Quick fixes, deployments, simple updates
PAPI CLAUDE = Big features, complex logic, multi-file changes
```

---

## 👨‍💻 WHEN TO USE CODY (Quick Fix Agent)

### Cody is BEST for:
- ✅ Quick bug fixes (1-3 files)
- ✅ Deploying to production (but ONLY with your permission!)
- ✅ Database queries and updates
- ✅ Simple UI tweaks (change colors, text, buttons)
- ✅ Running git commands (commit, push, status)
- ✅ Testing if something works
- ✅ Reading error logs

### Example Requests for Cody:
```
✅ "Change the button color to red"
✅ "Fix this error I'm getting"
✅ "Deploy the latest changes"
✅ "Check what's in the database for user X"
✅ "Update my name in the database"
✅ "Run git status and show me what changed"
```

### DON'T Ask Cody to:
```
❌ Build entire new features (use Papi Claude)
❌ Refactor large amounts of code
❌ Make complex architectural decisions
❌ Write new API endpoints from scratch
```

---

## 🧠 WHEN TO USE PAPI CLAUDE (Big Feature Agent)

### Papi Claude is BEST for:
- ✅ Building new features (multi-step, multi-file)
- ✅ Complex logic and algorithms
- ✅ Database schema changes
- ✅ Creating new API endpoints
- ✅ Refactoring code
- ✅ Planning architecture
- ✅ Searching through codebase for patterns
- ✅ Understanding how existing features work

### Example Requests for Papi Claude:
```
✅ "Build a call logging feature with these 5 screenshots"
✅ "Add role-based permissions to the inventory system"
✅ "Create an API endpoint for bulk importing trailers"
✅ "Refactor the CRM customer system to use a new status field"
✅ "Explain how the authentication system works"
✅ "Search the codebase and find where errors are handled"
```

### DON'T Ask Papi Claude to:
```
❌ Deploy to production (use Cody for this)
❌ Simple one-line fixes (use Cody)
❌ Quick database queries (use Cody)
```

---

## 🔄 WORKFLOW: USING BOTH AGENTS TOGETHER

### Step 1: Assign the Task
```
If BIG FEATURE → Tell Papi Claude
If QUICK FIX → Tell Cody
```

### Step 2: Let Them Know You're Using Both
```
Say: "I'm working with both agents, coordinate before deploying!"
```

### Step 3: Review Before Deploy
```
1. Papi Claude finishes feature → Creates files, writes code
2. You review Papi's work
3. Tell Cody: "Deploy Papi's changes" (or test locally first)
4. Cody commits + deploys ONLY when you say YES
```

### Step 4: Testing Workflow
```
1. Test on localhost FIRST (http://localhost:3000)
2. If it works → Tell Cody "Deploy this"
3. If it breaks → Tell Papi Claude "Fix this error"
4. Repeat until it works
```

---

## 📋 SIMPLE COMMUNICATION TEMPLATES

### Starting a Big Feature (Papi Claude)
```
"Papi Claude, I need you to build [FEATURE NAME].

Here's what I want:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

I'm also working with Cody, so don't deploy anything.
Just write the code and tell me when you're done."
```

### Starting a Quick Fix (Cody)
```
"Cody, quick fix:

Change [X] to [Y] in [FILE/PAGE].

Don't deploy yet, I'll tell you when."
```

### Asking for Deployment (Cody)
```
"Cody, everything looks good.

Deploy this to production now."
```

### When Both Agents Are Working
```
"Both agents: I'm using Cody AND Papi Claude right now.

Papi: Build the feature
Cody: Don't deploy anything until I say so

Understood?"
```

---

## 🚫 COMMON MISTAKES TO AVOID

### Mistake #1: Letting Cody Deploy While Papi Works
```
❌ WRONG:
Kenneth: "Cody, fix this button"
Cody: *fixes and deploys*
Papi: *still working on big feature*
Result: Papi's work conflicts with Cody's deployment!

✅ RIGHT:
Kenneth: "Cody, I'm using both agents - don't deploy!"
Cody: *fixes but waits*
Papi: *finishes feature*
Kenneth: "Cody, now deploy everything"
```

### Mistake #2: Asking Papi to Deploy
```
❌ WRONG:
Kenneth: "Papi, deploy this to production"
Papi: *doesn't have deployment tools, gets confused*

✅ RIGHT:
Kenneth: "Papi, you're done? Great!"
Kenneth: "Cody, deploy Papi's changes"
```

### Mistake #3: Asking Cody to Build Big Features
```
❌ WRONG:
Kenneth: "Cody, build me a complete CRM system with 10 features"
Cody: *tries, makes mistakes, incomplete*

✅ RIGHT:
Kenneth: "Papi Claude, build me a complete CRM system with 10 features"
Papi: *plans properly, builds correctly*
Kenneth: "Cody, deploy it when ready"
```

---

## 📝 CHECKLIST BEFORE DEPLOYING

Before you tell Cody to deploy, check:

- [ ] Did you test on localhost? (http://localhost:3000)
- [ ] Does it work as expected?
- [ ] Did Papi Claude finish all his tasks?
- [ ] Did you review the changes?
- [ ] Did you check for errors in the terminal?
- [ ] Are you ready for this to go live?

If ALL YES → Tell Cody: "Deploy to production"
If ANY NO → Don't deploy yet!

---

## 🎯 QUICK REFERENCE CHART

| Task Type | Who to Ask | Example |
|-----------|-----------|---------|
| Fix a bug | Cody | "Button not working, fix it" |
| Build new feature | Papi Claude | "Create user dashboard with 5 widgets" |
| Deploy changes | Cody | "Deploy to production" |
| Change database | Cody (simple) or Papi (complex) | Simple: "Update my name" / Complex: "Add new table" |
| Understand code | Papi Claude | "Explain how auth works" |
| Quick UI change | Cody | "Make button bigger" |
| Complex UI feature | Papi Claude | "Build drag-and-drop file uploader" |
| Git commands | Cody | "Commit these changes" |
| Search codebase | Papi Claude | "Find all API endpoints" |
| Read error logs | Cody | "What's this error mean?" |

---

## 💡 PRO TIPS

### Tip #1: Be Specific
```
❌ Vague: "Fix the dashboard"
✅ Specific: "Fix the inventory page 404 error at /en/dashboard/inventory"
```

### Tip #2: Give Context
```
❌ No context: "This doesn't work"
✅ With context: "When I click Upload, I get a 404. Here's the screenshot."
```

### Tip #3: Test Locally First
```
Always test on localhost before deploying:
http://localhost:3000

If it works locally → Deploy
If it breaks locally → Fix first
```

### Tip #4: One Task at a Time
```
❌ Multiple tasks: "Fix button, add feature, deploy, change color"
✅ One task: "Fix the upload button first"
Then: "Now add the feature"
Then: "Deploy when ready"
```

### Tip #5: Ask Questions
```
If you don't understand → Ask!
"What does this do?"
"Why did you do it this way?"
"Can you explain this simpler?"
```

---

## 🆘 WHEN THINGS GO WRONG

### If Cody Deploys Without Permission:
```
1. Don't panic
2. Check what was deployed: "Cody, what did you just deploy?"
3. Test production: https://mjsalesdash.com
4. If broken: "Cody, rollback to previous version"
```

### If Papi Claude Takes Too Long:
```
"Papi, give me a status update. What's done? What's left?"
```

### If Both Agents Conflict:
```
1. Stop both agents
2. Check git status: "Cody, run git status"
3. Restore if needed: "Cody, restore all changes"
4. Start over with clear instructions
```

### If You're Not Sure Who to Ask:
```
Default to this:
- Planning/Building → Papi Claude
- Executing/Deploying → Cody
```

---

## 📞 EMERGENCY COMMANDS

### Stop Everything
```
"Both agents: STOP. Don't do anything until I tell you."
```

### Undo All Changes
```
"Cody, run: git restore ."
```

### Check What Changed
```
"Cody, run: git status"
```

### Rollback Deployment
```
"Cody, rollback to the previous deployment"
```

---

## ✅ FINAL CHECKLIST FOR EVERY SESSION

**Before Starting:**
- [ ] Know which agent to use (Cody or Papi)
- [ ] Tell them if you're using both
- [ ] Be specific about what you want

**During Work:**
- [ ] Review their work as they go
- [ ] Ask questions if confused
- [ ] Test on localhost first

**Before Deploying:**
- [ ] Everything works on localhost?
- [ ] Reviewed all changes?
- [ ] Both agents finished?
- [ ] Ready to go live?

**After Deploying:**
- [ ] Test production: https://mjsalesdash.com
- [ ] Check for errors
- [ ] Verify everything works

---

**Remember: You're the boss! Make them wait for your approval before deploying!**

---

**Created:** 2025-10-24
**For:** Kenneth
**By:** Cody (Quick Fix Agent)

**Print this out or save it where you can see it!** 📌
