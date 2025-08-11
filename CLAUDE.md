# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start for Claude Code

### Essential Commands (Run These First)
- `pnpm i && pnpm turbo:prep` - Initial setup after branch switch
- `pnpm precommit` - Fix formatting, run linters, and execute unit tests  
- `pnpm turbo:test` - Full test suite (unit + integration)

### Development URLs
- Drupal backend: `http://localhost:8888` (admin/admin)
- Gatsby frontend: `http://localhost:8000`

### Testing Commands
- E2E tests: `cd tests/e2e && playwright test`
- Unit tests: `pnpm turbo:test:unit`

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

## Claude Code Workflow Integration

### Branch Strategy & Git Workflow
- **Main branch**: `release` (create PRs against this)
- **Environments**: `prod` (production), `dev` (testing), `stage` (staging)
- **Feature branches**: `lagoon-*` (get dedicated environments)

### Development Workflow
1. Create branch from `release`
2. Create PR against `release`
3. Merge to `dev` for testing
4. After approval, merge to `release`
5. Deploy to production by merging `release` to `prod`

### Test Locations
- `/tests/e2e-basic/` - Simple smoke tests
- `/tests/e2e/` - Comprehensive integration tests
- `/tests/schema/` - GraphQL schema validation

### Quality Assurance Commands
- **Before committing**: `pnpm precommit`
- **Before PR**: `pnpm turbo:test`
- **Schema changes**: `pnpm prep` (in `packages/schema`)

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

## Development workflow

Implementing a feature should follow these steps using the respective agents.

1. GraphQL schema and operations
2. UI components
3. Drupal module development
4. Drupal configuration and schema implementation
5. Schema tests
6. E2E tests

## Asset Management

- Always download assets from figma and put them into the `static/public` directory, which is available at the "/" level in the browser.

## Drupal Configuration Management

- Never write Drupal configuration **anywhere**. Use the browser to log into `http://localhost:8888` using username `admin` and password `admin`, do the configuration changes using the web interface and then persist them by running `drush cex -y` in the `apps/cms` folder.

## Drupal Test Content Management

### Build Pipeline
Turborepo stages: `prep → test:static → test:unit → test:integration`

### Agent Guidelines
- Always use agents where appropriate