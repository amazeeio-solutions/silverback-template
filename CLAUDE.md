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
- `/apps/publisher/` - Build and deployment coordination

### Shared Packages
- `/packages/ui/` - React components with Storybook
- `/packages/schema/` - GraphQL schema and types
- `/packages/drupal/` - Custom Drupal modules

## Essential Commands

### Initial Setup
```bash
pnpm i && pnpm turbo:prep
```

### Force Reinstall (after branch switching)
```bash
pnpm turbo:prep:force
```

### Testing
```bash
pnpm turbo:test          # Full test suite (unit + integration)
pnpm turbo:test:quick    # Unit tests only
pnpm turbo:test:force    # Force run without cache
```

### Code Quality
```bash
pnpm test:format         # Check Prettier formatting
pnpm test:format:fix     # Fix formatting issues
```

### ESLint (Code Linting)
```bash
# Check for ESLint issues in all workspaces
pnpm turbo test:static

# Fix ESLint issues in a specific workspace
cd <workspace-directory>
pnpm eslint . --fix

# Check ESLint issues without TypeScript compilation
cd <workspace-directory>  
pnpm eslint . --quiet

# Example: Fix issues in UI package
cd packages/ui && pnpm eslint . --fix
```

### App Development
```bash
# Drupal CMS
cd apps/cms && pnpm start

# Gatsby Website  
cd apps/website && pnpm gatsby:develop

# Preview Server
cd apps/preview && pnpm dev:app

# Decap CMS
cd apps/decap && pnpm dev
```

### Drupal-Specific
```bash
cd apps/cms
drush                    # Drupal CLI
pnpm turbo:prep         # Clears cache if DB exists, reinstalls if not
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
Always run `pnpm turbo:prep` after switching branches or making package changes.

## Development Best Practices
- Always use prettier to format typescript, javascript, yaml, json and markdown files after editing them
- Run `pnpm turbo:test:quick` tests after code changes
- Run `pnpm test:format:fix` after changes to format everything correctly
- Fix ESLint issues using `pnpm eslint . --fix` in individual workspaces before committing
- Use `pnpm turbo test:static` to run ESLint across all workspaces (includes TypeScript compilation)

## Code Organization Principles
- Don't create index.ts files that aggregate a whole directory. Use explicit imports instead.