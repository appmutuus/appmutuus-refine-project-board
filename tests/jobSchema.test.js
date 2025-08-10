import { test } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  mode: z.enum(['goodDeeds', 'paid']),
  price: z.number().positive().optional(),
  category: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  timeLimit: z.number().int().positive().optional(),
  deadline: z.date().optional(),
}).superRefine((data, ctx) => {
  if (data.mode === 'paid' && typeof data.price !== 'number') {
    ctx.addIssue({ code: 'custom', path: ['price'], message: 'Price required for paid jobs' });
  }
  if (!data.timeLimit && !data.deadline) {
    ctx.addIssue({ code: 'custom', path: ['timeLimit'], message: 'Provide time limit or deadline' });
  }
});

test('paid jobs require price', () => {
  const res = schema.safeParse({
    title: 'hello world',
    description: 'a'.repeat(20),
    mode: 'paid',
    category: 'cat',
    latitude: 1,
    longitude: 1,
    timeLimit: 30,
  });
  assert.ok(!res.success);
});

