import { logger } from '../../lib/logging.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end();
  }
  logger.log('webhook', req.body);
  res.statusCode = 200;
  res.end('ok');
}
