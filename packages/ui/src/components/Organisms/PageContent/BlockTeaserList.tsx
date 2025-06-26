import { useIntl } from '@amazeelabs/react-intl';
import {
  BlockTeaserListFragment,
  BlockTeaserListLayout,
  Locale,
  TeaserListQuery,
} from '@custom/schema';
import queryString from 'query-string';
import React from 'react';

import { useOperation } from '../../../utils/operation';
import { CardItem } from '../CardItem';
import { Carousel } from '../Carousel/Carousel';

export type TeaserListQueryArgs = {
  title: string | undefined;
  pageSize: string | undefined;
  excludeIds: string | undefined;
};

function getUUIDFromId(id: string) {
  const words = id.split(':');
  if (words.length === 1) {
    return id;
  }
  return words[1];
}

/**
 * Generates a unique block ID for a teaser list block based on its configuration.
 * This ensures that multiple blocks on the same page have different URL parameters.
 */
function generateBlockId(props: BlockTeaserListFragment): string {
  const configHash = [
    props.layout || 'GRID',
    props.buttonText || '',
    props.filters?.title || '',
    props.filters?.limit || '0',
    props.contentHubEnabled ? '1' : '0',
  ].join('|');
  
  // Simple hash function to create a short, stable identifier
  let hash = 0;
  for (let i = 0; i < configHash.length; i++) {
    const char = configHash.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `tl${Math.abs(hash).toString(36)}`;
}

export function BlockTeaserList(props: BlockTeaserListFragment) {
  const staticIds: Array<string | undefined> = [];
  const blockId = generateBlockId(props);

  return (
    <div className="bg-white px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {props.layout === undefined ||
        props.layout === BlockTeaserListLayout.Grid ? (
          <ul className="my-8 grid grid-cols-subgrid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {props.staticContent?.map((teaserItem) => {
              staticIds.push(getUUIDFromId(teaserItem?.content?.id || ''));

              return teaserItem?.content ? (
                <li
                  key={teaserItem?.content?.id}
                  className="grid grid-rows-subgrid"
                >
                  <CardItem
                    readMoreText={props.buttonText}
                    {...teaserItem?.content}
                  />
                </li>
              ) : null;
            })}
            {props.contentHubEnabled && (
              <DynamicTeaserList excludeIds={staticIds} {...props} />
            )}
          </ul>
        ) : null}

        {props.layout === BlockTeaserListLayout.Carousel ? (
          <Carousel
            visibleSlides={3}
            options={{
              loop: true,
              align: 'start',
              slidesToScroll: 1,
            }}
          >
            {props.staticContent?.map((teaserItem) => {
              staticIds.push(getUUIDFromId(teaserItem?.content?.id || ''));

              return teaserItem?.content ? (
                <CardItem
                  key={teaserItem?.content?.id}
                  readMoreText={props.buttonText}
                  {...teaserItem?.content}
                />
              ) : null;
            })}
            {props.contentHubEnabled && (
              <DynamicTeaserList excludeIds={staticIds} {...props} />
            )}
          </Carousel>
        ) : null}
      </div>
    </div>
  );
}

export function DynamicTeaserList(
  props: BlockTeaserListFragment & { excludeIds: Array<string | undefined> },
) {
  const intl = useIntl();
  const { data, isLoading } = useOperation(TeaserListQuery, {
    locale: intl.locale as Locale,
    args: queryString.stringify(
      {
        title: props.filters?.title,
        pageSize: (props.filters?.limit || '0') as string,
        // The excludeIds field should contain a regular expression value, so
        // the final value would be something like: (^id1$|^id2$|^id3$), meaning
        // that the results with the id1, id2 and id3 should be excluded, as
        // they were already present in the static content.
        excludeIds: props.excludeIds
          ? `(^${props.excludeIds.join('$|^')}$)`
          : '',
      } satisfies TeaserListQueryArgs,
      { arrayFormat: 'bracket' },
    ),
  });
  if (!isLoading && data?.teaserList.items) {
    return (
      <>
        {data.teaserList.items.map((teaserItem) => {
          return teaserItem ? (
            <li key={teaserItem.id} className="grid grid-rows-subgrid">
              <CardItem readMoreText={props.buttonText} {...teaserItem} />
            </li>
          ) : null;
        })}
      </>
    );
  }
  return null;
}
