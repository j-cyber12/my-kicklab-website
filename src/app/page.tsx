import Link from 'next/link';
import fs from 'node:fs';
import { readProducts, type Product } from '@/lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = (await (searchParams || Promise.resolve({}))) as Record<string, string | string[] | undefined>;
  const gender = typeof sp.gender === 'string' ? sp.gender : undefined;
  const category = typeof sp.category === 'string' ? sp.category : undefined;

  const products: Product[] = await readProducts();
  const filtered = products.filter((p) => (!gender || p.gender === gender) && (!category || p.category === category));
  const featured = filtered.slice(0, 5);
  const logoCandidates = [
    'public/images/kicklab-logo.svg',
    'public/images/kicklab-logo.webp',
    'public/images/kicklab-logo.png',
    'public/kicklab-logo.svg',
    'public/kicklab-logo.png',
  ];
  const found = logoCandidates.find((p) => fs.existsSync(p));
  const logoSrc = found ? found.replace(/^public/, '') : '/logo.svg';
  return (
    <div className="max-w-6xl mx-auto">
      {/* Mobile-first hero */}
      <section className="px-4 pb-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
        <div className="rounded-2xl overflow-hidden relative text-white p-5 accent-gradient">
          <div className="absolute inset-0 pointer-events-none opacity-40 shimmer" style={{backgroundImage:'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.18) 50%, rgba(255,255,255,0) 100%)'}} />
          {/* Merged header + banner (mobile) */}
          <div className="relative flex items-center justify-between sm:hidden">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="KickLab logo" className="w-7 h-7 rounded" />
              <span className="text-base font-semibold tracking-tight">KickLab</span>
            </div>
            <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full backdrop-blur border border-white/20 animate-fade-up animate-delay-2">New Season</span>
          </div>
          <h1 className="relative text-3xl font-black leading-tight mt-3 animate-fade-up animate-delay-1">Monochrome. Modern. Minimal.</h1>
          <p className="relative text-sm/relaxed opacity-90 mt-3 max-w-md animate-fade-up animate-delay-2">
            Curated sneakers for everyday comfort and statement style.
          </p>
          <div className="relative mt-4 flex gap-2 animate-fade-up animate-delay-3">
            <Link href="#all" className="px-4 py-2 rounded-full bg-white text-zinc-900 font-medium shadow-sm">Shop Now</Link>
          </div>
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl" />
        </div>
      </section>

      {/* Category chips (filterable) */}
      <section className="px-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
          {(() => {
            const chips: { label: string; href: string; g?: 'men' | 'women'; c?: 'shoes' | 'bags' }[] = [
              { label: 'All', href: '/' },
              { label: "Men's Shoes", href: '/?gender=men&category=shoes', g: 'men', c: 'shoes' },
              { label: "Women's Shoes", href: '/?gender=women&category=shoes', g: 'women', c: 'shoes' },
              { label: "Men's Bags", href: '/?gender=men&category=bags', g: 'men', c: 'bags' },
              { label: "Women's Bags", href: '/?gender=women&category=bags', g: 'women', c: 'bags' },
            ];
            return chips.map((item, i) => {
              const active = item.g ? (item.g === gender && item.c === category) : !gender && !category;
              return (
              <Link
                key={item.label}
                href={item.href}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm border hover-lift animate-fade-up ${
                  active
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                }`}
                style={{ animationDelay: `${80 * (i + 1)}ms` }}
              >
                {item.label}
              </Link>
              );
            });
          })()}
        </div>
      </section>

      {/* Featured carousel */}
      {featured.length > 0 && (
        <section className="px-4 mt-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Featured</h2>
            <Link href="#all" className="text-sm text-zinc-500">See all</Link>
          </div>
          <div className="mt-3 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 -mx-1 px-1">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="snap-start shrink-0 w-64 rounded-xl overflow-hidden border border-token surface hover-lift"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{p.name || '(Untitled)'}</div>
                    <div className="font-semibold">{'$'}{Number.isFinite(Number(p.price)) ? Number(p.price).toFixed(2) : '0.00'}</div>
                  </div>
                  {(p.gender || p.category) && (
                    <div className="mt-1 flex gap-2 text-[11px]">
                      {p.gender ? (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{p.gender}</span>
                      ) : null}
                      {p.category ? (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{p.category}</span>
                      ) : null}
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{p.description}</p>
                </div>
              </Link>
            ))}
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
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              </div>
              <div className="p-2">
                <div className="text-[13px] font-medium truncate">{p.name || '(Untitled)'}</div>
                <div className="text-[12px] text-muted truncate">{p.description}</div>
                {(p.gender || p.category) && (
                  <div className="mt-1 flex gap-2 text-[11px]">
                    {p.gender ? (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{p.gender}</span>
                    ) : null}
                    {p.category ? (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{p.category}</span>
                    ) : null}
                  </div>
                )}
                <div className="mt-1 text-sm font-semibold">{'$'}{Number.isFinite(Number(p.price)) ? Number(p.price).toFixed(2) : '0.00'}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom mobile tab bar */}
      <nav className="sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
        <div className="rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-4 py-2 flex items-center gap-6 shadow-lg">
          <Link href="/" className="flex flex-col items-center text-xs">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
            <span className="mt-1">Home</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
