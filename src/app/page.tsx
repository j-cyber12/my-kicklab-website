import Link from 'next/link';
import { readProducts, type PricedProduct } from '@/lib/products';
import ProductThumbCarousel from '@/components/ProductThumbCarousel';
import CartButton from '@/components/CartButton';
import SaleProductsCarousel from '@/components/SaleProductsCarousel';
import SearchBar from '@/components/SearchBar';
import HeelsProductsCarousel from '@/components/HeelsProductsCarousel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = (await (searchParams || Promise.resolve({}))) as Record<string, string | string[] | undefined>;
  const genderFilter = typeof sp.gender === 'string' ? sp.gender : undefined;
  const categoryFilter = typeof sp.category === 'string' ? sp.category : undefined;
  
  const q = typeof sp.q === 'string' ? sp.q : '';
  
  const saleParam = typeof sp.sale === 'string' ? sp.sale : undefined;
  const saleOnly = saleParam === '1' || saleParam === 'true';

  const products: PricedProduct[] = await readProducts();
  const qLower = q.trim().toLowerCase();
  const matchesText = (p: PricedProduct) => !qLower || p.name.toLowerCase().includes(qLower) || (p.description || '').toLowerCase().includes(qLower);
  const filtered = products.filter((p) => (!genderFilter || p.gender === genderFilter)
    && (!categoryFilter || p.category === categoryFilter)
    && (!saleOnly || !!p.sale)
    && matchesText(p)
  );
  const slippers = products.filter((p) => p.category === 'slippers');
  const heels = products.filter((p) => p.category === 'heels');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="hidden sm:block">
        <CartButton />
      </div>

      {/* Hero banner */}
      <section className="px-4 pb-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
        <div
          className="rounded-2xl overflow-hidden relative text-white p-8 sm:p-12 md:p-16"
          style={{
            background:
              'radial-gradient(80% 60% at 70% 10%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%), linear-gradient(180deg, #2a174b 0%, #1b1033 100%)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage:'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.15) 50%, rgba(255,255,255,0) 100%)'}} />
          <div className="relative min-h-[46vh] md:min-h-[60vh] grid place-items-center text-center">
            <div>
              <div style={{ fontFamily: 'var(--font-playfair)' }} className="font-black tracking-wide">
                <h1 className="text-4xl sm:text-5xl md:text-7xl leading-none">Luvre</h1>
              </div>
              <p className="mt-4 text-xs sm:text-sm tracking-[0.35em] uppercase opacity-90">Walk With Elegance</p>
              <div className="mt-6">
                <Link href="/?sale=1#all" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-900 font-medium shadow-sm hover:shadow transition">
                  View All
                </Link>
              </div>
              <div className="mt-5 hidden sm:block px-4">
                <SearchBar initialQuery={q} initialCategory={categoryFilter || ''} variant="desktop" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
        </div>
      </section>

      {/* Mobile search (only on phones) */}
      <section className="px-4 sm:hidden mt-4">
        <SearchBar initialQuery={q} initialCategory={categoryFilter || ''} variant="mobile" />
      </section>

      {/* Active sale banner */}
      {/* (() => {
        const now = Date.now();
        const parts: string[] = [];
        function active(win?: { enabled?: boolean; percent?: number; startAt?: string; endAt?: string }) {
          if (!win || win.enabled === false || !(win.percent && win.percent > 0)) return false;
          const s = win.startAt ? Date.parse(win.startAt) : NaN;
          const e = win.endAt ? Date.parse(win.endAt) : NaN;
          if (!Number.isNaN(s) && now < s) return false;
          if (!Number.isNaN(e) && now > e) return false;
          return true;
        }
        if (active(sales?.global)) parts.push(`Sitewide ${sales.global!.percent}% off`);
        const cats = sales?.categories || {};
        for (const key of Object.keys(cats)) {
          if (active(cats[key])) parts.push(`${key[0].toUpperCase()}${key.slice(1)} ${cats[key]!.percent}% off`);
        }
        const flashItems = Array.isArray(sales?.flash?.items) ? sales.flash!.items! : [];
        const activeFlash = flashItems.filter((it) => active(it));
        if (activeFlash.length > 0) parts.push(`${activeFlash.length} flash ${activeFlash.length === 1 ? 'deal' : 'deals'}`);
        if (!parts.length) return null;
        return (
          <section className="px-4 mt-3">
            <div className="rounded-xl border border-token surface p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">%</span>
                <div className="text-sm font-medium">{parts.join(' • ')}</div>
              </div>
              <Link href="#all" className="text-sm text-blue-600 hover:underline">Shop deals</Link>
            </div>
          </section>
        );
      })()*/}

      
      {/* Slippers animated carousel */}
      {slippers.length > 0 && (
        <section className="px-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Slippers</h2>
            <Link href="/?category=slippers#all" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <SaleProductsCarousel
            items={slippers.map((p) => ({ id: p.id, name: p.name, imageUrl: (p.thumbnail || p.images?.[0] || '/placeholder.svg') as string }))}
          />
        </section>
      )}

      {/* Heels Collection - product-style cards in animated marquee */}
      {heels.length > 0 && (
        <section className="px-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Heels Collection</h2>
          </div>
          {/* Animated row similar to slippers but with rectangular product cards */}
          <HeelsProductsCarousel items={heels} />
          <div className="text-center mt-4">
            <Link href="/?category=heels#all" className="view-all-heels">View All Heels</Link>
          </div>
        </section>
      )}

      {/* All products grid */}
      <section id="all" className="px-4 mt-6 pb-24">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">All Products</h2>
          <span className="text-sm text-zinc-500">{filtered.length} items</span>
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="group rounded-xl overflow-hidden border border-token surface hover-lift"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {p.sale && (
                  <span className="absolute top-2 left-2 z-10 text-[10px] font-semibold px-2 py-1 rounded-full bg-red-600 text-white shadow">Sale</span>
                )}
                <ProductThumbCarousel product={p} preset="grid" />
              </div>
              <div className="p-2">
                <div className="text-[13px] font-medium truncate">{p.name || '(Untitled)'}</div>
                {/* gender/category chips removed per request */}
                <div className="mt-1 text-sm font-semibold flex items-center gap-2">
                  {'$'}{Number.isFinite(Number(p.price)) ? Number(p.price).toFixed(2) : '0.00'}
                  {p.sale && (
                    <>
                      <span className="text-xs line-through text-zinc-500">{'$'}{Number(p.originalPrice).toFixed(2)}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-600 text-white">-{p.sale.percent}%</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <nav className="sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
        <div className="rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-4 py-2 flex items-center gap-6 shadow-lg">
          <CartButton variant="inline" />
        </div>
      </nav>
    </div>
  );
}






















