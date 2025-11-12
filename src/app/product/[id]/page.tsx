import { notFound } from 'next/navigation';
import { getProduct, type PricedProduct } from '@/lib/products';
import ProductTemplate from '@/components/ProductTemplate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getProduct(id)) as PricedProduct | null;
  if (!product) return notFound();

  return <ProductTemplate product={product} />;
}



