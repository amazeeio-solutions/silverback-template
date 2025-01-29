import {
  FrameQuery,
  Locale,
  OperationExecutorsProvider,
  Url,
} from '@custom/schema';
import { SourceNavigationItem } from '@custom/schema/source';
import { Frame } from '@custom/ui/routes/Frame';
import { PropsWithChildren } from 'react';

const menuItems = (amount: number) =>
  [...Array(amount).keys()].map(
    (i) =>
      ({
        id: `${i}`,
        __typename: 'NavigationItem',
        title: `Item ${i + 1}`,
        target: '/' as Url,
      }) satisfies SourceNavigationItem,
  );

export function PreviewFrame({ children }: PropsWithChildren) {
  return (
    <OperationExecutorsProvider
      executors={[
        {
          id: FrameQuery,
          executor: {
            mainNavigation: [
              {
                locale: Locale.En,
                items: menuItems(4),
              },
            ],
            footerNavigation: [
              {
                locale: Locale.En,
                items: menuItems(4),
              },
            ],
            stringTranslations: [],
          },
        },
      ]}
    >
      <Frame>{children}</Frame>
    </OperationExecutorsProvider>
  );
}
