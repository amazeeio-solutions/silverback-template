import { GatsbyBrowser, WrapRootElementBrowserArgs } from 'gatsby';
import { SessionProvider } from 'next-auth/react';
import React from 'react';

export const WrapRootElement: GatsbyBrowser['wrapRootElement'] = ({
  element,
}: WrapRootElementBrowserArgs) => <SessionProvider>{element}</SessionProvider>;
