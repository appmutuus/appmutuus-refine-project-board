import { logger } from '../logging.js';

export async function enqueue(job) {
  logger.log('queue:add', job);
}
