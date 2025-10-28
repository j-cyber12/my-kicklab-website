import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/products';
import { cld } from '@/lib/images';

export const runtime = 'nodejs';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4 animate-fade-up">
          <div className="rounded-xl overflow-hidden border border-token bg-black">
            {product.videoUrl ? (
              <video controls className="w-full h-auto" poster={cld(product.images?.[0] || product.thumbnail, 'detail')}>
                <source src={product.videoUrl} type="video/mp4" />
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cld(product.images?.[0] || product.thumbnail, 'detail')} alt={product.name} className="w-full h-auto" />
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.slice(1).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={cld(img, 'gallery')} alt={`${product.name} ${i + 2}`} className="rounded-lg border border-token object-cover w-full h-full" />
              ))}
            </div>
          )}
        </div>
        <div className="animate-fade-up animate-delay-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{product.name}</h1>
          <p className="mt-3 text-muted">{product.description}</p>
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
          {(product.sizes?.length) && (
            <div className="mt-4 space-y-3">
              {product.sizes?.length ? (
                <div>
                  <div className="text-sm text-zinc-500 mb-1">Sizes</div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full elevated border border-token text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-2xl font-bold">{'$'}{product.price.toFixed(2)}</span>
            <a
              href="https://wa.me/message/ZC23PRNRWILSN1"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-full accent-gradient text-white font-medium shadow hover:opacity-90 transition-opacity"
            >
              Buy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
