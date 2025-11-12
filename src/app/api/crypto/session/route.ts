import { NextResponse } from 'next/server';
import { cryptoSessions, getBinance, type CryptoSession } from '@/lib/binance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  amount: number; // amount in the crypto asset units, e.g., 25 (USDT)
  asset: string; // 'USDT' | 'BTC' | 'ETH' | ...
  address: string; // your merchant deposit address
  network?: string; // optional, e.g., 'TRX', 'BSC'
  tagOrMemo?: string; // optional
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const amount = Number(body?.amount);
    const asset = String(body?.asset || '').toUpperCase();
    const address = String(body?.address || '').trim();
    const network = body?.network ? String(body.network).toUpperCase() : undefined;
    const tagOrMemo = body?.tagOrMemo ? String(body.tagOrMemo).trim() : undefined;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!asset) {
      return NextResponse.json({ error: 'Missing asset' }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: 'Missing deposit address' }, { status: 400 });
    }

    const client = getBinance();
    const deposit = await client.depositAddress({ coin: asset, network });
    const resolvedAddress = deposit?.address;
    const resolvedTag = deposit?.addressTag || deposit?.memo || tagOrMemo;
    const resolvedNetwork = deposit?.network || network;
    if (!resolvedAddress) {
      return NextResponse.json({ error: 'Binance could not provide a deposit address.' }, { status: 500 });
    }

    const id = crypto.randomUUID();
    const session: CryptoSession = {
      id,
      amount,
      asset,
      address: resolvedAddress,
      network: resolvedNetwork,
      tagOrMemo: resolvedTag,
      createdAt: Date.now(),
    };
    await cryptoSessions.set(session);

    return NextResponse.json({
      id,
      instructions: {
        asset,
        amount,
        address: resolvedAddress,
        network: resolvedNetwork,
        tagOrMemo: resolvedTag,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
