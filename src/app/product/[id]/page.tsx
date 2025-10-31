import { notFound } from 'next/navigation';
import { getProduct, type PricedProduct } from '@/lib/products';
import { cld } from '@/lib/images';
import AddToCartButton from '@/components/AddToCartButton';
import ProductMediaViewer from '@/components/ProductMediaViewer';
import WhatsAppCartButton from '@/components/WhatsAppCartButton';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getProduct(id)) as PricedProduct | null;
  if (!product) return notFound();

  const mainImage = cld(product.images?.[0] || product.thumbnail, 'detail');

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
        <div className="animate-fade-up">
          <ProductMediaViewer product={product} />
        </div>
        <div className="animate-fade-up animate-delay-1 md:sticky md:top-24 self-start panel p-6 md:p-7 lg:p-8">
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">{product.name}</h1>
          {(product.gender || product.category) && (
            <div className="mt-3 flex gap-2 text-[11px]">
              {product.gender && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{product.gender}</span>
              )}
              {product.category && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{product.category}</span>
              )}
            </div>
          )}
          {(Array.isArray(product.sizes) && product.sizes.length > 0) && (
            <div className="mt-4 space-y-3">
              {product.sizes?.length ? (
                <div>
                  <div className="text-sm text-zinc-500 mb-1">Sizes</div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s, i) => (
                      <span key={i} className="chip">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          {/* Details section removed per request */}
          <div className="mt-6 pt-4 border-t border-token">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-3 sm:gap-4">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{'$'}{product.price.toFixed(2)}</span>
                {product.sale && (
                  <>
                    <span className="text-lg line-through text-zinc-500">{'$'}{product.originalPrice.toFixed(2)}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-600 text-white">-{product.sale.percent}%</span>
                  </>
                )}
              </div>
              <WhatsAppCartButton
                prefill={{ id: product.id, name: product.name, price: product.price, qty: 1, imageUrl: mainImage }}
              />
              <AddToCartButton
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={mainImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

