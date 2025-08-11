import {
  assertEquals,
  assertStringIncludes,
} from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { buildNotificationContent } from './index.ts';

Deno.test('NEW_APPLICATION template de', () => {
  const content = buildNotificationContent('NEW_APPLICATION', {
    job_title: 'Gartenhilfe',
    applicant_name: 'Max',
    lang: 'de',
  });
  assertEquals(content?.email.subject, 'Neue Bewerbung für Gartenhilfe');
  assertStringIncludes(content?.email.html ?? '', 'Gartenhilfe');
  assertStringIncludes(content?.email.html ?? '', 'Max');
  assertEquals(content?.push.title, 'Neue Bewerbung');
  assertEquals(content?.push.body, 'Max hat sich beworben');
});

Deno.test('NEW_APPLICATION template en', () => {
  const content = buildNotificationContent('NEW_APPLICATION', {
    job_title: 'Gardener',
    applicant_name: 'John',
  });
  assertEquals(content?.email.subject, 'New application for Gardener');
  assertStringIncludes(content?.email.html ?? '', 'Gardener');
  assertStringIncludes(content?.email.html ?? '', 'John');
  assertEquals(content?.push.title, 'New application');
  assertEquals(content?.push.body, 'John has applied');
});

