import { PageFragment } from '@custom/schema';

export function getBlockInstances(
  page: PageFragment | undefined,
  typeName: string,
) {
  const filtered = (page?.content ?? []).filter(
    (b) => b && b.__typename === typeName,
  );
  return {
    instances: filtered,
    isMultiple: filtered.length > 1,
  };
}
