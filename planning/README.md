# Planning

Design plans for projects that are scoped but not yet built. Each file is self-contained: read it and you can start.

When a project gets built, its plan moves into the project's own `docs/` and the entry here is removed.

## Deferred projects

| Project | Stack | Status |
|---|---|---|
| [Instagram Clone](instagram-clone.md) | Frontend-only, localStorage | Ready to build |
| [Social Media App](social-media-app.md) | TBD | **Blocked — needs a differentiator** |
| [Sports Team Manager](sports-team-manager.md) | Frontend-only, localStorage | Ready to build |
| [Service Creator](service-creator.md) | Node CLI | Sequenced after two-way-chat |
| [Website Templates](website-templates.md) | Frontend-only gallery | Ready to build |
| [Roblox Game](roblox-game.md) | Luau | **Blocked — no Lua runtime, no game concept** |

## Shared conventions

All React projects follow the template established by `projects/contacts/` (React 19 + MUI 5 + TS + Vite, clean architecture, Vitest + Playwright). See `prompts/PROJECT_TEMPLATE.md` for the prescribed structure and `lessons/` for the hard rules (`.nvmrc` pinned to 20.11.0, feature branches only, 100% tests before commit).
