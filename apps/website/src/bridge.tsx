import {
  createLinkComponent,
  createUseLocationHook,
} from '@amazeelabs/bridge-waku';
import { Link as WakuLink, useRouter_UNSTABLE } from 'waku';

export { LocationProvider } from '@amazeelabs/bridge-waku';

export const useLocation = () => {
  const [loc, navigate] = createUseLocationHook(useRouter_UNSTABLE)();
  if (Array.isArray(loc.pathname)) {
    loc.pathname = `/${loc.pathname.join('/')}`;
  }
  return [loc, navigate];
};
export const Link = createLinkComponent(WakuLink);
