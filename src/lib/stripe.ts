import Stripe from 'stripe';

const key = import.meta.env.VITE_STRIPE_SECRET_KEY as string;

if (!key) {
  console.warn('Stripe secret key missing');
}

export const stripe = new Stripe(key || '', { apiVersion: '2022-11-15' });

export default stripe;
