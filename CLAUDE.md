# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

**Silverback Template** - A sophisticated monorepo for building headless CMS applications using Drupal and Gatsby.

### Tech Stack
- **Monorepo**: Turborepo + pnpm workspaces + Lerna
- **Backend**: Drupal 10 with custom modules and Gutenberg editor
- **Frontend**: Gatsby 5 + React 18 + TypeScript
- **Alternative CMS**: Decap CMS (git-based)
- **Styling**: Tailwind CSS
- **Testing**: Playwright (e2e), Vitest (unit), PHPUnit (Drupal)
- **Development**: Devbox with Nix (recommended) or Docker

### Key Applications
- `/apps/cms/` - Drupal 10 backend (port 8888)
- `/apps/website/` - Gatsby frontend (port 8000)
- `/apps/preview/` - Real-time preview server with OAuth2
- `/apps/decap/` - Git-based CMS interface
- `/apps/publisher/` - Static website build and deployment coordination

### Shared Packages
- `/packages/ui/` - React components with Storybook
- `/packages/schema/` - GraphQL schema and types
- `/packages/drupal/` - Custom Drupal modules
- `/packages/@amazeelabs/` - Amazee Labs specific packages, published to NPM.js. Only available in `silverback-template`, not in derived projects.
- `/packages/eslint-config/` - Shared ESLint configuration

## Essential Commands

### Initial Setup
```bash
pnpm i && pnpm turbo:prep
```

### Pre-commit Quality Checks
```bash
pnpm precommit             # Fix formatting, run linters, and execute unit tests
pnpm precommit:fix         # Only auto-fix formatting and linting issues
pnpm precommit:check       # Only validate without fixing
```

### Testing
```bash
pnpm turbo:test             # Full test suite (unit + integration)
pnpm turbo:test:integration # Integration tests only
```

## Testing Framework

### E2E Testing (Playwright)
```bash
cd tests/e2e
playwright test          # Headless
playwright test --headed # With browser UI
playwright test --ui     # Interactive mode
```

### Test Locations
- `/tests/e2e-basic/` - Simple smoke tests
- `/tests/e2e/` - Comprehensive integration tests
- `/tests/schema/` - GraphQL schema validation

## Branch Strategy
- `release` - Production-ready code (no environment)
- `prod` - Production environment
- `dev` - Main development/testing environment
- `stage` - Secondary staging environment
- `lagoon-*` - Feature branches with dedicated environments

## Development Workflow
1. Create branch from `release`
2. Create PR against `release`
3. Merge to `dev` for testing
4. After approval, merge to `release`
5. Deploy to production by merging `release` to `prod`

## Key Architectural Patterns

### Headless CMS
- Drupal as GraphQL API backend
- Gatsby for static site generation
- Real-time preview system connecting both

### Multi-CMS Support
- Primary: Drupal for complex content management
- Alternative: Decap CMS for git-based workflows
- Conditional loading based on configuration

### Component Architecture
- Shared UI components in `/packages/ui/`
- Storybook for component development
- GraphQL-first data fetching

## Important Files
- `/phpcs.xml.dist` - PHP CodeSniffer configuration
- `/phpstan.neon` - PHPStan static analysis
- `/packages/eslint-config/` - Shared ESLint configuration
- `turbo.json` - Turborepo build pipeline configuration

## Environment Variables (Production)
- `DRUPAL_HASH_SALT` - Security salt (required)
- `NETLIFY_SITE_ID`, `NETLIFY_AUTH_TOKEN` - Netlify deployment
- `CLOUDINARY_*` - Image processing
- `DRUPAL_INTERNAL_URL`, `DRUPAL_EXTERNAL_URL` - Service URLs
- `PUBLISHER_OAUTH2_CLIENT_SECRET` - OAuth2 authentication

## Turborepo Build Pipeline
The build follows stages: prep → test:static → test:unit → test:integration

## Code Organization Principles
- Don't create `index.ts` files that aggregate a whole directory. Use explicit imports instead.
- Follow existing code conventions and patterns when making changes
- Check package.json for available libraries before adding new dependencies

## Development Best Practices

- If a task requires new operations or data structures, start by adjusting the GraphQL schema and operations.
- Run `pnpm precommit` after code changes, which will fix formatting and run linters and unit tests.
- Always run `pnpm install && pnpm turbo:prep` after switching branches to avoid issues

### Storybook and UI Component Development
- Create Storybook stories for UI components. Cover input property edge cases and create play functions for testing interactions.
- Visible interface strings have to be translated using 'react-intl'.
- Never use string concatenation for class attributes, always use 'clsx'.
- Implement frontend business logic in Typescript utilities that are tested with vitest.
- Avoid using useEffect and useContext in React. Try to solve the problem with zustand instead.
- Test zustand stores with vitest by accessing them directly, not through React hooks.
- **Never attempt to start storybook. It should already be running in the background.**

### Drupal Extensions
- Create services for Drupal business logic and create PHPUnit tests for them.
- Create Kernel tests for interconnected Drupal services. Avoid mocking services, unless they connect to external systems.
- Keep Drupal hooks as simple as possible. If they get complex, they should instead call a unit-tested service.

### GraphQL Schema
- Avoid technical Details, keep types and fields technology agnostic and readable to humans.
- Add GraphQL block comments for describing schema elements. Use markdown for clarity.
- Run `pnpm prep` in `packages/schema` after changing the schema, operations or fragments to verify correctness.

## Asset Management

- Always download assets from figma and put them into the `static/public` directory, which is available at the "/" level in the browser.