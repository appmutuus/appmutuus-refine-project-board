import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceKey);

serve(async () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: expiring } = await supabase
    .from('jobs')
    .select('id, creator_id, title, due_date')
    .eq('status', 'open')
    .gt('due_date', now.toISOString())
    .lte('due_date', tomorrow.toISOString());

  if (expiring) {
    for (const job of expiring) {
      await supabase.from('notification_events').insert({
        user_id: job.creator_id,
        channel: 'push',
        type: 'JOB_EXPIRING',
        status: 'queued',
        meta: { job_id: job.id, title: job.title }
      });
    }
  }

  const { data: expired } = await supabase
    .from('jobs')
    .select('id, creator_id, title')
    .eq('status', 'open')
    .lte('due_date', now.toISOString());

  if (expired) {
    for (const job of expired) {
      await supabase.from('jobs').delete().eq('id', job.id);
      await supabase.from('notification_events').insert({
        user_id: job.creator_id,
        channel: 'push',
        type: 'JOB_REMOVED',
        status: 'queued',
        meta: { job_id: job.id, title: job.title }
      });
    }
  }

  return new Response('ok');
});
