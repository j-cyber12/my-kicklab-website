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
      ? "w-full flex items-center h-14 rounded-2xl bg-white border border-zinc-200 shadow-[0_20px_60px_rgba(15,23,42,0.12)] overflow-hidden px-2"
      : "w-full max-w-3xl relative flex items-center h-16 rounded-[34px] bg-white text-zinc-900 border border-zinc-200 shadow-[0_25px_70px_rgba(15,23,42,0.25)] px-3"
  ), [variant]);

  const selectCls = useMemo(() => (
    variant === 'mobile'
      ? "px-3 py-2 bg-transparent text-zinc-900 border-r border-zinc-200 focus:outline-none h-full flex items-center text-sm font-semibold"
      : "w-28 sm:w-36 px-3 py-2 bg-transparent text-zinc-900 border-r border-zinc-200 focus:outline-none h-full flex items-center text-sm font-semibold"
  ), [variant]);

  const inputCls = useMemo(() => (
    variant === 'mobile'
      ? "flex-1 min-w-0 px-4 py-2 bg-transparent text-zinc-900 placeholder-zinc-500 focus:outline-none h-full flex items-center text-sm"
      : "flex-1 min-w-0 px-4 py-2 bg-transparent text-zinc-900 placeholder-zinc-400 focus:outline-none h-full flex items-center text-sm"
  ), [variant]);

  const buttonCls = useMemo(() => (
    variant === 'mobile'
      ? "px-5 py-2 bg-gradient-to-r from-indigo-600 to-fuchsia-500 text-white font-semibold shadow-lg h-full flex items-center justify-center gap-2 tracking-wide"
      : "px-5 py-2 border border-zinc-200 bg-zinc-900 text-white font-semibold inline-flex items-center justify-center gap-2 rounded-full shadow-lg transition-transform duration-200 hover:-translate-y-0.5 h-full tracking-wide"
  ), [variant]);

  const SearchIcon = () => (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
      <path
        d="M11 4a7 7 0 1 0 5.657 11.657l4.829 4.828a1 1 0 0 0 1.414-1.415l-4.828-4.828A7 7 0 0 0 11 4zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"
        fill="currentColor"
      />
    </svg>
  );

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
          <SearchIcon />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </div>
  );
}


