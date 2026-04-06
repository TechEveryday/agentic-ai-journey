# Lesson: Don't Use AI as Standalone Code Generator

## The Mistake
- Attempted to have Claude generate a calculator app from scratch
- App had logic errors (addition treated as string concatenation)
- Orchestrator repeatedly hit max iterations with same falsey solution
- Spent $5+ in tokens on unsuccessful attempts

## Root Cause
- Treating AI as a complete code generator rather than a coding partner
- Not iterating with manual fixes when AI gets stuck
- Expecting first-generation code to be production-ready

## The Solution
**Use AI as a pair programming buddy, not a solo developer**

When working with AI:
1. **Start with scaffolding**: Outline structure first, let AI fill in details
2. **Test incrementally**: Write tests as you go, catch errors early
3. **Manual intervention**: When AI gets stuck, fix it manually and continue
4. **Review before using**: Check generated code for logic errors
5. **Iterate on feedback**: Use test failures as feedback for improvements

## How to Apply
- When AI generates code with bugs: fix manually, don't ask AI to regenerate the whole thing
- When orchestrator loops: stop, analyze the actual error, fix the root cause
- Pair programming workflow: you guide the high-level design, AI handles boilerplate
- Set expectations: AI is 70% solution, you're the final 30% + quality gate

## Status
✅ Applied going forward - using Claude as review partner, not sole generator
