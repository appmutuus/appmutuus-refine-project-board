import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inQuietHours, nextSendTime, checkRateLimit, resetRateLimit, checkDedupe, resetDedupe } from '../../lib/notify/rules.js';
import { buildMessage } from '../../lib/notify/payloads.js';

const settings = { quiet_hours_start: '22:00', quiet_hours_end: '07:00' };

function date(str) { return new Date(str); }

test('quiet hours detect across midnight', () => {
  assert.equal(inQuietHours(date('2024-01-01T22:30:00Z'), settings), true);
  assert.equal(inQuietHours(date('2024-01-01T19:30:00Z'), settings), false);
});

test('next send time schedules 07:30', () => {
  const ns = nextSendTime(date('2024-01-01T22:30:00Z'), settings);
  const str = ns.toLocaleString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false });
  assert.equal(str, '07:30');
});

test('rate limit works', () => {
  resetRateLimit();
  const t = date('2024-01-01T10:00:00Z');
  assert.equal(checkRateLimit('u1', 'medium', t, 10), true);
  assert.equal(checkRateLimit('u1', 'medium', new Date(t.getTime() + 5 * 60000), 10), false);
  assert.equal(checkRateLimit('u1', 'medium', new Date(t.getTime() + 11 * 60000), 10), true);
});

test('dedupe works', () => {
  resetDedupe();
  assert.equal(checkDedupe('key1'), true);
  assert.equal(checkDedupe('key1'), false);
});

test('payload i18n with fallback', () => {
  const msg = buildMessage({ type: 'JOB_ACCEPTED', data: { helper_name: 'Max', job_title: 'Test' }, language: 'en' });
  assert.ok(msg.includes('Max'));
  assert.ok(msg.includes('Test'));
});
