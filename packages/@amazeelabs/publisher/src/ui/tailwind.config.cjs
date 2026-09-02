const path = require('path');

// The amazee.io brand palette, per the brand guidelines (Brand Colors, p.17).
// This is the single source of truth for colour in the Publisher UI: components
// reference the semantic aliases below, never a raw hex.
const brand = {
  anchor: '#000000', // Anchor Black
  delta: '#183043', // Delta Blue
  beacon: '#003b61', // Beacon Blue
  coastal: '#1c4c72', // Coastal Blue
  asteroid: '#5f7281', // Asteroid Gray
  lunar: '#b1bec8', // Lunar Gray
  stardust: '#f4f7f9', // Stardust Gray
  marine: '#0093d3', // Marine Blue
  mermaid: '#00b6ed', // Mermaid Blue
  wave: '#7acdf3', // Wave Blue
  light: '#cbe7fa', // Light Blue
  lagoon: '#32c8b4', // Lagoon Aqua
  pulsar: '#d81159', // Pulsar Pink
  nova: '#ffffff', // Nova White
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, '**/*.{ts,tsx,mdx}')],
  theme: {
    colors: {
      ...brand,
      white: brand.nova,
      black: brand.anchor,
      transparent: 'transparent',
      current: 'currentColor',

      // Semantic aliases. Several brand mid-tones fail WCAG AA as text
      // colours, so the pairings here are deliberate: Mermaid Blue is only
      // ever a background (black on Mermaid is 8.9:1, white on it is 2.4:1),
      // Coastal Blue carries interactive text on light surfaces (9.0:1), and
      // Lagoon Aqua is an icon and bar colour only (2.1:1 on white).
      surface: brand.stardust, // page background
      card: brand.nova, // panels
      ink: brand.anchor, // body text on light
      muted: brand.asteroid, // secondary text
      line: brand.lunar, // borders and dividers
      accent: brand.mermaid, // actions, in-progress
      link: brand.coastal, // interactive text on light
      success: brand.lagoon,
      error: brand.pulsar,
      shell: brand.delta, // header and log surfaces
    },
    fontFamily: {
      // Heebo is the brand font family (Brand Font Family, p.16). Headings take
      // their weight from it rather than from a second face.
      sans: ['Heebo', 'Arial', 'sans-serif'],
      mono: ['Monaco', 'monospace'],
    },
    extend: {},
  },
  plugins: [],
};
