import {
  createLinkComponent,
  createUseLocationHook,
} from '@amazeelabs/bridge-waku';
import { Link as WakuLink, useRouter_UNSTABLE } from 'waku';

export { LocationProvider } from '@amazeelabs/bridge-waku';

export const useLocation = createUseLocationHook(useRouter_UNSTABLE);
export const Link = createLinkComponent(WakuLink);
