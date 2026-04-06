# Claude Code Session Guide

This is the starting point for every Claude Code session. Read this first.

## Quick Start

1. **Check today's daily entry** → `/DailyEntries/2026/{Month}/{Day}.md`
   - If exists: Read it for context
   - If not: Create it

2. **Ask about lessons** → Review `/lessons/` if relevant to today's work

3. **Get clarification** → Ask any questions about project requirements before coding

4. **Work systematically** → One task at a time, tests included, update daily entry as we go

5. **Reflect at end** → Update daily entry with what we accomplished and what to do next

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

❌ **I won't:**
- Generate untested code and expect you to use it
- Get stuck in infinite loops regenerating the same broken code
- Ignore architectural principles from your books
- Skip testing to move faster
- Burn through tokens without value
- Generate docs/comments for code I didn't change

## Tech Stack Reference

**Backend**: C# / .NET  
**Frontend**: React + Material-UI  
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
