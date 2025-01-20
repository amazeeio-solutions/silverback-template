# GraphQL Schema Testing with Vitest

## Overview

This guide provides instructions on how to write and run schema tests for
GraphQL queries in a project that uses Gatsby and Drupal. The purpose of these
tests is to ensure that the GraphQL schema remains consistent and to verify that
the responses match expected formats.

## Test Framework

We use Vitest for testing:

- Simple and popular, works in various environments including command line and
  IDEs.
- Supports inline snapshots, which are crucial for our schema testing strategy.

## Writing Tests

### General Strategy

- **Coverage**: Aim to cover each GraphQL type and field.
- **Modularity**: Write small, modular tests with one test per type or content
  item to avoid large, complex snapshots.
- **Snapshot Usage**: Inline snapshots make it easy to see right in the test
  code what the output should be.
- **Warning**: Be cautious with numeric IDs in snapshots as they can change
  dynamically. Use path aliases when possible.

### Steps to Create Tests

1. **Prepare Your Environment**:

   - Define your GraphQL schema and add resolvers.
   - **Create default content that will be used in the tests**:
     - Create content in Drupal by navigating to Content > Add content. Choose
       the appropriate content type and fill in the necessary fields.
     - Export your content for persistence using Drush:
       ```bash
       drush content:export --entity_type=node --bundle=article --id=1
       ```
       Replace `article` and `1` with your content type and content ID as
       needed. This command exports the content, including all its dependencies,
       into a `.yml` file which can then be committed to your version control
       system.

2. **Develop Test Cases**:

   - In the `/tests/schema/specs` folder, create or modify a `.spec.ts` file for
     your test.
   - Use the `gql` tag from `noop-tag` for GraphQL queries to benefit from
     autocomplete and autoformatting features.

   **Example Test**:

   ```typescript
   import gql from 'noop-tag';
   import { expect, test } from 'vitest';
   import { fetch } from '../lib.js';

   test('Baby', async () => {
     const result = await fetch(gql`
       {
         _loadBaby(id: "uuid-of-node") {
           name
           path
           picture {
             __typename
             uuid
           }
         }
       }
     `);
     expect(result).toMatchInlineSnapshot();
   });
   ```

   The test fetches data for a 'Baby' content type, checking if the name, path,
   and picture data match what we expect.

3. **Running Tests**:

   - **Using PHPStorm**: In PHPStorm, you can run a specific test directly from
     the IDE by clicking on the green arrow next to the test name.
   - **Using the Command Line**:
     - To run a specific test by name, use the `--match` option:
       `vitest run --match "Test Name"`
     - To run all tests within a file, run `vitest run your-test-file.spec.ts`
     - Automatically run tests related to files as you make changes to them
       using: `vitest run --watch`.
   - The snapshot will appear inside `.toMatchInlineSnapshot()`, allowing you to
     verify the returned data.

### Additional Resources

- [Vitest Documentation](https://vitest.dev/docs/): For more information on
  testing and specific features of Vitest
- [Noop-tag Readme](https://www.npmjs.com/package/noop-tag)
