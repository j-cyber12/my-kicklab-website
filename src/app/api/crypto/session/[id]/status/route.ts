import { NextResponse } from 'next/server';
import { cryptoSessions, getBinance } from '@/lib/binance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DepositRecord = {
  amount: string | number;
  coin?: string;
  network?: string;
  address?: string;
  addressTag?: string;
  txId?: string;
  insertTime?: number;
  status: number; // 0: pending, 1: success
};

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const session = await cryptoSessions.get(id);
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const client = getBinance();
    const startTime = session.createdAt - 1000 * 60 * 30; // 30 min buffer
    const now = Date.now();
    const history = (await client.depositHistory({ coin: session.asset, startTime, endTime: now })) as unknown as DepositRecord[];

    const matches = (history || []).filter((d: DepositRecord) => {
      const okAddr = session.address ? (String(d.address || '').toLowerCase() === session.address.toLowerCase()) : true;
      const memoField = (d.addressTag || '') + ' ' + (d.network || '');
      const okMemo = session.tagOrMemo ? memoField.toLowerCase().includes(session.tagOrMemo.toLowerCase()) : true;
      const okAmt = Number(d.amount) >= Number(session.amount) - 1e-8;
      const okStatus = Number(d.status) === 1;
      return okAddr && okMemo && okAmt && okStatus;
    });

    if (matches.length > 0) {
      return NextResponse.json({
        status: 'paid',
        confirmations: matches.map((m) => ({ txId: m.txId, amount: m.amount, network: m.network, insertTime: m.insertTime })),
      });
    }

    return NextResponse.json({ status: 'pending' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}