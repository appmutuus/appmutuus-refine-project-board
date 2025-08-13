import { loadStripe } from '@stripe/stripe-js';

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

// Only initialize Stripe if we have a valid publishable key
let stripePromise: Promise<any> | null = null;

if (key && key.trim() !== '') {
  stripePromise = loadStripe(key);
} else {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY environment variable is missing or empty. Stripe functionality will be disabled.');
  stripePromise = Promise.resolve(null);
}

export { stripePromise };
export default stripePromise;
