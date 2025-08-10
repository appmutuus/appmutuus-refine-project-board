import { logger } from '../logging.js';

export async function sendPush(token, payload) {
  logger.log('push', token, payload);
}
