import { useIntl } from '@amazeelabs/react-intl';
import {
  BlockTeaserListFragment,
  Locale,
  TeaserListQuery,
} from '@custom/schema';
import queryString from 'query-string';
import React from 'react';

import { useOperation } from '../../../utils/operation';
import { CardItem } from '../Card';

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

export function BlockTeaserList(props: BlockTeaserListFragment) {
  const staticIds: Array<string | undefined> = [];
  return (
    <div className="bg-white px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ul className="my-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 grid-cols-subgrid">
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
