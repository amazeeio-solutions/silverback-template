import { __experimentalLinkControl as LinkControl } from 'wordpress__block-editor';
import { registerBlockType } from 'wordpress__blocks';

registerBlockType<{
  url?: string;
  uuid?: string;
  entityType?: string;
}>('custom/teaser-item', {
  title: Drupal.t('Teaser item', {}, { context: 'gutenberg' }),
  icon: 'slides',
  category: 'layout',
  parent: ['custom/teaser-list'],
  attributes: {
    url: {
      type: 'string',
    },
    // To have an easier integration with entity usage, we also retrieve and
    // store the uuid and the entity type of internal links.
    uuid: {
      type: 'string',
    },
    entityType: {
      type: 'string',
    },
  },

  edit: (props) => {
    const { setAttributes, attributes } = props;
    const { url } = attributes;

    return (
      <div>
        <LinkControl
          value={{
            url: url,
          }}
          settings={{}}
          suggestionsQuery={{
            // Use the teaser_list linkit profile to fetch suggestions.
            subtype: 'teaser_list',
          }}
          onChange={(link: { url: string; id: string; type: string }) => {
            setAttributes({
              url: link.url,
              uuid: link.id,
              // At the moment, the teaser_list link autocomplete only
              // returns nodes.
              // For a more complex case, check the cta component.
              entityType: link.type !== 'URL' ? 'node' : '',
            });
          }}
        />
      </div>
    );
  },

  save: () => {
    return null;
  },
});
