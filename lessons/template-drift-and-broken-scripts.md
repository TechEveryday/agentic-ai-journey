# Lesson: A Template Is Only Trustworthy If Its Scripts Actually Run

## The Lesson

**Before copying a reference project, run every one of its npm scripts. A script that has never been executed is not a convention — it's a bug waiting to be cloned N times.**

## What Happened (Day 5)

`projects/todo-checklist/` was the reference for three new projects. Reading it, it looked complete: eight npm scripts, clean architecture, 55 tests. Actually running its scripts told a different story — **three of them had never worked**:

1. **`npm run lint` could never have worked.** The script is `eslint src --ext .ts,.tsx`, and ESLint 9 + `@typescript-eslint` 8 are in devDependencies — but **no `eslint.config.js` exists anywhere**. ESLint 9 requires a flat config and errors out without one. The `--ext` flag was also removed in flat config.
2. **`npm run build` could never have worked.** `build` is `tsc && vite build`, and `tsconfig.json` includes `tests`. `tsc` failed on unused imports (`noUnusedLocals`), a `Promise<unknown>` vs `Promise<void>` mock type, and a stale `playwright.config.d.ts` reference. Type errors had been accumulating in tests with nothing to catch them.
3. **`npm run test:e2e` could never have worked.** `playwright.config.ts` lived at `tests/e2e/playwright.config.ts` while the script runs bare `playwright test` from the project root. Playwright never found the config — and rather than erroring, it **fell back to defaults**: `testDir` = cwd, and a default `testMatch` that catches `*.test.ts` as well as `*.spec.ts`. So it tried to run the Vitest suites as Playwright tests and died on `Cannot redefine property: Symbol($$jest-matchers-object)`. (Had it found the config, `testDir: './tests/e2e'` resolves *relative to the config file* — `tests/e2e/tests/e2e`. Two independent bugs.)
4. **`@testing-library/dom` was missing** from devDependencies. RTL v16 requires it as an explicit peer. It only worked by accident, via npm hoisting it up as a transitive dependency.
5. **`docs/architecture.md`'s dependency diagram was inverted** — it claimed Application depends on Infrastructure. The *code* has it right (`LocalStorageTodoRepository` imports the interface from `@/application`; application never imports infrastructure). The prose contradicted the code, and the prose is what a reader copies.
6. **React 18.3.1 was pinned** while `lessons/node-react-versions.md` marks "React 19+" as CRITICAL. The reference violated the repo's own documented lesson.

### What fixing the scripts revealed

Making `test:e2e` runnable was the interesting part: **all 13 E2E tests failed on their first-ever execution.** The suite had been committed, reviewed, and counted as done without once being run.

- Every `beforeEach` called `page.evaluate(() => localStorage.clear())` **before** `page.goto('/')`. localStorage is origin-scoped; touching it on the initial `about:blank` page throws `SecurityError`. Every test, every file.
- `delete-todo.spec.ts` called `page.getByDisplayValue(...)` — a **Testing Library API that does not exist in Playwright**.
- Tests located buttons via `getByRole('button', { name: /delete/i })`, but the MUI `IconButton`s had **no accessible name at all**, so the locators matched nothing. The tests were written against buttons that were never findable — and that gap was a real accessibility defect, not just a test problem.

Three unrunnable scripts hid a completely non-functional E2E suite and an a11y bug. `npm test` stayed green throughout.

Had this been copied blindly, nine projects would each have inherited three broken scripts, a missing peer dep, a wrong architecture diagram, and an E2E suite that couldn't run.

## Root Cause

The reference was **written and reviewed, but its tooling was never exercised**. `npm test` was run — that gate is in CLAUDE.md — so unit tests were genuinely green. `lint`, `build`, and `test:e2e` are not part of that gate, so nobody ever ran them, and nothing else would ever have caught it.

The deeper issue: **a green `npm test` was read as "the project works."** It only ever meant "the unit tests pass." Everything outside that one command was unverified, and stayed unverified for three months. Documentation drifted from code for the same reason — nothing executes documentation.

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

✅ **`projects/todo-checklist/` is fixed** (branch `feature/fix-todo-checklist`). All six defects addressed; it now passes lint, build, 55/55 unit+integration, and **13/13 E2E — green for the first time**. It's safe to use as a reference again.

## Related Files

- `projects/todo-checklist/package.json`, `.../tests/e2e/playwright.config.ts`, `.../docs/architecture.md`
- `lessons/node-react-versions.md` — the React 19 rule the reference violates
- [[parallel-agents-and-shared-ports]]
