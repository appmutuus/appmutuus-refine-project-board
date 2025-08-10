import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { ticket_id } = req.body as { ticket_id?: string };

  if (!ticket_id) {
    res.status(400).json({ error: 'Missing ticket_id' });
    return;
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .select('payment_intent_id, applicant_id')
    .eq('ticket_id', ticket_id)
    .single();

  if (error || !payment) {
    res.status(404).json({ error: 'Payment not found' });
    return;
  }

  await stripe.paymentIntents.capture(payment.payment_intent_id);

  await supabase
    .from('payments')
    .update({ status: 'completed' })
    .eq('ticket_id', ticket_id);

  await supabase.rpc('add_karma', {
    user_id: payment.applicant_id,
    points: 1,
  });

  res.status(200).json({ captured: true });
}
