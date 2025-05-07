(() => {
  window.DrupalGutenberg.defaultSettings.codeEditingEnabled =
    drupalSettings.gutenberg.supportsHtml;
})();

drupalSettings.gutenberg._listeners.init.push(
  // Remove some of the formatting options
  function () {
    // List here https://github.com/WordPress/gutenberg/blob/trunk/packages/format-library/src/default-formats.js (preoebd with core/)
    // or wp.data.select( 'core/rich-text' ).getFormatTypes();
    wp.richText.unregisterFormatType('core/code');
    wp.richText.unregisterFormatType('core/keyboard');
  },

  // Remove some block options
  function () {
    const paragraphBlock = wp.blocks.getBlockType('core/paragraph');
    paragraphBlock.supports.typography.fontSize = false;
    paragraphBlock.supports.typography.dropCap = false;

    const listBlock = wp.blocks.getBlockType('core/list');
    listBlock.supports.color = false;
    listBlock.supports.typography = false;
  },

  // Allow common blocks to be placed only in the Content block.
  function () {
    const disable = [
      // Don't need this currently, so remove to avoid confusion
      'core/group',
    ];

    const blockTypes = wp.blocks.getBlockTypes();
    for (let i = 0; i < blockTypes.length; i++) {
      const blockType = blockTypes[i];
      // Check first if we have to disable the block entirely.
      if (disable.indexOf(blockType.name) !== -1) {
        wp.blocks.unregisterBlockType(blockType.name);
        continue;
      }
    }
  },
);
