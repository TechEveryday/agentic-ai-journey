# Lessons Directory

This directory contains documented lessons learned by AI agents during the agentic-ai-journey project. Unlike daily entries (which capture reflections and progress), lessons capture non-obvious insights and mistakes to help **future agents avoid repeating the same errors**.

## Purpose

As agents work on various tasks, they may encounter:
- Unexpected behaviors or edge cases
- Architectural decisions with trade-offs
- Integration challenges between tools or libraries
- Performance or security considerations that aren't obvious at first
- Common pitfalls in specific patterns or frameworks

This directory ensures those hard-won insights don't get lost—they're documented for future agents to reference and learn from.

## Structure

Each lesson is a markdown file in this directory. Lessons follow a consistent format (see template below) to ensure they're actionable and easy to search.

## Lesson Template

When documenting a new lesson, use this format:

```markdown
# Lesson: [Clear, descriptive title]

## The Lesson

The rule, in one or two sentences. A future agent should be able to read
only this section and act correctly.

## What Happened (Day N)

The concrete story. What was done, what broke, what it cost. Be specific —
"a foreign app was serving on port 5173" teaches; "there was a conflict"
doesn't.

## Root Cause

Which assumption was wrong. Not the symptom — the reason the symptom was
possible.

## The Solution

The correct approach, with code or commands where they help.

## How to Apply

What a future agent should actually do differently, and when. Include the
generalizable version, not just this instance.

## Status

✅ Applied going forward — [what changed as a result]
⚠️ Outstanding — [anything still unfixed, stated honestly]

## Related Files

Paths that show the problem or the fix. Link related lessons with [[slug]].
```

## How to Use

**When discovering a lesson:**
1. Create a new markdown file in this directory
2. Use a descriptive kebab-case filename (e.g., `parallel-agents-and-shared-ports.md`)
3. Fill in the template with concrete details
4. Commit the file

**When implementing new features:**
1. Before starting, browse this directory for relevant lessons
2. Check the tags to find lessons relevant to your domain
3. Apply the prevention guidance proactively

## Current Lessons

| Lesson | The rule, in short |
|---|---|
| [ai-as-solo-generator](ai-as-solo-generator.md) | AI is a pair programmer, not a solo developer. Scaffold, test incrementally, and step in when it loops. |
| [git-workflow-and-node-versioning](git-workflow-and-node-versioning.md) | **CRITICAL.** Never commit to main. Always pin Node with `.nvmrc`. |
| [node-react-versions](node-react-versions.md) | **CRITICAL.** Node 20.11.0+, React 19+ for every new project. |
| [parallel-agents-and-shared-ports](parallel-agents-and-shared-ports.md) | Worktrees isolate files, not ports. Parallel agents can E2E against the wrong app. |
| [template-drift-and-broken-scripts](template-drift-and-broken-scripts.md) | Run a reference's scripts before cloning it. `npm test` is not the whole gate. |

---

*Last updated: 2026-07-14*
*Maintained by: AI Agents in the agentic-ai-journey project*
