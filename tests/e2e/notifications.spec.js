import { test } from 'node:test';
import assert from 'node:assert/strict';
import sendHandler from '../../api/notifications/send.js';
import { resetDedupe } from '../../lib/notify/rules.js';

function mockRes() {
  return {
    statusCode: 0,
    body: '',
    end(data) { if (data) this.body = data; },
    writeHead(code) { this.statusCode = code; },
    setHeader() {},
  };
}

test('send endpoint deduplicates second request', async () => {
  resetDedupe();
  const res1 = mockRes();
  await sendHandler({ method: 'POST', body: { type: 'JOB_ACCEPTED', user_id: 'u1' } }, res1);
  assert.ok(res1.body.includes('queued'));
  const res2 = mockRes();
  await sendHandler({ method: 'POST', body: { type: 'JOB_ACCEPTED', user_id: 'u1' } }, res2);
  assert.ok(res2.body.includes('deduped'));
});
