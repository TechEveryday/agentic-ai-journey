# Project Template

Use this as a starting point when creating new projects in /projects/{project_name}/

## Project Directory Structure

```
projects/{project_name}/
├── README.md                 # Project overview, requirements, tech stack
├── .nvmrc                    # Node.js version pin (REQUIRED)
├── src/                      # Source code
│   ├── core/                # Business logic (domain layer)
│   ├── application/         # Application services
│   ├── infrastructure/       # External dependencies, databases, APIs
│   └── presentation/        # API endpoints, UI controllers
├── tests/                    # Test suite
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── docs/                    # Architecture & design docs
├── .env.example             # Environment variables template
├── docker-compose.yml       # Local development
├── Dockerfile               # Production deployment
└── [language-specific files]  # package.json, .csproj, etc.
```

## README.md Template

```markdown
# {Project Name}

## Overview
[1-2 sentence description of what this project does]

## Tech Stack
- Backend: {Language/Framework}
- Frontend: {Framework/Library}
- Database: {Type/Name}
- Deployment: Fly.io

## Requirements
[List functional requirements from tickets/specs]

## Architecture
[Brief explanation of Clean Architecture approach]

## Setup
[How to get local environment running]

## Testing
[How to run tests, coverage requirements]

## Deployment
[How to deploy to Fly.io]
```

## Test Coverage Expectations

- **Unit Tests**: >80% coverage on business logic
- **Integration Tests**: All service-to-service interactions
- **E2E Tests**: Critical user workflows

## Code Review Checklist

- [ ] .nvmrc file exists and is pinned to appropriate Node version
- [ ] Tests pass locally (npm test: 100% passing)
- [ ] Test coverage meets standards (>80%)
- [ ] Code follows Clean Architecture principles
- [ ] No hardcoded credentials or secrets
- [ ] Error handling is appropriate
- [ ] Documentation updated
- [ ] Docker builds successfully

## Before Marking Complete

1. All tests passing
2. Coverage reports available
3. README updated with final details
4. Docker image builds
5. Ready for Fly.io deployment
