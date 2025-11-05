import { NextResponse } from 'next/server';
import { readProducts, type PricedProduct } from '@/lib/products';
import { sanitizeText, toCsv, buildAbsoluteUrl } from '@/lib/feed/csv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const SITE_URL = process.env.SITE_URL || `${url.protocol}//${url.host}`;
        const FALLBACK_IMAGE = process.env.FALLBACK_IMAGE || '';
    const viewInlineText = url.searchParams.get('view') === '1' || url.searchParams.get('format') === 'txt';

    const products: PricedProduct[] = await readProducts();

    const header = ['id', 'title', 'image_link', 'price', 'link'];
    const rows: string[][] = [header];

    for (const p of products) {
      const rawId = (p as any)._id ?? p.id;
      const id = String(rawId);
      const title = sanitizeText(p.name ?? '', 150) || 'Untitled';
      const img0 = (Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.thumbnail ?? FALLBACK_IMAGE);
      const image_link = buildAbsoluteUrl(SITE_URL, img0 || '/images/placeholder.jpg');
      const price = `${Number(p.price ?? 0).toFixed(2)} USD`;
      const link = `${SITE_URL}/product/${encodeURIComponent(String((p as any)._id ?? id))}`;
      rows.push([id, title, image_link, price, link]);
    }

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': viewInlineText ? 'text/plain; charset=utf-8' : 'text/csv; charset=utf-8',
        'Content-Disposition': 'inline; filename="feed.csv"',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    console.error('GET /api/feed failed', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
















