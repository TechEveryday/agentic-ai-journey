# Website Templates

**Path:** `projects/website-templates/` · **Branch:** `feature/website-templates` · **Stack:** Frontend-only

A starter gallery of reusable landing pages and site templates to copy into new projects. Lowest-risk project in the slate — good candidate whenever a spare build slot exists.

## Shape

This is a **gallery app** whose content is a set of static template files. The app indexes them, previews them, and hands you the source.

```
projects/website-templates/
├── src/                  # the gallery app (standard React 19 template)
└── templates/            # the actual templates — static assets
    ├── landing-hero/     { index.html, styles.css, preview.png, template.json }
    ├── saas-pricing/
    ├── portfolio/
    └── docs-site/
```

Each template ships a `template.json` manifest: `{ id, name, description, tags[], thumbnail, entry }`.

## Core (`src/core/`, pure)

```ts
interface Template { id: string; name: string; description: string;
  tags: string[]; thumbnail: string; entry: string; }

function validateManifest(raw: unknown): ValidationResult   // guards hand-written JSON
function filterByTags(ts: Template[], tags: string[]): Template[]   // AND semantics
function searchTemplates(ts: Template[], query: string): Template[] // name + description + tags
function allTags(ts: Template[]): string[]                  // deduped, sorted
```

`validateManifest` matters more than it looks: manifests are hand-written, so a typo should surface as a clear error, not a blank card.

## Application

`ITemplateRepository` — `getAll(): Promise<Template[]>`, `getSource(id): Promise<string>`. Async as always.
`useTemplates(repo)` → `{ templates, isLoading, error }`. Filtering/search derived in the page via the pure core functions.

## Infrastructure

`StaticTemplateRepository` — loads manifests via Vite's `import.meta.glob('/templates/*/template.json')`. `getSource` fetches the entry file as raw text (`?raw`). No localStorage; this data is read-only.

## Presentation

`GalleryPage` (composition root), `TemplateGrid`, `TemplateCard` (thumbnail + name + tags), `TagFilter`, `SearchBar`, `PreviewDialog` (renders the template in a sandboxed `<iframe>`), `CopySourceButton` (clipboard).

**Note:** sandbox the preview iframe (`sandbox="allow-same-origin"`, no `allow-scripts`) — templates are local and trusted, but the habit is cheap and correct.

## Tests

- **Unit:** `validateManifest` (missing fields, wrong types, valid), `filterByTags` (AND semantics, empty = all), `searchTemplates` (case-insensitive, each field), `allTags` (dedupe + sort).
- **Integration:** grid renders, tag filter narrows, search narrows, preview opens, copy invokes the clipboard (mock it).
- **E2E:** `browse-templates.spec.ts`, `filter-by-tag.spec.ts`, `preview-template.spec.ts`.

## MVP vs deferred

**MVP:** 3–4 templates, gallery grid, tag filter, search, iframe preview, copy source.
**Deferred:** live template editing, scaffolding straight into `projects/`, template versioning, remote template registry.
