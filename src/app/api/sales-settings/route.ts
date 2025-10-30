import { NextResponse } from 'next/server';
import { readSalesSettings, writeSalesSettings, type SalesSettings } from '@/lib/sales';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await readSalesSettings();
    return NextResponse.json(settings, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('GET /api/sales-settings failed', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Simple cookie check to ensure only logged-in admin can update
    const hdr = req.headers.get('cookie') || '';
    const hasCookie = /(?:^|;\s*)admin_auth=ok(?:;|$)/.test(hdr);
    if (!hasCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await req.json()) as SalesSettings;
    const saved = await writeSalesSettings(body || {});
    return NextResponse.json(saved);
  } catch (err) {
    console.error('POST /api/sales-settings failed', err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

