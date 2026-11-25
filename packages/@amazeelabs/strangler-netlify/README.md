# @amazeelabs/strangler-netlify

Creates a Netlify function that implements the [strangler fig] pattern: requests
the Netlify website cannot serve are handed to one or more legacy systems, which
are tried in order. The first response a system accepts is returned, otherwise
the function responds with a 404.

## Usage

Create the function:

```ts
// netlify/functions/strangler.ts
import { createStrangler } from '@amazeelabs/strangler-netlify';
import fs from 'fs';

export const handler = createStrangler(
  [
    {
      // Base URL of the legacy system.
      url: 'https://legacy.example.com',
      // Optional. Skip this system for URLs it does not handle.
      applies: (url) => url.pathname.startsWith('/legacy/'),
      // Optional. Alter the event before it is forwarded.
      preprocess: (event) => event,
      // Optional. Return undefined to discard the response and try the next
      // system. Without it, every response is returned as is.
      process: (response) =>
        [301, 302].includes(response.status) ? response : undefined,
    },
  ],
  // Optional 404 body. Defaults to "<p>Not found</p>".
  fs.readFileSync('public/404.html').toString(),
);
```

Route all unhandled requests to it with a catch-all rewrite, which must be the
last rule. In `_redirects`:

```
/* /.netlify/functions/strangler 200
```

Or in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/strangler"
  status = 200
```

Files from the Netlify build and paths matching earlier rules never reach the
function. Add explicit rewrites for known legacy paths to save invocations:

```
/sites/default/files/* https://legacy.example.com/sites/default/files/:splat 200
/* /.netlify/functions/strangler 200
```

Requests are forwarded with the original method, headers and body, plus
`SLB-Forwarded-Proto`, `SLB-Forwarded-Host` and `SLB-Forwarded-Port`. Redirects
are not followed. If a legacy system cannot be reached, the function responds
with a 404 without trying the remaining systems.

If the 404 page is read from disk, include it in the function bundle:

```toml
[functions.strangler]
  included_files = ["public/404.html"]
```

## Dependencies

Used by `apps/website` (`netlify/functions/strangler.ts`), which passes
unhandled paths to Drupal to resolve its redirects.

[strangler fig]:
  https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig
