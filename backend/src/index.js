require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fse = require('fs-extra');

const conversionRoutes = require('./routes/conversion');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload/converted dirs exist
fse.ensureDirSync(path.join(__dirname, '..', 'uploads'));
fse.ensureDirSync(path.join(__dirname, '..', 'converted'));

// Security & logging
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Rate limiting
app.use('/api/convert', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again later.' },
}));

// Serve converted files for download
app.use('/download', express.static(path.join(__dirname, '..', 'converted')));

// Routes
app.use('/api', conversionRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PDF Converter backend running on http://0.0.0.0:${PORT}`);
});