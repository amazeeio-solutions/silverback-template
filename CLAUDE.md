# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start for Claude Code

### Essential Commands (Run These First)
- `pnpm i && pnpm turbo:prep` - Initial setup after branch switch
- `pnpm precommit` - Fix formatting, run linters, and execute unit tests  
- `pnpm turbo:test` - Full test suite (unit + integration)
- `pnpm turbo:test:integration` - Integration tests only

### Development URLs
- Drupal backend: `http://localhost:8888` (admin/admin)
- Gatsby frontend: `http://localhost:8000`

### Testing Commands
- E2E tests: `cd tests/e2e && playwright test`
- Interactive E2E: `cd tests/e2e && playwright test --ui`
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
- `DRUPAL_SLACK_WEBHOOK_URL` - Slack incoming webhook for the Drupal `slack` module

## Turborepo Build Pipeline
The build follows stages: prep → test:static → test:unit → test:integration

## Code Organization Principles
- Don't create `index.ts` files that aggregate a whole directory. Use explicit imports instead.
- Follow existing code conventions and patterns when making changes
- Check package.json for available libraries before adding new dependencies

## Development Best Practices

### General Development
- **GraphQL-first**: Start with schema/operations for new features
- **Quality checks**: Run `pnpm precommit` after code changes
- **Branch switching**: Run `pnpm install && pnpm turbo:prep` after switching branches
- **Dependencies**: Check package.json for existing libraries before adding new ones
- **No index files**: Don't create `index.ts` files that aggregate directories

### React & Frontend Development
- **State management**: Use zustand instead of useEffect/useContext
- **Testing**: Test zustand stores directly with vitest (not through React hooks)
- **Styling**: Use clsx for dynamic classNames, never string concatenation
- **Internationalization**: Use `intl.formatMessage` for all UI text
- **Storybook**: Create stories for UI components with play functions
- **Storybook note**: Never start storybook - it runs in background
- **Business logic**: Implement in TypeScript utilities with vitest tests
- **Storybook Typing**: Always use "satisfies" for typing storybook stories and meta objects. Makes it easier to re-use those values in other stories.
- **Data Fetching**: React components fetch data using the `<Operation>` component or the `withOperation` higher-order component. For pure client side applications, `useOperation` can be used as well.
- **Data Submission**: To submit or update data in React components, the `useMutation` hook is used along with a GraphQL mutation.
- **React Router Navigation**: To retrieve path, query parameters or hash, or programmatically navigate to a new location use the `useLocation` hook.

### Drupal Development
- **Services**: Create PHPUnit-tested services for business logic
- **Hooks**: Keep simple, delegate complex logic to services
- **Testing**: Use Kernel tests for interconnected services
- **Configuration**: Use web UI + `drush cex -y` (never write config files)
- **Content**: Use web UI + `pnpm content:export` (never add content manually)

### GraphQL Schema
- **Human-readable**: Keep types/fields technology-agnostic
- **Documentation**: Add GraphQL block comments with markdown
- **Validation**: Run `pnpm prep` in `packages/schema` after changes

## File & Asset Management

### Styling
- **Iframe styling**: `packages/ui/src/iframe.css` uses `@apply` for Drupal classes
- **Assets**: Download from Figma → `packages/ui/static/public/` (available at "/" in browser)

### Important Configuration Files
- `/phpcs.xml.dist` - PHP CodeSniffer configuration
- `/phpstan.neon` - PHPStan static analysis
- `/packages/eslint-config/` - Shared ESLint configuration
- `turbo.json` - Turborepo build pipeline configuration

## Environment & Production Setup

### Required Environment Variables
- `DRUPAL_HASH_SALT` - Security salt (required)
- `NETLIFY_SITE_ID`, `NETLIFY_AUTH_TOKEN` - Netlify deployment
- `CLOUDINARY_*` - Image processing
- `DRUPAL_INTERNAL_URL`, `DRUPAL_EXTERNAL_URL` - Service URLs
- `PUBLISHER_OAUTH2_CLIENT_SECRET` - OAuth2 authentication
- `DRUPAL_SLACK_WEBHOOK_URL` - Slack incoming webhook for the Drupal `slack` module

### Build Pipeline
Turborepo stages: `prep → test:static → test:unit → test:integration`

