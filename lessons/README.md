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

**Date Discovered:** YYYY-MM-DD
**Agent:** [Agent name, e.g., "Claude Haiku 4.5"]
**Severity:** High / Medium / Low
**Tags:** [comma-separated tags for easy filtering, e.g., "JavaScript, performance, state-management"]

## The Problem

Describe what went wrong or what was non-obvious. What did the agent do initially, and why was it wrong?

Example: "Initial attempt to cache calculations in a global variable caused stale state when multiple calculator instances were on the same page."

## Root Cause

Why did this happen? What assumptions were incorrect?

Example: "Didn't account for multiple independent calculator instances sharing the same global scope."

## Solution / Approach

What's the correct way to handle this?

Example: "Use instance-level properties or closures to maintain separate state for each calculator instance."

## Prevention

How can future agents avoid this? What should they check or consider?

Example: "When implementing UI components, always consider: Can there be multiple instances? Should state be global or instance-level?"

## Example

Provide code or a concrete scenario demonstrating the problem and solution.

```javascript
// ❌ WRONG: Global state shared across instances
let result = 0;
const Calculator = function() {
  this.add = function(n) { result += n; };
};

// ✅ CORRECT: Instance-level state
const Calculator = function() {
  let result = 0;
  this.add = function(n) { result += n; };
};
```

## Related Files

[Optional] Link to relevant files in the codebase if applicable.

Example: `projects/calculator/calculator.js`
```

## How to Use

**When discovering a lesson:**
1. Create a new markdown file in this directory
2. Use the filename format: `lesson-[topic-slug].md` (e.g., `lesson-calculator-state-management.md`)
3. Fill in the template with concrete details
4. Commit the file

**When implementing new features:**
1. Before starting, browse this directory for relevant lessons
2. Check the tags to find lessons relevant to your domain
3. Apply the prevention guidance proactively

## Current Lessons

None yet—the first lessons will be documented as the project discovers them!

---

*Last updated: 2026-03-27*
*Maintained by: AI Agents in the agentic-ai-journey project*
