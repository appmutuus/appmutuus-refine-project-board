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

  const { job_id, applicant_id } = req.body as {
    job_id?: string;
    applicant_id?: string;
  };

  if (!job_id || !applicant_id) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('price')
    .eq('id', job_id)
    .single();

  if (jobError || !job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', applicant_id)
    .single();

  if (profileError || !profile?.stripe_customer_id) {
    res.status(404).json({ error: 'Applicant not found' });
    return;
  }

  const amount = Math.round(Number(job.price) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    customer: profile.stripe_customer_id,
    capture_method: 'manual',
    metadata: {
      job_id,
      applicant_id,
    },
  });

  await supabase.from('payments').insert({
    job_id,
    applicant_id,
    payment_intent_id: paymentIntent.id,
    status: 'pending',
  });

  res.status(200).json({ clientSecret: paymentIntent.client_secret });
}
