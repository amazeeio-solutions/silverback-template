import { buildResponsiveImage } from '@amazeelabs/cloudinary-responsive-image';
import { createResolveConfig } from '@amazeelabs/graphql-directives';
import {
  AnyOperationId,
  ImageSource,
  OperationResult,
  OperationVariables,
} from '@custom/schema';
import { PreviewTemplateComponentProps } from 'decap-cms-core';
import { buildSchema, graphql, GraphQLFieldResolver } from 'graphql';
import { useEffect, useState } from 'react';
import { ZodType, ZodTypeDef } from 'zod';

import rawOperations from '../../node_modules/@custom/schema/build/operations.json?raw';
import rawSchema from '../../node_modules/@custom/schema/build/schema.graphql?raw';
import { PreviewFrame } from './frame.js';

const operations = JSON.parse(rawOperations);
const schema = buildSchema(rawSchema);

type DecapContext = {
  getAssetUrl: (path: string) => string;
};

const imageProps: GraphQLFieldResolver<
  string,
  DecapContext,
  {},
  Promise<{ width: number; height: number; src: string }>
> = async (source, _, { getAssetUrl }) => {
  const src = getAssetUrl(source);
  const { width, height } = await createImageBitmap(
    await (await fetch(src)).blob(),
  );
  return { width, height, src, originalSrc: src };
};

const responsiveImage: GraphQLFieldResolver<
  { width: number; height: number; src: string },
  DecapContext,
  { width?: number; height?: number; sizes?: [[number]] },
  Promise<ImageSource | undefined>
> = async (source, { width, height, sizes }) => {
  return buildResponsiveImage(
    {
      cloudname: 'demo',
      key: 'demo',
      secret: 'demo',
    },
    source,
    { width: width || source.width, height, sizes },
  ) as ImageSource;
};

export async function query<TOperation extends AnyOperationId>(
  operation: TOperation,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootValue: any,
  variables: OperationVariables<TOperation> = {},
  getAssetUrl: (path: string) => string,
): Promise<OperationResult<TOperation>> {
  const resolvers = createResolveConfig(schema, {
    imageProps,
    responsiveImage,
  });
  const result = await graphql({
    schema,
    source: operations[operation as keyof typeof operations],
    rootValue,
    contextValue: { getAssetUrl },
    variableValues: variables,
    fieldResolver: async (source, args, context, info) => {
      return resolvers[info.parentType.name]?.[info.fieldName]
        ? await resolvers[info.parentType.name][info.fieldName](
            source,
            args,
            context,
            info,
          )
        : source[info.fieldName];
    },
  });
  if (!result.data) {
    throw result.errors;
  }
  return result.data;
}

export function useQuery<TOperation extends AnyOperationId>(
  operation: TOperation,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rootValue: any,
  variables: OperationVariables<TOperation> = {},
  getAssetUrl: (path: string) => string,
) {
  const [result, setResult] = useState<OperationResult<TOperation>>();
  const [key, setKey] = useState('');
  useEffect(() => {
    if (key !== JSON.stringify({ operation, rootValue, variables })) {
      query(operation, rootValue, variables, getAssetUrl)
        .then(setResult)
        .catch(console.error);
      setKey(JSON.stringify({ operation, rootValue, variables }));
    }
  }, [
    operation,
    rootValue,
    variables,
    getAssetUrl,
    result,
    setResult,
    key,
    setKey,
  ]);
  return result;
}

export type useQueryType = typeof useQuery;

export function createPreview<TOperation extends AnyOperationId>(
  query: TOperation,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodType<any, ZodTypeDef, unknown>,
  Component: React.FC<{
    preview: Exclude<OperationResult<TOperation>['preview'], undefined>;
  }>,
  rootField: string,
) {
  return function Preview({ entry, getAsset }: PreviewTemplateComponentProps) {
    // Extract data from Decap input.
    const input = entry.toJS().data;

    // Parse that input and transform it to a GraphQL Source input.
    const parsed = schema.safeParse({ ...input, locale: 'en' });
    if (!parsed.success) {
      console.error(parsed.error);
    }

    const previewSourceData = parsed.success ? parsed.data : null;

    // Execute the "Preview" query on that source input to transform
    // data into the exact shape of the query result expected by the
    // route.
    const data = useQuery(
      query,
      {
        [rootField]: previewSourceData,
      },
      {},
      (src) => getAsset(src).url,
    );

    return (
      <PreviewFrame>
        {data?.preview ? (
          <Component preview={data.preview} />
        ) : (
          <div className="mb-8 flex flex-col items-center pb-36 pt-12">
            <p>Loading...</p>
            <p>Please make sure all required fields are filled.</p>
          </div>
        )}
      </PreviewFrame>
    );
  };
}
