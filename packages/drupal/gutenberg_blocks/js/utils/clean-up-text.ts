export const trim = (text: string, delimiter: string) => {
  let result = text;
  while (result.startsWith(delimiter)) {
    result = result.substring(delimiter.length);
  }
  while (result.endsWith(delimiter)) {
    result = result.substring(0, result.length - delimiter.length);
  }
  return result;
};

// Strips HTML comments, including ones that span multiple lines or are nested
// so that a naive single pass would leave a fresh `<!-- -->` behind.
const removeHtmlComments = (text: string) => {
  let result = text;
  let previous = '';
  while (result !== previous) {
    previous = result;
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }
  return result;
};

export const cleanUpText = (
  text: string,
  allowedTags?: Array<string> | 'all',
) => {
  const cleanedText = removeHtmlComments(
    text
      // When copying text from Word, HTML comments are escaped. So we get this:
      // ...<br>&lt;!-- /* Font Definitions */ @font-face {...} --&gt;<br>...
      // Unescape them back so the comment stripping can remove them.
      .replace(/&lt;!--/g, '<!--')
      .replace(/--&gt;/g, '-->'),
  );
  // If we allow all tags, we still want to trim the br tags from the text.
  if (allowedTags === 'all') {
    return trim(cleanedText, '<br>');
  }
  const regexTags: Array<string> = [];
  if (allowedTags) {
    allowedTags.map((allowedTag) => {
      regexTags.push(`(${allowedTag})`);
    });
  }
  const allowedTagsRegex = regexTags.length ? `(${regexTags.join('|')})` : '';
  const regexp = new RegExp('<(?!/?' + allowedTagsRegex + '>)[^>]*>', 'gi');
  return cleanedText.replace(regexp, '');
};
