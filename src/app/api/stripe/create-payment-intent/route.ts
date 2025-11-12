import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  amount: number; // in the smallest currency unit (e.g., cents)
  currency?: string; // default 'usd'
  description?: string;
  receipt_email?: string;
  metadata?: Record<string, string>;
};

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = (await req.json()) as Body;

    const amount = Number(body?.amount);
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const currency = (body?.currency || 'usd').toLowerCase();

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: body?.description,
      receipt_email: body?.receipt_email,
      metadata: body?.metadata,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: intent.client_secret }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

