import { enqueue } from '../../lib/notify/queue.js';
import { acquire } from '../../lib/notify/idempotency.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end();
  }
  const { type, user_id, data = {}, priority = 'medium', dedupe_key } = req.body || {};
  const key = dedupe_key || `${type}:${user_id}`;
  if (!acquire(key)) {
    res.statusCode = 202;
    return res.end(JSON.stringify({ deduped: true }));
  }
  await enqueue({ type, userId: user_id, payload: data });
  res.statusCode = 202;
  res.end(JSON.stringify({ queued: true }));
}
