import {
  AnyOperationId,
  OperationResult,
  OperationVariables,
} from '@custom/schema';
import { SourceResolvers } from '@custom/schema/source';
import merge from 'deepmerge';
import {
  buildSchema,
  graphql,
  GraphQLFieldResolver,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
} from 'graphql';
import { z } from 'zod';

import rawOperations from '../node_modules/@custom/schema/build/operations.json?raw';
import rawSchema from '../node_modules/@custom/schema/build/schema.graphql?raw';

function isImageSource(type: GraphQLOutputType) {
  if (type instanceof GraphQLNonNull) {
    return isImageSource(type.ofType);
  }
  return type instanceof GraphQLScalarType && type.name === 'ImageSource';
}

export function createExecutor(
  registries: Array<SourceResolvers>,
): <TOperation extends AnyOperationId>(
  operation: TOperation,
  variables: OperationVariables<TOperation>,
) => Promise<OperationResult<TOperation>> {
  const registry = merge.all<SourceResolvers>(registries);
  const schema: GraphQLSchema = buildSchema(rawSchema);
  const operations = z
    .record(z.string(), z.string())
    .parse(JSON.parse(rawOperations));

  return async (operation, variables) => {
    const result = await graphql({
      schema,
      source: operations[operation as keyof typeof operations],
      variableValues: variables,
      rootValue: {},
      fieldResolver: async (source, args, context, info) => {
        const resolver = registry[
          info.parentType.name as keyof SourceResolvers
        ]?.[info.fieldName as keyof SourceResolvers[keyof SourceResolvers]] as
          | GraphQLFieldResolver<unknown, unknown>
          | undefined;
        if (resolver) {
          try {
            const res = await resolver(source, args, context, info);
            return res;
          } catch (err) {
            console.error(err);
          }
        } else {
          if (isImageSource(info.returnType)) {
            return JSON.stringify({
              src: source[info.fieldName].replace('/apps/decap', ''),
            });
          } else {
            return source[info.fieldName];
          }
        }
      },
    });
    if (!result.data) {
      console.error(result.errors);
      throw new Error(`Preview error: ${result.errors}`);
    }
    return JSON.parse(JSON.stringify(result.data));
  };
}
