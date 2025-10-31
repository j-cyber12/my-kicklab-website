import { NextResponse } from 'next/server';
import { readProducts, type PricedProduct } from '@/lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('query') || searchParams.get('q') || '').trim().toLowerCase();
    if (!q) return NextResponse.json({ items: [] });
    const products: PricedProduct[] = await readProducts();
    const items = products
      .filter((p) => p.name?.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
      .slice(0, 8)
      .map((p) => ({ id: p.id, name: p.name, imageUrl: p.thumbnail || p.images?.[0] || '/placeholder.svg' }));
    return NextResponse.json({ items });
  } catch (_err) {
    return NextResponse.json({ items: [] });
  }
}
