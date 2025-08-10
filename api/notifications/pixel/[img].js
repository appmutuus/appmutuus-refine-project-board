import { logger } from '../../../lib/logging.js';

export default function handler(_req, res) {
  logger.log('pixel-open');
  const img = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABDQottAAAAABJRU5ErkJggg==',
    'base64'
  );
  res.setHeader('Content-Type', 'image/png');
  res.end(img);
}
