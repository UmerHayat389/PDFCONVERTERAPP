const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fse = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const CONVERTED_DIR = path.join(__dirname, '../../converted');

/**
 * Convert image → image (JPG, PNG, WEBP, BMP, GIF)
 */
async function imageToImage(inputPath, toFormat) {
  const fmt = toFormat.toLowerCase();
  const outputName = `${uuidv4()}.${fmt}`;
  const outputPath = path.join(CONVERTED_DIR, outputName);

  const sharpFmt = fmt === 'jpg' ? 'jpeg' : fmt;

  await sharp(inputPath)[sharpFmt]({ quality: 90 }).toFile(outputPath);
  return outputName;
}

/**
 * Convert image → PDF
 */
async function imageToPDF(inputPath) {
  const outputName = `${uuidv4()}.pdf`;
  const outputPath = path.join(CONVERTED_DIR, outputName);

  // Convert to PNG buffer first (sharp handles all image types)
  const pngBuffer = await sharp(inputPath).png().toBuffer();
  const { width, height } = await sharp(inputPath).metadata();

  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(pngBuffer);

  // A4 size in points
  const A4_W = 595;
  const A4_H = 842;

  const page = pdfDoc.addPage([A4_W, A4_H]);
  const scale = Math.min(A4_W / width, A4_H / height);
  const drawW = width * scale;
  const drawH = height * scale;
  const x = (A4_W - drawW) / 2;
  const y = (A4_H - drawH) / 2;

  page.drawImage(pngImage, { x, y, width: drawW, height: drawH });

  const pdfBytes = await pdfDoc.save();
  await fse.writeFile(outputPath, pdfBytes);
  return outputName;
}

/**
 * Convert PDF → image (extracts first page via sharp's PDF support)
 * Note: sharp PDF support requires libvips compiled with poppler.
 * Falls back to returning error message if not available.
 */
async function pdfToImage(inputPath, toFormat) {
  const fmt = toFormat.toLowerCase();
  const outputName = `${uuidv4()}.${fmt}`;
  const outputPath = path.join(CONVERTED_DIR, outputName);

  try {
    const sharpFmt = fmt === 'jpg' ? 'jpeg' : fmt;
    await sharp(inputPath, { page: 0 })[sharpFmt]({ quality: 90 }).toFile(outputPath);
    return outputName;
  } catch (err) {
    throw new Error(
      'PDF to image conversion requires libvips with poppler support. ' +
      'Install: apt-get install libvips-dev poppler-utils  — ' + err.message
    );
  }
}

/**
 * Master conversion dispatcher
 */
async function convertFile(inputPath, fromFormat, toFormat) {
  const from = fromFormat.toUpperCase();
  const to = toFormat.toUpperCase();

  const IMAGE_FORMATS = ['JPG', 'JPEG', 'PNG', 'WEBP', 'BMP', 'GIF', 'IMG'];

  if (IMAGE_FORMATS.includes(from) && IMAGE_FORMATS.includes(to)) {
    return imageToImage(inputPath, to);
  }

  if (IMAGE_FORMATS.includes(from) && to === 'PDF') {
    return imageToPDF(inputPath);
  }

  if (from === 'PDF' && IMAGE_FORMATS.includes(to)) {
    return pdfToImage(inputPath, to);
  }

  throw new Error(`Unsupported conversion: ${from} → ${to}`);
}

/**
 * Clean up old files (> 1 hour)
 */
async function cleanupOldFiles() {
  const dirs = [
    path.join(__dirname, '../../uploads'),
    CONVERTED_DIR,
  ];
  const ONE_HOUR = 60 * 60 * 1000;
  for (const dir of dirs) {
    const files = await fse.readdir(dir);
    for (const file of files) {
      if (file === '.gitkeep') continue;
      const filePath = path.join(dir, file);
      const stat = await fse.stat(filePath);
      if (Date.now() - stat.mtimeMs > ONE_HOUR) {
        await fse.remove(filePath);
      }
    }
  }
}

// Auto-cleanup every 30 minutes
setInterval(cleanupOldFiles, 30 * 60 * 1000);

module.exports = { convertFile, cleanupOldFiles };