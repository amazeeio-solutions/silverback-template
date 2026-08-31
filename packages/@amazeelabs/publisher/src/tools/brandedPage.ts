import {
  coastalBlue,
  deltaBlue,
  fontStack,
  logoLockupPath,
  lunarGray,
  stardustGray,
} from '../shared/brand';

/**
 * Renders a standalone, amazee.io-branded HTML page.
 *
 * Used for the pages served outside the `/___status` mount -- the OAuth2 login
 * and access notices. They cannot link the UI bundle's fingerprinted CSS, so
 * everything here is inlined, and the type degrades to Arial rather than
 * pulling a webfont over the network.
 */
export const renderBrandedPage = (
  title: string,
  body: string,
): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} · amazee.io</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        font-family: ${fontStack};
        background: ${stardustGray};
        color: #000;
      }
      header {
        background: ${deltaBlue};
        color: #fff;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      header svg { width: 10rem; height: auto; fill: currentColor; }
      header span {
        border-left: 1px solid ${lunarGray}66;
        padding-left: 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      main { display: flex; flex: 1; align-items: center; justify-content: center; padding: 1.5rem; }
      .card {
        width: 100%;
        max-width: 28rem;
        background: #fff;
        border: 1px solid ${lunarGray};
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: 0 1px 2px rgb(24 48 67 / 0.05);
      }
      .card p { margin: 0 0 1rem; line-height: 1.6; }
      .card p:last-child { margin-bottom: 0; }
      a { color: ${coastalBlue}; font-weight: 500; }
    </style>
  </head>
  <body>
    <header>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 461" role="img" aria-label="amazee.io"><path d="${logoLockupPath}" /></svg>
      <span>Publisher</span>
    </header>
    <main><div class="card">${body}</div></main>
  </body>
</html>
`;
