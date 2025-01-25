import { useIntl } from '@amazeelabs/react-intl';
import { FrameQuery, NavigationItem, Url, useLocation } from '@custom/schema';

import { useLocale } from '../../utils/locale';
import { useOperation } from '../../utils/operation';

export type MenuNameType = 'main' | 'footer';

export function useMenus() {
  const intl = useIntl();
  const locale = intl.locale;
  const settings = useOperation(FrameQuery).data;

  return {
    main: settings?.mainNavigation
      ?.filter((nav) => nav?.locale === locale)
      .pop(),
    footer: settings?.footerNavigation
      ?.filter((nav) => nav?.locale === locale)
      .pop(),
  };
}

export function useCurrentPath() {
  const [loc] = useLocation();
  return loc.pathname;
}

export function useMenuItem(path: string, menuName: MenuNameType) {
  const menus = useMenus();

  return (
    menus &&
    menus[menuName]?.items.find((menuItem) => menuItem?.target === path)
  );
}

export function useMenuChildren(path: string, menuName: MenuNameType) {
  const menus = useMenus();
  const menuItemFromPath = useMenuItem(path, menuName);
  return (
    menus &&
    menus[menuName]?.items.filter(
      (menuItem) => menuItem?.parent === menuItemFromPath?.id,
    )
  );
}

export function useCurrentMenuItem(menuName: MenuNameType) {
  const currentPath = useCurrentPath();
  return useMenuItem(currentPath || '', menuName);
}

export function useCurrentMenuChildren(menuName: MenuNameType) {
  const currentPath = useCurrentPath();
  return useMenuChildren(currentPath || '', menuName);
}

export function useMenuAncestors(path: string, menuName: MenuNameType) {
  const menus = useMenus();
  const menuItemFromPath = useMenuItem(path, menuName);
  let processingMenuItem = menuItemFromPath;
  const ancestors: Array<NavigationItem> = [];
  const locale = useLocale();

  // Set current page breadcrumb
  if (typeof processingMenuItem !== 'undefined') {
    // If not home path then only push into breadcrumbs array
    if (processingMenuItem.target !== '/') {
      ancestors.push(processingMenuItem);
    }
  }

  while (
    typeof processingMenuItem !== 'undefined' &&
    processingMenuItem?.parent
  ) {
    processingMenuItem =
      menus &&
      menus[menuName]?.items.find(
        (menuItem) => menuItem?.id === processingMenuItem?.parent,
      );
    if (typeof processingMenuItem !== 'undefined') {
      ancestors.push(processingMenuItem);
    }
  }
  if (ancestors.length > 0) {
    ancestors.push({ id: '_', target: `/${locale}` as Url, title: 'Home' });
    // Pop off the current path, we dont care about it
    ancestors.reverse().pop();
  }

  return ancestors;
}

export const useBreadcrumbs = (menuName?: MenuNameType, path?: string) => {
  const currentPath = useCurrentPath();
  return useMenuAncestors(path || currentPath || '', menuName || 'main');
};
