import crypto from 'crypto';
import fs from 'fs-extra';
import TurndownService from 'turndown';

export function validateAndFixMarkdown(markdown) {
  const warnings = [];

  // Regex to match the entire image syntax
  const imageRegex = /!\[.*?\]\(.*?\)/g;

  markdown = markdown.replace(imageRegex, (match) => {
    // Parse the components of the Markdown image syntax
    const altMatch = match.match(/!\[(.*?)\]/); // Match alt text
    const urlMatch = match.match(/\((.*?)(?=\s|$)/); // Match URL
    const titleMatch = match.match(/"([^"]*?)"\)$/); // Match title (if it exists)

    let altText = altMatch ? altMatch[1] : '';
    let url = urlMatch ? urlMatch[1] : '';
    let title = titleMatch ? titleMatch[1] : null;

    // Fix double quotes in alt text
    if (altText.includes('"')) {
      warnings.push(`Double quotes in alt text fixed: "${altText}"`);
      altText = altText.replace(/"/g, "'");
    }

    // Fix double quotes in title
    if (title && title.includes('"')) {
      warnings.push(`Double quotes in title fixed: "${title}"`);
      title = title.replace(/"/g, "'");
    }

    // Rebuild the image syntax
    return title ? `![${altText}](${url} "${title}")` : `![${altText}](${url})`;
  });

  // Trim leading and trailing whitespace
  const trimmedMarkdown = markdown.trim();
  if (markdown !== trimmedMarkdown) {
    warnings.push('Leading or trailing whitespace detected and removed.');
    markdown = trimmedMarkdown;
  }

  return { markdown, warnings };
}

export function generateFolderName(path) {
  const hash = crypto.createHash('md5').update(path).digest('hex');
  return hash.substring(0, 12);
}

export function convertToMarkdown(input) {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    hr: '---',
    bulletListMarker: '-',
    strongDelimiter: '**',
  });

  turndownService.addRule('tables', {
    filter: 'table',
    replacement: function (content, node) {
      const rows = node.querySelectorAll('tr');
      const headers = Array.from(rows[0]?.querySelectorAll('th,td') || [])
        .map((cell) => cell.textContent.trim())
        .join(' | ');

      const separator = headers
        .split('|')
        .map(() => '---')
        .join(' | ');

      const body = Array.from(rows)
        .slice(1)
        .map((row) =>
          Array.from(row.querySelectorAll('td'))
            .map((cell) => cell.textContent.trim())
            .join(' | '),
        )
        .join('\n');

      return `\n${headers}\n${separator}\n${body}\n\n`;
    },
  });
  return turndownService.turndown(input);
}
