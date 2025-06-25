# PHP Code Quality Implementation

This document summarizes the implementation of standardized PHP code quality
commands across all PHP packages in the silverback-template monorepo.

## Motivation

The implementation provides a tight feedback loop for AI tools like Claude Code,
allowing them to run code quality checks immediately after making changes to
verify PHP code quality and catch issues early in the development process.

## Overview

Added standardized PHP code quality commands to all PHP-related packages to
ensure consistent code quality checks across the monorepo.

## Commands Implemented

### `test:static`

- Runs PHPCS and PHPStan checks
- Breaks on errors only (not warnings)
- Uses existing `/phpcs.xml.dist` and `/phpstan.neon` configurations

### `test:unit`

- Runs PHPUnit for Drupal "Unit" tests specifically
- Uses `--group Unit` filter
- Uses existing `/apps/cms/phpunit.xml.dist` configuration

### `test:integration`

- Runs all other Drupal test suites (Kernel, Functional, FunctionalJavascript)
- Uses `--exclude-group Unit` filter
- Uses existing `/apps/cms/phpunit.xml.dist` configuration

## Packages Updated

### @amazeelabs Scoped Packages (2)

1. `/packages/@amazeelabs/silverback-iframe/` - Added PHP commands for `drupal/`
   subdirectory
2. `/packages/@amazeelabs/silverback-search/` - Added PHP commands for `drupal/`
   subdirectory

### Drupal Modules (7)

3. `/packages/drupal/custom/` - Added complete PHP test suite
4. `/packages/drupal/custom_heavy/` - Added complete PHP test suite
5. `/packages/drupal/gutenberg_blocks/` - Added PHP commands alongside existing
   TypeScript commands
6. `/packages/drupal/search_api_global/` - Added complete PHP test suite
7. `/packages/drupal/test_content/` - Added complete PHP test suite
8. `/packages/drupal/content_preview/` - Added complete PHP test suite
9. `/packages/drupal/entity_create_split/` - Created new package.json with PHP
   test suite

### Drupal Themes (1)

10. `/packages/drupal-themes/custom_iframe/` - Added complete PHP test suite

## Turborepo Integration

### File Input Configuration

Added `turbo.json` files to all packages with proper PHP file inputs:

- `**/*.php` - PHP source files
- `**/*.module` - Drupal module files
- `**/*.inc` - Drupal include files
- `**/*.install` - Drupal install files
- `**/*.profile` - Drupal profile files
- `**/*.theme` - Drupal theme files
- `**/*.info.yml` - Drupal info files

### Dependencies

- Test commands depend on `@custom/cms#prep:composer` to ensure vendor binaries
  are available
- Integrates with existing turborepo pipeline: `prep` → `test:static` →
  `test:unit` → `test:integration`

### Caching

- Turborepo now properly caches based on PHP file changes
- Commands only run when relevant PHP files are modified
- Provides efficient caching for faster CI/CD execution

## Configuration Files Used

- **PHPCS**: `/phpcs.xml.dist` - Drupal coding standards with error-only
  reporting
- **PHPStan**: `/phpstan.neon` - Static analysis with Drupal-specific rules
- **PHPUnit**: `/apps/cms/phpunit.xml.dist` - Drupal test configuration

## Usage Examples

```bash
# Run static analysis on a specific package
cd packages/drupal/custom
pnpm test:static

# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run all PHP tests via turborepo
pnpm turbo test:static test:unit test:integration
```

## Benefits

1. **Consistent Quality**: Standardized commands across all PHP packages
2. **AI Integration**: Immediate feedback loop for AI tools
3. **Efficient Caching**: Turborepo integration with proper file inputs
4. **Selective Testing**: Separate unit and integration test execution
5. **Error Focus**: Static analysis focuses on errors, not warnings
6. **Existing Standards**: Leverages established Drupal coding standards

## Files Modified/Created

### Package.json Updates (10)

- 9 existing package.json files updated with new scripts
- 1 new package.json file created

### Turbo.json Configuration (10)

- 3 existing turbo.json files updated with PHP inputs
- 7 new turbo.json files created

### Total Implementation

- **20 files** modified/created
- **10 packages** now have standardized PHP quality commands
- **Full turborepo integration** with proper caching and dependencies

This implementation ensures that all PHP code in the monorepo follows consistent
quality standards and provides immediate feedback for both human developers and
AI tools.
