# Lesson: A Template Is Only Trustworthy If Its Scripts Actually Run

## The Lesson

**Before copying a reference project, run every one of its npm scripts. A script that has never been executed is not a convention — it's a bug waiting to be cloned N times.**

## What Happened (Day 5)

`projects/todo-checklist/` was the reference for three new projects. Reading it, it looked complete: eight npm scripts, clean architecture, 55 tests. Actually running its scripts told a different story:

1. **`npm run lint` could never have worked.** The script is `eslint src --ext .ts,.tsx`, and ESLint 9 + `@typescript-eslint` 8 are in devDependencies — but **no `eslint.config.js` exists anywhere**. ESLint 9 requires a flat config and errors out without one. The `--ext` flag was also removed in flat config. This script has never once run successfully.
2. **`npm run test:e2e` could never have worked.** `playwright.config.ts` lives at `tests/e2e/playwright.config.ts`, but the script runs bare `playwright test` from the project root, where Playwright looks for the config in the cwd and finds nothing. Worse, the config's `testDir: './tests/e2e'` resolves *relative to the config file*, i.e. `tests/e2e/tests/e2e`. Two independent bugs in one script.
3. **`@testing-library/dom` was missing** from devDependencies. RTL v16 requires it as an explicit peer. It only worked by accident, via npm hoisting it up as a transitive dependency.
4. **`docs/architecture.md`'s dependency diagram was inverted** — it claimed Application depends on Infrastructure. The *code* has it right (`LocalStorageTodoRepository` imports the interface from `@/application`; application never imports infrastructure). The prose contradicted the code, and the prose is what a reader copies.
5. **React 18.3.1 was pinned** while `lessons/node-react-versions.md` marks "React 19+" as CRITICAL. The reference violated the repo's own documented lesson.

Had these been copied blindly, nine projects would each have shipped two broken scripts, a missing peer dep, and a wrong architecture diagram — and the diagram would have taught the wrong dependency rule to every future reader.

## Root Cause

The reference was **written and reviewed, but its tooling was never exercised**. `npm test` was run (that gate is in CLAUDE.md), so unit tests were genuinely green. `lint` and `test:e2e` are not part of that gate, so nobody ever ran them. Documentation drifted from code because nothing executes documentation.

## The Solution

### 1. `npm test` is not the whole quality gate
CLAUDE.md says "npm test must pass 100% before committing." In this repo `npm test` is `vitest run`, which explicitly **excludes** `tests/e2e/**`. Passing it says nothing about lint, build, or E2E. Run all of them:
```bash
npm run lint     # needs a config to mean anything
npm run build    # tsc && vite build — typecheck gates the build
npm test         # unit + integration only
npm run test:e2e # separate, and it is not optional
```

### 2. Exercise a template before cloning it
If you're about to replicate something N times, run it first. The cost of finding a bug is fixed; the cost of cloning it scales with N.

### 3. Prefer code over prose when they disagree
The code is executable and was tested; the diagram wasn't. When `docs/` and `src/` conflict, trust `src/` and fix `docs/`.

## How to Apply

When told to "follow the existing pattern":
- Read the reference, then **run** the reference.
- Distinguish *conventions worth copying* (layering, async ports, composition root, test structure — all genuinely good here) from *defects that happen to be present*. Copy the former, fix the latter, and say which is which.
- If the reference contradicts a documented lesson, the lesson wins — and flag the reference as needing a fix.

## Status

✅ Applied going forward — new projects ship a working `eslint.config.js`, a root-level `playwright.config.ts`, and an explicit `@testing-library/dom`.

⚠️ **Outstanding:** `projects/todo-checklist/` itself is still unfixed. It remains the most visible reference in the repo, so it still teaches all five defects above to anyone who reads it. Worth a dedicated cleanup PR.

## Related Files

- `projects/todo-checklist/package.json`, `.../tests/e2e/playwright.config.ts`, `.../docs/architecture.md`
- `lessons/node-react-versions.md` — the React 19 rule the reference violates
- [[parallel-agents-and-shared-ports]]
