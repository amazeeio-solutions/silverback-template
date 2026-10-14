# @custom/seo

React components and hooks that run a Yoast SEO analysis
([`yoastseo`](https://www.npmjs.com/package/yoastseo)) on rendered page content
and show the results, a snippet preview and a keyword input. Used in the content
preview.

## Usage

Import the component and its stylesheet:

```tsx
import '@custom/seo/style.css';

import { SeoAnalysis } from '@custom/seo';

<SeoAnalysis content={html} locale="en" metaTags={metaTags} url={path} />;
```

Other exports: `SeoResultsFloating`, `KeywordInput`, `ResultsList`,
`SnippetPreview`, the `useSeoAnalysis` hook and scoring helpers.

Build with `pnpm prep` (Vite library build and type declarations), or `pnpm dev`
to rebuild on change. Tailwind classes use the `seo-` prefix and preflight is
disabled, so styles do not leak into the host page.

## How the analysis works

Yoast splits the analysis into:

- Researcher: runs researches (word count, links, headings, …) on a `Paper`.
- Assessor: runs assessments on the research results and scores them.

```
Paper --> Researcher --> Assessor --> Assessments --> Results
```

`src/utils/analysis.ts` builds a `Paper` from the content, title, description
and URL. It uses Yoast's English researcher with extra researches (images, alt
tags, H1s, title width, links) and a custom link statistics research. Instead of
Yoast's separate content and SEO assessors, `CustomAssessor` runs one selected
set of SEO and readability assessments. Results are grouped by category in the
UI. Score thresholds are in `src/config/index.ts`. Translations of the Yoast
result texts (en, de, fr, it) are in `src/translations`.

## Dependencies

Depends on: `@amazeelabs/react-intl`.

Used by: `@custom/ui` (`Routes/Preview.tsx`).
