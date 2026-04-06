# Claude Session Start Prompt

## Context
This is your session initialization checklist. Follow these steps at the start of each session to ensure we're aligned on goals, progress, and learnings.

### Step 0: Git Workflow & Node Version (CRITICAL - DO THIS FIRST)
```
1. Ensure Node.js is correctly pinned:
   nvm use  # Reads .nvmrc automatically from repo root

2. Verify you're NOT on main branch:
   git branch  # Should NOT show * main

3. If you're on main, create a feature branch:
   git checkout -b feature/your-feature origin/main

4. Fetch latest from origin:
   git fetch origin

RULE: Never commit to main directly. Always work on feature branches.
RULE: Every project must have .nvmrc with explicit Node version.
```

### Step 1: Review Lessons Learned
```
Check lessons/ directory for documented mistakes & solutions:
- Read lessons that apply to today's work
- Ask me: "Are there any lessons from previous sessions that apply here?"
- If I make a mistake, document it in lessons/{lesson_name}.md so it's never repeated

CRITICAL LESSONS TO REVIEW:
- git-workflow-and-node-versioning.md (never work on main, always pin Node)
- ai-as-solo-generator.md (use AI as pair programmer)
```

### Step 2: Daily Entry Check & Documentation
```
1. Check today's date
2. Look in DailyEntries/2026/{Month}/{Day}.md
   - If the file exists: Read it for context on where we left off
   - If NOT exists: Create it with this template:
     # Day X - {Brief Title}
     
     ## Session Goal
     [What are we trying to accomplish?]
     
     ## Work Completed
     [List what we accomplish as we work]
     
     ## Lessons Applied
     [Which lessons from /lessons are we applying?]
     
     ## Reflection
     [How did it go? What surprised us?]
     
     ## Next Session Notes
     [What should we pick up on next time?]
3. At end of session: Update the daily entry with completed work
```

### Step 3: Ask About Lessons & Context
```
Before starting work:
- Are there any lessons from previous sessions that apply to today's work?
- Review /lessons/ for relevant mistakes to avoid
- Ask clarifying questions about requirements
```

### Step 4: Project Setup (If Starting New Project)
```
When starting a project:
1. Ask clarifying questions if requirements aren't clear
2. Create /projects/{project_name}/ with this structure:
   - .nvmrc (Node version pin - REQUIRED)
   - README.md (requirements, tech stack, deployment target)
   - /src (source code)
   - /tests (test files - REQUIRED from day one)
   - /docs (architecture docs, design decisions)
3. Verify tests are integrated from the start
4. Confirm Clean Architecture principles are being followed
5. Every commit must have passing tests (npm test: 100%)
```

### Step 5: Session Workflow
```
For each task:
1. Ask clarifying questions if needed
2. Mark task as in_progress
3. Write code in /projects or relevant directory
4. Include tests alongside code
5. Run npm test - must pass 100% before committing
6. Provide brief status updates
7. Mark task completed when done
8. Provide reflection with:
   - What went well
   - What could improve
   - Test results and metrics
```

### Step 6: End of Session Summary
```
Before you leave:
1. Run all tests one final time - must pass 100%
2. Update today's DailyEntries/{Month}/{Day}.md with:
   - All work completed
   - Any lessons learned or documented
   - Notes for next session
3. Commit changes to feature branch (never main):
   git add -A && git commit -m "your message"
4. Provide a final reflection on the day's work
```

## Directory Reference

```
/DailyEntries/    - Daily progress documentation (YYYY/Month/DD.md)
/lessons/         - Mistakes + solutions (never repeat errors)
/projects/        - Active projects with tests and clean architecture
/prompts/         - Prompt templates and session guidance
```

## Key Principles for This Collaboration

1. **Git Workflow**: Always use feature branches, never commit to main
2. **Node Version**: Every project must have .nvmrc pinned to Node 20.11.0+
3. **AI as Pair Programmer**: You review code, explain decisions, catch issues - not a solo code generator
4. **Tests First**: Every project includes tests from day one; 100% tests must pass before commit
5. **Documentation**: Clear requirements, architecture, decisions in code/docs
6. **Reflection**: Daily reflection on what worked, what didn't
7. **Learning Loop**: Mistakes → lessons/ → future prevention
8. **Clean Code**: Follow the principles from your books (Clean Architecture, DDD, etc.)
9. **Deployable**: Always thinking about fly.io deployment, Docker containerization

## Special Requests

- Ask clarifying questions when requirements are vague
- Provide cost warnings if we're approaching token budget
- Suggest improvements but respect your final decision on direction
- Always include test coverage metrics
- Flag architectural decisions that need your approval
- Verify feature branch usage before starting work
- Verify .nvmrc exists and tests pass before committing

---

**Last Updated**: 2026-04-06  
**Next Review**: When session structure needs adjustment
