import { NextResponse } from 'next/server';
import { deleteProduct, getProduct, upsertProduct, type Product } from '@/lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const product = await getProduct(id);
    return product ? NextResponse.json(product) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    console.error('GET /api/products/[id] failed', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const body = (await req.json()) as Partial<Product>;
    const { id } = await params;
    const existing = await getProduct(id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const gender = body.gender === 'men' || body.gender === 'women' ? body.gender : body.gender === undefined ? existing.gender : existing.gender;
    const category = (body.category === 'shoes' || body.category === 'bags' || body.category === 'heels' || body.category === 'slippers')
      ? body.category
      : body.category === undefined
        ? existing.category
        : existing.category;
    const updated: Product = {
      ...existing,
      ...body,
      id: existing.id,
      price: body.price !== undefined ? Number(body.price) : existing.price,
      sizes: Array.isArray(body.sizes) ? (body.sizes as string[]).map((s) => String(s).trim()).filter(Boolean) : existing.sizes || [],
      gender,
      category,
      onSale: body.onSale === undefined ? existing.onSale : body.onSale === true,
      salePrice: body.onSale === true
        ? (body.salePrice !== undefined ? Number(body.salePrice) : existing.salePrice)
        : undefined,
    };
    const saved = await upsertProduct(updated);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const existing = await getProduct(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
