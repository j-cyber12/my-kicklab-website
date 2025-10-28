import { NextResponse } from 'next/server';
import { readProducts, upsertProduct, type Product } from '@/lib/products';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json(products);
  } catch (err) {
    console.error('GET /api/products failed', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Product>;
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const baseId = (body.id || body.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) as string;
    // Ensure unique id; append -2, -3, ... if needed
    const existingAll = await readProducts();
    let id = baseId || 'product';
    if (existingAll.some((p) => p.id === id)) {
      let i = 2;
      while (existingAll.some((p) => p.id === `${baseId}-${i}`)) i++;
      id = `${baseId}-${i}`;
    }
    // Normalize optional fields
    const gender = body.gender === 'men' || body.gender === 'women' || body.gender === 'unisex' ? body.gender : undefined;
    const category = body.category === 'shoes' || body.category === 'bags' ? body.category : undefined;

    const product: Product = {
      id,
      name: body.name!,
      price: Number(body.price),
      description: (body.description ?? ''),
      thumbnail: body.thumbnail || (body.images && body.images[0]) || '/placeholder.svg',
      images: body.images || [],
      videoUrl: body.videoUrl || '',
      sizes: Array.isArray(body.sizes) ? (body.sizes as string[]).map((s) => String(s).trim()).filter(Boolean) : [],
      gender,
      category,
    };
    const saved = await upsertProduct(product);
    return NextResponse.json(saved, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
