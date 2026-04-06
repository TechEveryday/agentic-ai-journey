# Lesson: Node 20+ and React 19+ Minimum Versions

## The Lesson

**Always use Node 20+ and React 19+ for all new projects and work.**

## Why These Versions

### Node 20+
- **crypto module stability**: Node <18 lacks proper Web Crypto API support (crypto.getRandomValues failures)
- **ES2024 features**: Modern language features in dependencies
- **Security**: Older versions have known vulnerabilities
- **Long-term support**: Node 20 is LTS through April 2026, aligns with project timeline
- **Dependency compatibility**: Most modern packages require Node 18+ minimum; using 20 ensures compatibility

### React 19+
- **Latest features**: Compiler improvements, better performance optimizations
- **Long-term support**: Will be recommended for new projects through 2026+
- **TypeScript support**: Improved type definitions and developer experience
- **Material-UI v5 compatibility**: Works seamlessly with current UI stack

## The Rules

### 1. **Node Version (CRITICAL)**
- **ALWAYS pin `.nvmrc` to 20.11.0 or newer**
- Before starting any project: `nvm use` (reads .nvmrc automatically)
- If .nvmrc doesn't exist, create it: `echo "20.11.0" > .nvmrc`
- Verify with: `node --version` should show v20.11.0 or newer

**Why:**
- Prevents "works on my machine" problems with older Node versions
- Avoids runtime failures when dependencies assume Node 18+ features
- Keeps crypto, async, and ES2024 features consistent across team

### 2. **React Version (CRITICAL)**
- **ALWAYS use React 19+ when scaffolding new projects**
- Update package.json: `"react": "^19.0.0"`
- Verify with: `npm list react` should show React 19.x or newer

**Why:**
- Future-proofs the application
- Ensures access to latest React features and bug fixes
- Maintains consistency across all projects in this codebase

## How to Apply

### For Every New Project
```bash
# 1. Create .nvmrc in project root (or repo root)
echo "20.11.0" > projects/project-name/.nvmrc

# 2. Use correct Node version
cd projects/project-name
nvm use  # Should say "Now using node v20.11.0"

# 3. Verify Node version
node --version  # Should be v20.11.0 or newer

# 4. When installing React, use 19+
npm install react@19 react-dom@19

# 5. Verify React version
npm list react  # Should show 19.x.x
```

### For Every Session Start
```bash
# 1. Before any work, verify Node version
nvm use  # Uses .nvmrc file
node --version  # Confirm it's 20.11.0+

# 2. Check project's package.json
npm list react  # Confirm React 19+

# 3. If versions are wrong, fix them
# Update .nvmrc, then: nvm use
# Update package.json, then: npm install
```

## Status

✅ Applied going forward - All new projects require Node 20.11.0+ and React 19+

## Related Files

- `CLAUDE.md` - Updated with Node/React version requirements in Tech Stack Reference
- `prompts/SESSION_START.md` - Added version check as part of Step 0 Git/Node verification
- `.nvmrc` - Root and project-level files pinned to 20.11.0
