import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, startTimer } from '../../lib/timer.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('timer triggers expiration', async () => {
  let called = false;
  const stop = startTimer(new Date(), 0.01, () => {
    called = true;
  });
  await wait(1100); // allow interval tick and expiration
  stop();
  assert.equal(called, true);
});

test('should format time', () => {
  assert.equal(formatTime(3661000), '1h 1m');
});
