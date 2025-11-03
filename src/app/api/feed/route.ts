import { NextResponse } from 'next/server';
import { readProducts } from '@/lib/products';
import { sanitizeText, toCsv, buildAbsoluteUrl } from '@/lib/feed/csv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function csvEscape(value: unknown): string {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function ensureAbsolute(url: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://luvre.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const SITE_URL = process.env.SITE_URL || `${url.protocol}//${url.host}`;
    const CURRENCY = (process.env.CURRENCY || 'USD').toUpperCase();
    const FALLBACK_IMAGE = process.env.FALLBACK_IMAGE || '';

    const products = await readProducts();

    const header = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link'];
    const rows: string[][] = [header];

    for (const p of products) {
      const id = String((p as any).id ?? (p as any)._id ?? '');
      const title = sanitizeText((p as any).name ?? '', 150);
      const description = sanitizeText((p as any).description ?? '', 5000);
      const availability = 'in stock';
      const condition = 'new';
      const priceNum = Number((p as any).price ?? 0);
      const price = `${priceNum.toFixed(2)} ${CURRENCY}`;
      const link = buildAbsoluteUrl(SITE_URL, `/product/${encodeURIComponent(id)}`);
      const img0 = (Array.isArray((p as any).images) && (p as any).images[0])
        ? (p as any).images[0]
        : ((p as any).thumbnail ?? FALLBACK_IMAGE);
      const image_link = buildAbsoluteUrl(SITE_URL, img0 || '/images/placeholder.jpg');

      rows.push([id, title, description, availability, condition, price, link, image_link]);
    }

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="feed.csv"',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    console.error('GET /api/feed failed', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
