import fs from 'fs-extra';
import { applyFixes } from 'markdownlint';
import { lint as lintSync } from 'markdownlint/sync';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateFolderName, validateAndFixMarkdown } from './utils/utils.js';

const isLagoon = !!process.env.LAGOON;
const __filename = fileURLToPath(import.meta.url);
const __dirname = isLagoon
  ? '/app/web/sites/default/files/converted'
  : path.dirname(__filename);

export async function fetchContentJinaAi(url) {
  const apiKey =
    process.env.JINA_AI_API_KEY ||
    'jina_c436e2d8a5474a71b232f4286de387d6n0MVWKn1aOY3BNfVGE0gJH300OI0';

  try {
    // Encode the URL to handle special characters
    const encodedUrl = encodeURIComponent(url);

    // Make the request to the Jina API
    const response = await fetch(`https://r.jina.ai/${encodedUrl}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse and return the response
    const fetchedContent = await response.json();

    const folderName = generateFolderName(url);
    const outputDir = path.join(__dirname, folderName);
    const imagesDir = path.join(outputDir, 'images');

    await fs.ensureDir(outputDir);
    await fs.ensureDir(imagesDir);

    let markdown = fetchedContent?.data.content || '';

    // Clean up the markdown
    markdown = markdown
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/!\[\]\(/g, '![image](')
      .trim();

    const results = lintSync({ strings: { content: markdown } });
    const fixed = applyFixes(markdown, results.content);
    const { markdown: fixedMarkdown, warnings } = validateAndFixMarkdown(fixed);

    const fixEmptyMarkdownLinks = (markdown) => {
      // Regular expression to match markdown links with empty URL but with title
      // Captures: []("title")
      const emptyLinkRegex = /\[\]\(([^)]+)\s+"([^"]+)"\)/g;

      // Replace empty links with their title text as link text
      return markdown.replace(emptyLinkRegex, (match, url, title) => {
        return `[${title}](${url} "${title}")`;
      });
    };

    const fixedLinksMarkdown = fixEmptyMarkdownLinks(fixedMarkdown);

    const mdPath = path.join(outputDir, 'content.md');
    await fs.writeFile(mdPath, fixedLinksMarkdown);

    return {
      markdownPath: mdPath,
      warnings: warnings,
      outputDir,
    };
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}
