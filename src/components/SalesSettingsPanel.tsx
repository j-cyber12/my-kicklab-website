"use client";

import { useEffect, useMemo, useState } from 'react';

type SaleWindow = { enabled?: boolean; percent?: number; startAt?: string; endAt?: string };
type FlashItem = { id: string; enabled?: boolean; percent?: number; startAt?: string; endAt?: string };
type SalesSettings = {
  global?: SaleWindow;
  categories?: Record<string, SaleWindow>;
  flash?: { items?: FlashItem[] };
  updatedAt?: string;
};

type ProductLite = { id: string; name: string };

export default function SalesSettingsPanel() {
  const [settings, setSettings] = useState<SalesSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cats = ['shoes', 'bags'] as const;
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [flashNew, setFlashNew] = useState<{ id: string; percent: number }>({ id: '', percent: 10 });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/sales-settings', { cache: 'no-store' });
        const data = await res.json();
        setSettings(data);
      } catch {
        setSettings({});
      }
      try {
        const resP = await fetch('/api/products', { cache: 'no-store' });
        const dataP = await resP.json();
        const list: ProductLite[] = Array.isArray(dataP) ? dataP.map((p: any) => ({ id: p.id, name: p.name })) : [];
        setProducts(list);
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  const globalPct = Number(settings?.global?.percent || 0);

  function updateGlobal(patch: Partial<SaleWindow>) {
    setSettings((s) => ({ ...(s || {}), global: { ...(s?.global || {}), ...patch } }));
  }
  function updateCat(cat: typeof cats[number], patch: Partial<SaleWindow>) {
    setSettings((s) => ({ ...(s || {}), categories: { ...(s?.categories || {}), [cat]: { ...(s?.categories?.[cat] || {}), ...patch } } }));
  }

  function clampPercent(n: number) {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(90, Math.round(n)));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = settings || {};
      // Normalize: clamp percents, drop empty dates
      if (payload.global) {
        payload.global.percent = clampPercent(Number(payload.global.percent || 0));
        if (!payload.global.startAt) delete (payload.global as any).startAt;
        if (!payload.global.endAt) delete (payload.global as any).endAt;
      }
      if (payload.categories) {
        for (const k of Object.keys(payload.categories)) {
          const c = payload.categories[k]!;
          c.percent = clampPercent(Number(c.percent || 0));
          if (!c.startAt) delete (c as any).startAt;
          if (!c.endAt) delete (c as any).endAt;
        }
      }
      if ((payload as any).flash && Array.isArray((payload as any).flash.items)) {
        (payload as any).flash.items = (payload as any).flash.items
          .filter((it: any) => it && it.id)
          .map((it: any) => ({
            ...it,
            percent: clampPercent(Number(it.percent || 0)),
          }));
      }
      const res = await fetch('/api/sales-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any));
        throw new Error(j?.error || 'Failed to save');
      }
      const data = await res.json();
      setSettings(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const preview100 = useMemo(() => formatPreview(100, globalPct), [globalPct]);

  const activeNow = (win?: SaleWindow) => {
    if (!win || win.enabled === false) return false;
    const pct = Number(win.percent || 0);
    if (!(pct > 0)) return false;
    const now = Date.now();
    const s = win.startAt ? Date.parse(win.startAt) : NaN;
    const e = win.endAt ? Date.parse(win.endAt) : NaN;
    if (!Number.isNaN(s) && now < s) return false;
    if (!Number.isNaN(e) && now > e) return false;
    return true;
  };

  return (
    <div className="rounded-xl border border-token p-4 surface">
      <div className="mb-2">
        <div className="font-semibold">Sales</div>
        <div className="text-xs text-zinc-500">Turn on a sale and set the discount. Prices update instantly on the website.</div>
      </div>

      {/* Sitewide Sale */}
      <div className="p-3 rounded-lg border border-token mb-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Sitewide Sale {activeNow(settings?.global) && (<span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-green-600 text-white">Live</span>)}</div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!settings?.global?.enabled} onChange={(e) => updateGlobal({ enabled: e.target.checked })} />
            On
          </label>
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[160px_auto]">
          <div>
            <label className="block text-xs mb-1">Discount %</label>
            <input type="number" min={0} max={90} value={settings?.global?.percent ?? ''} onChange={(e) => updateGlobal({ percent: clampPercent(Number(e.target.value)) })} className="w-full rounded-md border border-token bg-transparent px-3 py-2" placeholder="e.g., 20" />
          </div>
          <div className="text-xs text-zinc-500">
            Example: {preview100}
          </div>
        </div>
        <details className="mt-3">
          <summary className="text-xs text-zinc-600 cursor-pointer">Advanced (start / end)</summary>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs mb-1">Start</label>
              <input type="datetime-local" value={toLocalDT(settings?.global?.startAt)} onChange={(e) => updateGlobal({ startAt: fromLocalDT(e.target.value) })} className="w-full rounded-md border border-token bg-transparent px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs mb-1">End</label>
              <input type="datetime-local" value={toLocalDT(settings?.global?.endAt)} onChange={(e) => updateGlobal({ endAt: fromLocalDT(e.target.value) })} className="w-full rounded-md border border-token bg-transparent px-3 py-2" />
            </div>
          </div>
        </details>
      </div>

      {/* Category Sales */}
      <div className="p-3 rounded-lg border border-token">
        <div className="font-medium mb-2">Category Sales</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {cats.map((cat) => (
            <div key={cat} className="p-3 rounded-lg border border-token">
              <div className="flex items-center justify-between">
                <div className="capitalize font-medium">{cat} {activeNow(settings?.categories?.[cat]) && (<span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-green-600 text-white">Live</span>)}</div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!settings?.categories?.[cat]?.enabled} onChange={(e) => updateCat(cat, { enabled: e.target.checked })} />
                  On
                </label>
              </div>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <input type="number" min={0} max={90} value={settings?.categories?.[cat]?.percent ?? ''} onChange={(e) => updateCat(cat, { percent: clampPercent(Number(e.target.value)) })} className="rounded-md border border-token bg-transparent px-3 py-2" placeholder="%" />
                <span className="text-[11px] text-zinc-500">Example: {formatPreview(100, Number(settings?.categories?.[cat]?.percent || 0))}</span>
              </div>
              <details className="mt-2">
                <summary className="text-xs text-zinc-600 cursor-pointer">Advanced (start / end)</summary>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input type="datetime-local" value={toLocalDT(settings?.categories?.[cat]?.startAt)} onChange={(e) => updateCat(cat, { startAt: fromLocalDT(e.target.value) })} className="rounded-md border border-token bg-transparent px-3 py-2" />
                  <input type="datetime-local" value={toLocalDT(settings?.categories?.[cat]?.endAt)} onChange={(e) => updateCat(cat, { endAt: fromLocalDT(e.target.value) })} className="rounded-md border border-token bg-transparent px-3 py-2" />
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Flash Sales */}
      <div className="p-3 rounded-lg border border-token mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Flash Sales (per product)</div>
        </div>
        <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-2 items-end mb-3">
          <div>
            <label className="block text-xs mb-1">Product</label>
            <select value={flashNew.id} onChange={(e) => setFlashNew((f) => ({ ...f, id: e.target.value }))} className="w-full rounded-md border border-token bg-transparent px-3 py-2">
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Discount %</label>
            <input type="number" min={0} max={90} value={flashNew.percent} onChange={(e) => setFlashNew((f) => ({ ...f, percent: clampPercent(Number(e.target.value)) }))} className="w-full rounded-md border border-token bg-transparent px-3 py-2" />
          </div>
          <button type="button" className="px-3 py-2 rounded-full border border-token" onClick={() => {
            if (!flashNew.id) return;
            setSettings((s) => {
              const curr = s?.flash?.items || [];
              const exists = curr.find((i) => i.id === flashNew.id);
              const next = exists ? curr.map((i) => i.id === flashNew.id ? { ...i, percent: flashNew.percent, enabled: true } : i) : [...curr, { id: flashNew.id, percent: flashNew.percent, enabled: true }];
              return { ...(s || {}), flash: { items: next } } as SalesSettings;
            });
          }}>Add</button>
        </div>

        <div className="grid gap-2">
          {(settings?.flash?.items || []).map((it, idx) => {
            const prod = products.find((p) => p.id === it.id);
            return (
              <div key={`${it.id}-${idx}`} className="p-2 rounded-lg border border-token flex items-center gap-2">
                <div className="flex-1">
                  <div className="font-medium text-sm">{prod?.name || it.id}</div>
                  <div className="text-xs text-zinc-500">ID: {it.id}</div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm mr-2">
                  <input type="checkbox" checked={!!it.enabled} onChange={(e) => setSettings((s) => {
                    const list = (s?.flash?.items || []).slice();
                    list[idx] = { ...(list[idx] || it), enabled: e.target.checked } as any;
                    return { ...(s || {}), flash: { items: list } } as SalesSettings;
                  })} />
                  On
                </label>
                <input type="number" min={0} max={90} value={it.percent ?? 0} onChange={(e) => setSettings((s) => {
                  const list = (s?.flash?.items || []).slice();
                  list[idx] = { ...(list[idx] || it), percent: clampPercent(Number(e.target.value)) } as any;
                  return { ...(s || {}), flash: { items: list } } as SalesSettings;
                })} className="w-20 rounded-md border border-token bg-transparent px-2 py-1 text-sm" />
                <button type="button" className="ml-2 text-red-600 hover:text-red-700" onClick={() => setSettings((s) => {
                  const list = (s?.flash?.items || []).slice();
                  list.splice(idx, 1);
                  return { ...(s || {}), flash: { items: list } } as SalesSettings;
                })}>Remove</button>
              </div>
            );
          })}
          {!(settings?.flash?.items || []).length && (
            <div className="text-xs text-zinc-500">No flash sales added.</div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-zinc-500">{settings?.updatedAt ? `Last saved: ${new Date(settings.updatedAt).toLocaleString()}` : 'Unsaved changes'}</div>
        <button onClick={save} disabled={saving} className="px-3 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}

function toLocalDT(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${dd}T${hh}:${mm}`;
}

function fromLocalDT(local: string) {
  if (!local) return undefined;
  const d = new Date(local);
  return d.toISOString();
}

function formatPreview(base: number, pct: number) {
  const p = Math.max(0, Math.min(90, Number(pct || 0)));
  const final = (base * (1 - p / 100)).toFixed(2);
  return `${base.toFixed(2)} → ${final} (${p}% off)`;
}


