import type {
  LinkType,
  LocationProviderType,
  useLocationType,
} from '@amazeelabs/bridge';
import React from 'react';
import {
  Link as ReactRouterLink,
  useLocation as useReactRouterLocation,
  useNavigate,
} from 'react-router';

export const useLocation: useLocationType = () => {
  const location = useReactRouterLocation();
  const navigate = useNavigate();

  return [
    {
      pathname: location.pathname,
      search: location.search,
      searchParams: new URLSearchParams(location.search),
      hash: location.hash,
    },
    navigate,
  ];
};

export const Link: LinkType = ({ href, children, ...props }) => {
  return (
    <ReactRouterLink {...props} to={href || '/'}>
      {children}
    </ReactRouterLink>
  );
};

export const LocationProvider: LocationProviderType = ({ children }) => {
  return <>{children}</>;
};
