const express = require('express');
const path = require('path');
const fse = require('fs-extra');
const upload = require('../middleware/upload');
const { convertFile } = require('../services/conversionService');

const router = express.Router();

router.post('/convert', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { fromFormat, toFormat } = req.body;
  if (!fromFormat || !toFormat) {
    return res.status(400).json({ error: 'fromFormat and toFormat are required' });
  }

  const inputPath = req.file.path;

  try {
    const outputName = await convertFile(inputPath, fromFormat, toFormat);
    const outputPath = path.join(__dirname, '../../converted', outputName);
    const stat = await fse.stat(outputPath);

    // Use env variable in production, fallback for local
    const BASE_URL = process.env.BASE_URL || `http://${req.hostname}:${process.env.PORT || 3000}`;

    res.json({
      success: true,
      fileName: outputName,
      fileSize: stat.size,
      downloadUrl: `${BASE_URL}/download/${outputName}`,
      previewUrl: isImageFormat(toFormat)
        ? `${BASE_URL}/download/${outputName}`
        : null,
    });
  } catch (err) {
    next(err);
  } finally {
    fse.remove(inputPath).catch(() => {});
  }
});

router.get('/formats', (_req, res) => {
  res.json({
    supported: [
      { from: 'PNG',  to: 'JPG'  },
      { from: 'PNG',  to: 'WEBP' },
      { from: 'PNG',  to: 'PDF'  },
      { from: 'JPG',  to: 'PNG'  },
      { from: 'JPG',  to: 'WEBP' },
      { from: 'JPG',  to: 'PDF'  },
      { from: 'WEBP', to: 'JPG'  },
      { from: 'WEBP', to: 'PNG'  },
      { from: 'IMG',  to: 'PDF'  },
      { from: 'PDF',  to: 'PNG'  },
      { from: 'PDF',  to: 'JPG'  },
    ],
  });
});

function isImageFormat(fmt) {
  return ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(
    fmt.toLowerCase()
  );
}

module.exports = router;