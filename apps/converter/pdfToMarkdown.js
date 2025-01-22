import pdf2md from '@opendocsg/pdf2md';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateFolderName, validateAndFixMarkdown } from './utils/utils.js';

// @todo Fix this to work locally and live
const isLagoon = !!process.env.LAGOON;
const __dirname = isLagoon
  ? '/app/web/sites/default/files/converted'
  : '/tmp/converted';

export async function pdfToMarkdown(pdfPath) {
  try {
    // Validate input file exists and is a PDF
    if (!fs.existsSync(pdfPath) || !pdfPath.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid PDF file path');
    }

    // Generate output folder name
    const folderName = generateFolderName(pdfPath);
    const outputDir = path.join(__dirname, folderName);
    const imagesDir = path.join(outputDir, 'images');

    // Create output directories
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const fullMarkdown = await pdf2md(pdfBuffer);

    // const fullMarkdown = await convertToMarkdown(markdown);
    const { markdown: fixedMarkdown, warnings } =
      validateAndFixMarkdown(fullMarkdown);

    // Save markdown file
    const mdPath = path.join(outputDir, 'content.md');
    await fs.writeFile(mdPath, fixedMarkdown);

    return {
      markdownPath: mdPath,
      warnings: warnings, // You could add warnings for failed image downloads etc.
      outputDir,
    };
  } catch (error) {
    throw new Error(`PDF conversion failed: ${error.message}`);
  }
}
