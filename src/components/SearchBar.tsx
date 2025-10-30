"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialQuery?: string;
  initialCategory?: string;
  variant?: "desktop" | "mobile";
  className?: string;
};

type Suggestion = { id: string; name: string; imageUrl?: string };

export default function SearchBar({ initialQuery = "", initialCategory = "", variant = "desktop", className = "" }: Props) {
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!q || q.trim().length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-suggestions?query=${encodeURIComponent(q)}`, { signal: ac.signal, cache: 'no-store' });
        const data = await res.json();
        setItems(Array.isArray(data?.items) ? data.items : []);
        setOpen(true);
      } catch {
        if (!ac.signal.aborted) setItems([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(id);
      ac.abort();
    };
  }, [q]);

  const containerCls = useMemo(() => (
    variant === 'mobile'
      ? "w-full flex items-stretch rounded-full bg-white text-zinc-900 overflow-hidden shadow"
      : "w-full max-w-md sm:max-w-2xl relative flex items-stretch rounded-full border border-white/50 dark:border-white/30 bg-transparent text-white overflow-hidden backdrop-blur-sm"
  ), [variant]);

  const selectCls = useMemo(() => (
    variant === 'mobile'
      ? "px-3 py-2 bg-white text-zinc-900 border-r border-zinc-200 focus:outline-none"
      : "w-28 sm:w-36 px-3 py-2 bg-white/90 text-zinc-900 border-r border-white/30 focus:outline-none"
  ), [variant]);

  const inputCls = useMemo(() => (
    variant === 'mobile'
      ? "flex-1 min-w-0 px-4 py-2 bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none"
      : "flex-1 min-w-0 px-4 py-2 bg-transparent text-white placeholder-white/70 focus:outline-none"
  ), [variant]);

  const buttonCls = useMemo(() => (
    variant === 'mobile'
      ? "px-4 py-2 bg-zinc-900 text-white font-medium"
      : "px-4 py-2 bg-transparent text-white font-medium hover:bg-white/10 transition inline-flex items-center justify-center gap-2"
  ), [variant]);

  return (
    <div className={className}>
      <div className={containerCls}>
        <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className={selectCls}>
          <option value="">All Categories</option>
          <option value="bags">Bags</option>
          <option value="heels">Heels</option>
          <option value="shoes">Shoes</option>
          <option value="slippers">Slippers</option>
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className={inputCls}
            autoComplete="off"
            onFocus={() => setOpen(items.length > 0)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {open && items.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border bg-white text-zinc-900 shadow-lg z-50 max-h-64 overflow-auto">
              {items.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 text-left"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setQ(s.name); setOpen(false); router.push(`/product/${s.id}`); }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.imageUrl || '/placeholder.svg'} alt="" className="w-8 h-8 rounded object-cover" />
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
              {loading && (
                <div className="px-3 py-2 text-sm text-zinc-500">Searchingâ€¦</div>
              )}
            </div>
          )}
        </div>
        <button type="button" className={buttonCls} onClick={() => { const params = new URLSearchParams(); if (q) params.set('q', q); if (category) params.set('category', category); window.location.href = '/?' + params.toString() + '#all'; }}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 opacity-90"><path fill="currentColor" d="M21 21 15.8 15.8M18 10.5A7.5 7.5 0 1 1 3 10.5a7.5 7.5 0 0 1 15 0Z"/></svg>
          <span className="sr-only sm:not-sr-only sm:ml-1">Search</span>
        </button>
      </div>
    </div>
  );
}


