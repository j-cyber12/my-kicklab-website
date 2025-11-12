import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripe) return stripe;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing STRIPE_SECRET_KEY. Set it in .env.local');
  }
  // Pin a recent API version for stability
  stripe = new Stripe(secret, {
    apiVersion: '2024-06-20',
  });
  return stripe;
}

export function getPublishableKey(): string {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
  return pk;
}

