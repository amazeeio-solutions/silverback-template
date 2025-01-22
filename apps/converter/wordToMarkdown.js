import crypto from 'crypto';
import fs from 'fs-extra';
import imageType from 'image-type';
import mammoth from 'mammoth';
import path from 'path';
import { fileURLToPath } from 'url';

import { convertToMarkdown, generateFolderName } from './utils/utils.js';

// @todo Fix this to work locally and live
const isLagoon = !!process.env.LAGOON;
const __dirname = isLagoon
  ? '/app/web/sites/default/files/converted'
  : '/tmp/converted'; // Local only

async function getImageExtension(buffer) {
  const type = await imageType(buffer);
  return type ? `.${type.ext}` : '.png';
}

export async function wordToMarkdown(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist: ' + filePath);
  }

  const folderName = generateFolderName(filePath);
  const outputDir = path.join(__dirname, folderName);
  const imagesDir = path.join(outputDir, 'images');

  await fs.ensureDir(outputDir);
  await fs.ensureDir(imagesDir);

  const options = {
    convertImage: mammoth.images.imgElement(async (image) => {
      const imageBuffer = await image.read();
      const extension = await getImageExtension(imageBuffer);
      const filename = `image-${crypto.randomBytes(4).toString('hex')}${extension}`;
      const imagePath = path.join(imagesDir, filename);

      await fs.writeFile(imagePath, imageBuffer);

      return {
        src: path.join('images', filename),
      };
    }),
  };

  const result = await mammoth.convertToHtml({ path: filePath }, options);

  let markdown = convertToMarkdown(result.value);

  markdown = markdown
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/!\[\]\(/g, '![image](')
    .trim();

  const mdPath = path.join(outputDir, 'content.md');
  await fs.writeFile(mdPath, markdown);

  return {
    markdownPath: mdPath,
    warnings: result.messages,
    outputDir,
  };
}
