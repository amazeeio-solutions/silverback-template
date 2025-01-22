import { extract } from '@extractus/article-extractor';
import crypto from 'crypto';
import fs from 'fs-extra';
import imageType from 'image-type';
import { JSDOM } from 'jsdom';
import { applyFixes } from 'markdownlint';
import { lint as lintSync } from 'markdownlint/sync';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  convertToMarkdown,
  generateFolderName,
  validateAndFixMarkdown,
} from './utils/utils.js';

/**
 * Extracts images from markdown content while preserving their positions
 * @param {string} markdown - Original markdown content
 * @returns {{cleanMarkdown: string, extractedImages: Array<{alt: string, url: string, position: number, placeholder: string}>}}
 */
function extractImagesWithPositions(markdown) {
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const extractedImages = [];
  let match;
  let cleanMarkdown = markdown;
  let index = 0;

  while ((match = imageRegex.exec(markdown)) !== null) {
    const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
    extractedImages.push({
      alt: match[1] || '',
      url: match[2],
      position: match.index,
      placeholder,
    });
    index++;
  }

  // Replace images with placeholders
  extractedImages.forEach((image) => {
    cleanMarkdown = cleanMarkdown.replace(
      `![${image.alt}](${image.url})`,
      image.placeholder,
    );
  });

  return {
    cleanMarkdown,
    extractedImages,
  };
}

/**
 * Reinserts images just above their original link positions
 * @param {string} markdown - Markdown content with placeholders
 * @param {Array<{alt: string, url: string, placeholder: string}>} images - Extracted images
 * @returns {string} - Markdown with images reinserted
 */
function reinsertImages(markdown, images) {
  let result = markdown;

  // Sort images by their position in reverse order to maintain correct positions
  const sortedImages = [...images].sort((a, b) => b.position - a.position);

  for (const image of sortedImages) {
    const imageMarkdown = `![${image.alt}](${image.url})\n\n`;
    const placeholderPosition = result.indexOf(image.placeholder);

    if (placeholderPosition !== -1) {
      // Find the start of the line containing the placeholder
      let lineStart = result.lastIndexOf('\n', placeholderPosition);
      lineStart = lineStart === -1 ? 0 : lineStart + 1;

      // Insert the image above the line containing the placeholder
      result =
        result.slice(0, lineStart) + imageMarkdown + result.slice(lineStart);

      // Remove the placeholder
      result = result.replace(image.placeholder, '');
    }
  }

  // Clean up any double blank lines created during the process
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

// @todo Fix this to work locally and live
const isLagoon = !!process.env.LAGOON;
const __dirname = isLagoon
  ? '/app/web/sites/default/files/converted'
  : '/tmp/converted';

async function extractMainContentFromUrl(url) {
  try {
    const mainContent = await extract(url);
    return mainContent ? mainContent.content : '';
  } catch (err) {
    console.error(err);
  }
  return '';
}

async function getImageExtension(buffer) {
  const type = await imageType(buffer);
  return type ? `.${type.ext}` : '.png';
}

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.warn(
      `Warning: Failed to download image from ${url}:`,
      error.message,
    );
    return null;
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export async function htmlToMarkdown(url) {
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL provided: ' + url);
  }

  const html = await extractMainContentFromUrl(url);
  // Generate folder name based on HTML content
  const folderName = generateFolderName(url);
  const outputDir = path.join(__dirname, folderName);
  const imagesDir = path.join(outputDir, 'images');

  await fs.ensureDir(outputDir);
  await fs.ensureDir(imagesDir);

  // Parse HTML using JSDOM
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Process images before conversion
  const images = document.querySelectorAll('img');
  const imageMap = new Map();

  for (const img of images) {
    const srcAttribute = img.getAttribute('src');
    if (!srcAttribute) continue;

    // Resolve relative URLs to absolute URLs
    const absoluteUrl = new URL(srcAttribute, url).href;

    const imageBuffer = await downloadImage(absoluteUrl);
    if (!imageBuffer) continue;

    const extension = await getImageExtension(imageBuffer);
    const filename = `image-${crypto.randomBytes(4).toString('hex')}${extension}`;
    const imagePath = path.join(imagesDir, filename);

    await fs.writeFile(imagePath, imageBuffer);
    imageMap.set(srcAttribute, path.join('images', filename));
    img.setAttribute('src', path.join('images', filename));
  }

  // Convert to Markdown
  let markdown = convertToMarkdown(document.body);

  // Clean up the markdown
  markdown = markdown
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/!\[\]\(/g, '![image](')
    .trim();

  const results = lintSync({ strings: { content: markdown } });
  const fixed = applyFixes(markdown, results.content);
  const { markdown: fixedMarkdown, warnings } = validateAndFixMarkdown(fixed);

  const { cleanMarkdown, extractedImages } =
    extractImagesWithPositions(fixedMarkdown);
  const correctedMarkdown = reinsertImages(cleanMarkdown, extractedImages);

  const fixEmptyMarkdownLinks = (markdown) => {
    // Regular expression to match markdown links with empty URL but with title
    // Captures: []("title")
    const emptyLinkRegex = /\[\]\(([^)]+)\s+"([^"]+)"\)/g;

    // Replace empty links with their title text as link text
    return markdown.replace(emptyLinkRegex, (match, url, title) => {
      return `[${title}](${url} "${title}")`;
    });
  };

  const fixedLinksMarkdown = fixEmptyMarkdownLinks(correctedMarkdown);

  // Save markdown file
  const mdPath = path.join(outputDir, 'content.md');
  await fs.writeFile(mdPath, fixedLinksMarkdown);

  return {
    markdownPath: mdPath,
    warnings: warnings,
    outputDir,
  };
}
