import { logger } from '../logging.js';

const DEFAULT_FROM = process.env.EMAIL_FROM || 'Mutuus <info@mutuus-app.de>';

export async function sendEmail(payload) {
  const from = payload.from || DEFAULT_FROM;
  logger.log('email', { ...payload, from });
}
