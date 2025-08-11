import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNotificationContent } from './index.ts';

test('NEW_APPLICATION template de', () => {
  const content = buildNotificationContent('NEW_APPLICATION', {
    job_title: 'Gartenhilfe',
    applicant_name: 'Max',
    lang: 'de',
  });
  assert.equal(content?.email.subject, 'Neue Bewerbung für Gartenhilfe');
  assert.ok(content?.email.html?.includes('Gartenhilfe'));
  assert.ok(content?.email.html?.includes('Max'));
  assert.equal(content?.push.title, 'Neue Bewerbung');
  assert.equal(content?.push.body, 'Max hat sich beworben');
});

test('NEW_APPLICATION template en', () => {
  const content = buildNotificationContent('NEW_APPLICATION', {
    job_title: 'Gardener',
    applicant_name: 'John',
  });
  assert.equal(content?.email.subject, 'New application for Gardener');
  assert.ok(content?.email.html?.includes('Gardener'));
  assert.ok(content?.email.html?.includes('John'));
  assert.equal(content?.push.title, 'New application');
  assert.equal(content?.push.body, 'John has applied');
});

