# Service Creator

**Path:** `projects/service-creator/` · **Branch:** `feature/service-creator` · **Stack:** Node CLI (TypeScript)

Generates a new clean-architecture .NET backend service from a template — a `dotnet new` for your conventions.

## Sequencing — build this AFTER two-way-chat

`projects/two-way-chat/backend/` is the first real .NET service in this repo. Its structure (Domain / Application / Infrastructure / Api + xUnit, targeting net10.0) is what this tool should emit. Building the generator first means inventing a template with nothing to validate it against; building it second means **extracting** a template that's already proven to compile and test green.

The acceptance test writes itself: generate a service, then `dotnet build` and `dotnet test` it.

## Not a React app

The standard `projects/` template does **not** apply here — no Vite, no MUI, no Playwright. This is a Node CLI. Clean architecture still applies.

```
projects/service-creator/
├── src/
│   ├── core/            # pure: template model, token substitution, name validation
│   ├── application/     # IFileWriter port, ITemplateSource port, GenerateService use case
│   ├── infrastructure/  # FsFileWriter, DiskTemplateSource
│   └── cli/             # arg parsing, the composition root
├── templates/
│   └── dotnet-clean-service/   # extracted from two-way-chat's backend
└── tests/{unit,integration}/
```

## Core (pure)

```ts
interface TemplateFile { relativePath: string; contents: string; }
interface ServiceSpec { name: string; targetFramework: string; }   // e.g. "Billing", "net10.0"

function validateServiceName(name: string): ValidationResult
  // PascalCase, no spaces/hyphens, not a C# reserved word, not a leading digit — it becomes a namespace
function substitute(contents: string, spec: ServiceSpec): string
  // replaces {{ServiceName}} / {{TargetFramework}}
function renderPath(relativePath: string, spec: ServiceSpec): string
  // "{{ServiceName}}.Domain/Entity.cs" → "Billing.Domain/Entity.cs"
function planFiles(template: TemplateFile[], spec: ServiceSpec): TemplateFile[]
```

Path substitution is the easy thing to forget — directory names carry the service name too, not just file contents.

## Application

```ts
interface IFileWriter {
  exists(path: string): Promise<boolean>;
  write(path: string, contents: string): Promise<void>;
}
interface ITemplateSource { load(templateId: string): Promise<TemplateFile[]>; }
```
`generateService(spec, source, writer)` — loads, plans, **checks for collisions before writing anything** (never half-write a service), then writes.

## Infrastructure

`FsFileWriter` (real fs), `DiskTemplateSource` (reads `templates/`). Tests use an `InMemoryFileWriter` — this is the whole reason `IFileWriter` exists: **unit tests must not touch the real filesystem**.

## CLI

`service-creator new <ServiceName> [--output ./path] [--framework net10.0]`. The composition root wires `DiskTemplateSource` + `FsFileWriter`. Use `node:util`'s `parseArgs` — no need for a dependency.

## Tests

- **Unit:** `validateServiceName` (valid PascalCase, reserved words like `class`/`int`, leading digit, hyphens, empty), `substitute` (all tokens, repeated tokens, unknown tokens left alone), `renderPath`, `planFiles`.
- **Integration:** `generateService` against `InMemoryFileWriter` — correct file set, correct paths, collision aborts **before any write** (assert nothing was written).
- **Acceptance (the one that matters):** generate into a temp dir, then run `dotnet build` and `dotnet test` on the output and assert both succeed. Without this, the tool can emit plausible-looking code that doesn't compile.

## MVP vs deferred

**MVP:** one template (`dotnet-clean-service`), name validation, generation, collision check, the acceptance test.
**Deferred:** multiple templates, interactive prompts, `--dry-run`, EF Core/Postgres variant, git init, solution-file wiring.
