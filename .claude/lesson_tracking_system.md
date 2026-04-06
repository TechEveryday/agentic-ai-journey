---
name: Lesson Tracking and Prevention System
description: How to document mistakes and solutions to prevent repeating them
type: feedback
---

## The System
Keep a `/lessons/` directory of documented mistakes and their solutions.

**File naming**: `{lesson_name}.md`
- Example: `ai-as-solo-generator.md`

**File structure**:
```markdown
# Lesson: {Title}

## The Mistake
- What went wrong
- Impact/cost

## Root Cause
- Why it happened

## The Solution
- How to fix it going forward
- Step-by-step approach

## How to Apply
- When this rule kicks in
- What to do differently next time

## Status
- ✅ Applied
- 🔄 In progress
- ⏳ Discovered but not yet applied
```

**When to Create a Lesson**:
- After spending excessive tokens on unsuccessful approach (Day 2: $5 wasted on bad calculator generation)
- After discovering a pattern that needs correction
- After making the same mistake twice

**When to Review Lessons**:
- At start of each session ("any lessons that apply?")
- Before starting new project of similar type
- When stuck on a problem

**Why**: Builds institutional knowledge, prevents "lessons forgotten" cycles, creates a playbook of what works.
