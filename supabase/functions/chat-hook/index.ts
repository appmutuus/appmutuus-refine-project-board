import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceKey);

serve(async (req) => {
  const { record } = await req.json();
  // Trigger NEW_MESSAGE notification
  await supabase.from('notification_events').insert({
    user_id: record.recipient_id,
    type: 'NEW_MESSAGE',
    channel: 'push',
    status: 'queued'
  });
  return new Response('ok');
});
