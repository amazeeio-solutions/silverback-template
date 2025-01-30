/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const { parse } = require('graphql');
const { readFileSync } = require('fs');

// Relative path from package.json file to the schema file.
const schema = readFileSync('../../schema/src/schema.graphql', 'utf-8');

const ast = parse(schema);

const typingMap = {
  String: 'string',
  Markup: 'string',
  Int: 'number',
  MediaImage: 'array',
  ImageSource: 'array',
  Url: 'string',
};

function generateGutenbergBlockCode(typeName) {
  for (const typeDefinition of ast.definitions) {
    if (
      typeDefinition.kind === 'ObjectTypeDefinition' &&
      typeDefinition.name.value === typeName
    ) {
      const blockName = typeDefinition.name.value;
      const gutenbergBlockMachineName = toKebabCase(blockName);

      const attributes = typeDefinition.fields.map((field) => {
        const fieldType = getFieldType(field);
        return {
          name: ['ImageSource', 'MediaImage'].includes(fieldType)
            ? 'mediaEntityIds'
            : field.name.value,
          type: typingMap[fieldType],
        };
      });

      // Generate code for the Gutenberg block based on attributes.
      const blockCode = generateBlockCode(
        gutenbergBlockMachineName,
        attributes,
      );

      // Write the generated code to a file.
      const filePath = `./js/blocks/${gutenbergBlockMachineName}.tsx`; // Output file path
      fs.writeFileSync(filePath, blockCode);

      console.log(`Generated Gutenberg block for ${blockName} in ${filePath}`);
      return;
    }
  }

  console.error(`GraphQL type "${typeName}" not found in the schema.`);
}

function generateBlockCode(blockName, attributes) {
  if (!attributes) {
    return '';
  }

  const titleCaseTitle = toTitleCase(blockName);
  // The file template for the Gutenberg block.
  return `import React, { Fragment } from 'react';
import {
  InspectorControls,
  RichText,
} from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';
import { PanelBody } from 'wordpress__components';
${
  attributes.find((attribute) => attribute.type === 'array') &&
  `import { dispatch } from 'wordpress__data';

import { DrupalMediaEntity } from '../utils/drupal-media';`
}

registerBlockType<{
${attributes
  .filter((attribute) => attribute.type)
  .map((attribute) => {
    return `${attribute.name}: ${attribute.type};`;
  })}
}>('custom/${blockName}', {
  title: '${titleCaseTitle}',
  icon: 'text',
  category: 'common',
  attributes: {
    ${attributes
      .filter((attribute) => attribute.type)
      .map(
        (attribute) =>
          `${attribute.name}: {
      type: '${attribute.type}'
    }`,
      )
      .join(',\n\t\t')}
  },
  edit: (props) => {
    const { attributes, setAttributes } = props;
    
    // Set default values this way so that values get saved in the block's attributes.
    //props.setAttributes({
    //  isQuote:
    //    props.attributes.isQuote === undefined
    //      ? false
    //      : props.attributes.isQuote,
    //});
    
    return (
      <Fragment>
        <InspectorControls>
          <PanelBody title={Drupal.t('Block settings')}>  
            <p>Block settings</p>
          </PanelBody>
        </InspectorControls>
        <div className={'container-wrapper'}>
          <div className={'container-label'}>{Drupal.t('${titleCaseTitle}')}</div>
          <div className="custom-block-${blockName}">
            ${attributes
              .map((attribute) => getGutenbergFieldBlock(attribute))
              .join('\n\t\t\t\t\t')}
          </div>
        </div>
      </Fragment>
    );
  },
  save() {
    return null;
    // or uncomment this if you import and use InnerBlocks from wordpress__block-editor
    // return <InnerBlocks.Content />;
  },
});
`;
}

function getGutenbergFieldBlock(attribute) {
  switch (attribute.type) {
    case 'string':
      return `<RichText
            identifier="${attribute.name}"
            tagName="p"
            value={attributes.${attribute.name}}
            allowedFormats={[]}
            // @ts-ignore
            disableLineBreaks={true}
            placeholder={Drupal.t("${toTitleCase(attribute.name)}")}
            keepPlaceholderOnFocus={true}
            onChange={(newValue) => {
              setAttributes({ ${attribute.name}: newValue })
            }}
          />`;
    case 'array':
      return ` <DrupalMediaEntity
            classname={'w-full'}
            attributes={{
              ...props.attributes,
              lockViewMode: true,
              allowedTypes: ['image'],
            }}
            setAttributes={props.setAttributes}
            isMediaLibraryEnabled={true}
            onError={(error) => {
              error = typeof error === 'string' ? error : error[2];
              dispatch('core/notices').createWarningNotice(error);
            }}
            />`;
  }
}
function toKebabCase(input) {
  return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
function toTitleCase(input) {
  return input
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
function getFieldType(field) {
  if (field.type.kind === 'NonNullType') {
    return field.type.type.name?.value;
  } else if (field.type.kind === 'NamedType') {
    return field.type.name?.value;
  } else {
    // Handle other cases as needed
    return null;
  }
}
const [, , typeName] = process.argv;
if (typeName) {
  generateGutenbergBlockCode(typeName);
} else {
  console.error('Usage: pnpm run generate-block <GraphQLType>');
}
