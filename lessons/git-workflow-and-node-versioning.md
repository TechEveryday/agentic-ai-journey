# Lesson: Git Workflow and Node.js Versioning

## The Lesson

**Never work directly on main. Always use feature branches. Always pin Node.js version with .nvmrc.**

## What Happened (Day 4)

Initial todo-checklist work was committed directly to main. This violated best practices:
- No isolation between work and release branch
- Harder to manage PRs and code review
- No version pinning caused test failures on old Node (16.15.1) when dependencies required 18+

## The Rules

### 1. **Git Branching (CRITICAL)**
- **NEVER commit to main directly**
- Always create a feature branch: `git checkout -b feature/description origin/main`
- Work on the feature branch
- Create a PR to merge back to main
- Delete the branch after merge

**Why:** 
- Keeps main stable and deployable
- Enables code review via PRs
- Maintains clean commit history
- Allows multiple features in parallel

### 2. **Node Version Pinning (CRITICAL)**
- **ALWAYS add `.nvmrc` files at repo root and each project**
- Pin to a stable, supported version (currently 20.11.0)
- Before starting work: `nvm use` (reads .nvmrc automatically)

**Why:**
- Dependencies may require specific Node versions
- Tests fail silently with wrong Node version
- Prevents "works on my machine" problems
- Team stays synchronized

## How to Apply

### For Every New Session
```bash
# 1. Enter repo directory
cd /Users/aphil/repos/agentic-ai-journey

# 2. Use correct Node version (reads .nvmrc)
nvm use

# 3. Check you're not on main
git branch  # Should NOT show * main

# 4. If on main, create feature branch
git checkout -b feature/your-feature origin/main

# 5. Do work on feature branch
# ... make changes ...

# 6. Run all tests before committing
npm test  # Must pass 100%

# 7. Commit with meaningful message
git commit -m "your message"

# 8. Create PR (don't push to main)
git push origin feature/your-feature
# Then use GitHub UI to create PR
```

### For Every New Project
```bash
# Create .nvmrc in project root
echo "20.11.0" > projects/project-name/.nvmrc

# Verify nvm uses it
cd projects/project-name
nvm use  # Should say "Now using node v20.11.0"
```

## Status

✅ Applied going forward - feature branches and .nvmrc files required for all work

## Related Files

- `CLAUDE.md` - Updated with Git workflow instructions
- `prompts/SESSION_START.md` - Updated to include branching steps
- `.nvmrc` - Added at repo root
- `projects/todo-checklist/.nvmrc` - Added at project root
