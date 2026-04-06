# Claude Session Start Prompt

## Context
This is your session initialization checklist. Follow these steps at the start of each session to ensure we're aligned on goals, progress, and learnings.

### Step 1: Daily Entry Check & Documentation
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

### Step 2: Review Lessons Learned
```
Check lessons/ directory for documented mistakes & solutions:
- Read lessons that apply to today's work
- Ask me: "Are there any lessons from previous sessions that apply here?"
- If I make a mistake, document it in lessons/{lesson_name}.md so it's never repeated
```

### Step 3: Project Setup (If Starting New Project)
```
When starting a project:
1. Ask clarifying questions if requirements aren't clear
2. Create /projects/{project_name}/ with this structure:
   - README.md (requirements, tech stack, deployment target)
   - /src (source code)
   - /tests (test files - REQUIRED from day one)
   - /docs (architecture docs, design decisions)
3. Verify tests are integrated from the start
4. Confirm Clean Architecture principles are being followed
```

### Step 4: Session Workflow
```
For each task:
1. Ask clarifying questions if needed
2. Mark task as in_progress
3. Write code in /projects or relevant directory
4. Include tests alongside code
5. Provide brief status updates
6. Mark task completed when done
7. Provide daily reflection with:
   - What went well
   - What could improve
   - Metrics (tests passed, features completed)
```

### Step 5: End of Session Summary
```
Before you leave:
1. Update today's DailyEntries/{Month}/{Day}.md with:
   - All work completed
   - Any lessons learned
   - Notes for next session
2. Commit changes to git with clear message
3. Provide a final reflection on the day's work
```

## Directory Reference

```
/DailyEntries/    - Daily progress documentation (YYYY/Month/DD.md)
/lessons/         - Mistakes + solutions (never repeat errors)
/projects/        - Active projects with tests and clean architecture
/prompts/         - Prompt templates and session guidance
```

## Key Principles for This Collaboration

1. **AI as Pair Programmer**: You review code, explain decisions, catch issues - not a solo code generator
2. **Tests First**: Every project includes tests from day one
3. **Documentation**: Clear requirements, architecture, decisions in code/docs
4. **Reflection**: Daily reflection on what worked, what didn't
5. **Learning Loop**: Mistakes → lessons/ → future prevention
6. **Clean Code**: Follow the principles from your books (Clean Architecture, DDD, etc.)
7. **Deployable**: Always thinking about fly.io deployment, Docker containerization

## Special Requests

- Ask clarifying questions when requirements are vague
- Provide cost warnings if we're approaching token budget
- Suggest improvements but respect your final decision on direction
- Always include test coverage metrics
- Flag architectural decisions that need your approval

---

**Last Updated**: 2026-04-06  
**Next Review**: When session structure needs adjustment
