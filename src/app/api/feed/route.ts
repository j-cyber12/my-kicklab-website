import { NextResponse } from 'next/server';
import { readProducts } from '@/lib/products';

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

export async function GET() {
  try {
    const products = await readProducts();

    const header = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'link',
      'image_link',
    ].join(',');

    const rows = products.map((p) => {
      const id = p.id;
      const title = p.name;
      const description = p.description || '';
      const availability = 'in stock';
      const condition = 'new';
      const price = `${Number(p.price).toFixed(2)} USD`;
      const link = `https://luvre.onrender.com/product/${encodeURIComponent(p.id)}`;
      const image = ensureAbsolute((Array.isArray(p.images) && p.images[0]) || p.thumbnail || '');

      return [
        csvEscape(id),
        csvEscape(title),
        csvEscape(description),
        csvEscape(availability),
        csvEscape(condition),
        csvEscape(price),
        csvEscape(link),
        csvEscape(image),
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
      },
    });
  } catch (err) {
    console.error('GET /api/feed failed', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

