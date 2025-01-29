import type { CodegenConfig } from '@graphql-codegen/cli';

// Load schema and document paths from .graphqlrc.json, so it's shared
// with IDE plugins.
import graphqlrc from './.graphqlrc.json';

const scalars = {
  Markup: '@amazeelabs/scalars#Markup',
  Url: '@amazeelabs/scalars#Url',
  ImageSource: '@amazeelabs/scalars#ImageSource',
  JSONString: 'string',
};

const common = {
  enumsAsConst: true,
  maybeValue: 'T | undefined',
  strictScalars: true,
  scalars,
  withObjectType: true,
};

const config: CodegenConfig = {
  ...graphqlrc,
  generates: {
    'build/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
    // Persisted query ids to be consumed by Drupal.
    'build/operations.json': {
      plugins: ['@amazeelabs/codegen-operation-ids'],
    },
    // Directive autoloader for Drupal.
    'build/drupal-autoload.json': {
      plugins: ['@amazeelabs/codegen-autoloader'],
      config: {
        mode: 'drupal',
        context: ['drupal'],
      },
    },
    // The main entry point. Contains:
    // - All types generated from the schema.
    // - All operation types
    // - All fragment types
    // - All operations as typed id's
    'src/generated/index.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        '@amazeelabs/codegen-operation-ids',
      ],
      config: {
        ...common,
        // Only add __typename to types if it is explicitly specified in the
        // query.
        skipTypename: true,
      },
    },
    // Source type definitions.
    // All graphql schema types and resolvers, prefixed with `Source` and with required
    // type names. Used for validating incoming data, e.g. from Decap.
    'src/generated/source.ts': {
      plugins: [`typescript`, `typescript-resolvers`],
      config: {
        ...common,
        scalars: Object.fromEntries(
          Object.keys(scalars).map((key) => [key, 'string']),
        ),
        typesPrefix: 'Source',
        // In source types we always want an enforced __typename, so unions and
        // interfaces can be resolved automatically.
        skipTypename: false,
        nonOptionalTypename: true,
      },
    },
  },
};

export default config;
