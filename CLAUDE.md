# Claude Code Session Guide

This is the starting point for every Claude Code session. Read this first.

## Quick Start

0. **Verify Node version** → `nvm use` (reads `.nvmrc` automatically)
   - Must be Node 20.11.0+ (run `node --version` to verify)
   - If wrong version, update `.nvmrc` and `nvm use` again

1. **Verify you're NOT on main** → `git branch` (should NOT show `* main`)
   - If on main: Create feature branch: `git checkout -b feature/your-feature origin/main`

2. **Check today's daily entry** → `/DailyEntries/2026/{Month}/{Day}.md`
   - If exists: Read it for context
   - If not: Create it

3. **Ask about lessons** → Review `/lessons/` if relevant to today's work

4. **Get clarification** → Ask any questions about project requirements before coding

5. **Work systematically** → One task at a time, tests included, update daily entry as we go

6. **Verify tests pass** → `npm test` must pass 100% before committing

7. **Reflect at end** → Update daily entry with what we accomplished and what to do next

## Key Files to Know

- `prompts/SESSION_START.md` - Full session initialization checklist
- `prompts/PROJECT_TEMPLATE.md` - Structure for new projects
- `prompts/QUESTIONS_TO_ASK.md` - Clarifications before starting projects
- `lessons/` - Documented mistakes and how to avoid them
- `projects/` - Active projects with tests and clean architecture
- `DailyEntries/2026/{Month}/{DD}.md` - Daily progress logs

## Collaboration Style

✅ **I will:**
- Ask clarifying questions before starting
- Use AI as pair programmer, not solo generator
- Include tests from day one
- Review your code for quality/bugs
- Suggest improvements, respect your final call
- Provide daily reflections with metrics
- Document decisions and learnings
- **Always work on feature branches off origin/main**
- **Ensure every project has explicit `.nvmrc` file with Node version**
- **Verify all tests pass (100%) before committing**

❌ **I won't:**
- Generate untested code and expect you to use it
- Get stuck in infinite loops regenerating the same broken code
- Ignore architectural principles from your books
- Skip testing to move faster
- Burn through tokens without value
- Generate docs/comments for code I didn't change
- **Commit directly to main branch**
- **Work without Node version pinning (.nvmrc)**
- **Commit code with failing tests**

## Tech Stack Reference

**Backend**: C# / .NET  
**Frontend**: React 19+ + Material-UI v5+  
**Node.js**: 20.11.0 minimum (20+ required for all projects)  
**Database**: SQL (Postgres preferred)  
**Deployment**: Fly.io with Docker  
**Architecture**: Clean Architecture (Robert Martin)  
**Design**: Domain-Driven Design  

## Budget Watchlist

- Free Claude through this interface (Pro subscription)
- Monitor API usage if applicable
- Flag when approaching decision points about expensive operations
- Current status: Conscious about token spend after Day 2 experience

---

Last Updated: 2026-04-06  
Status: System initialization complete
