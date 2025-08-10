import { loadStripe } from '@stripe/stripe-js';

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

if (!key) {
  console.warn('Stripe publishable key missing');
}

export const stripePromise = loadStripe(key);

export default stripePromise;
