import { logger } from '../../lib/logging.js';

export default function handler(req, res) {
  const { url } = req.query || {};
  logger.log('redirect', req.query);
  res.writeHead(302, { Location: url || '/' });
  res.end();
}
