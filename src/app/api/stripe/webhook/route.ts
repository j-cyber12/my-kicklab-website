import type Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const stripe = getStripe();

  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // If no webhook secret configured, accept the event to avoid failing deployments
  if (!webhookSecret) {
    try {
      const evt = await req.json();
      console.warn('[stripe] STRIPE_WEBHOOK_SECRET not set; accepting event type:', evt?.type);
      return NextResponse.json({ received: true });
    } catch {
      return NextResponse.json({ received: true });
    }
  }

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const text = await req.text();
    event = stripe.webhooks.constructEvent(text, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle success (e.g., fulfill order)
        break;
      case 'payment_intent.payment_failed':
        // Handle failure
        break;
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[stripe] webhook handler error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}


