const path = require('path');

module.exports = {
  plugins: {
    // Explicit, because commands run from the package root, where Tailwind finds
    // no config of its own.
    tailwindcss: { config: path.join(__dirname, 'tailwind.config.cjs') },
    autoprefixer: {},
  },
};
