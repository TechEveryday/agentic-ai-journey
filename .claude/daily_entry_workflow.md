---
name: Daily Entry Documentation Workflow
description: How to check and update daily entry files at session start and end
type: feedback
---

## The Pattern
Each session starts and ends with a daily entry file.

**Structure**: `/DailyEntries/2026/{Month}/{Day}.md`
- Example: `/DailyEntries/2026/April/06.md`

**At Session Start:**
1. Check if today's entry exists
2. If yes: read it to understand context/goals from yesterday
3. If no: create it with blank template
4. Set session goal at top

**At Session End:**
1. Update Work Completed section
2. Add any lessons learned
3. Add reflection on how it went
4. Add next session notes
5. Commit to git

**Why:** Creates a continuous narrative of progress, prevents context loss between sessions, helps track long-term patterns.
