
"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';

export const dynamic = 'force-dynamic';

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  thumbnail: string;
  images: string[];
  videoUrl?: string;
  sizes?: string[];
  gender?: 'men' | 'women';
  category?: 'shoes' | 'bags';
};

type Draft = {
  id: string;
  name: string;
  price: string;
  description: string;
  gender: '' | 'men' | 'women';
  category: '' | 'shoes' | 'bags';
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name-asc' | 'price-asc' | 'price-desc'>('name-asc');
  const [filterGender, setFilterGender] = useState<'' | 'men' | 'women'>('');
  const [filterCategory, setFilterCategory] = useState<'' | 'shoes' | 'bags'>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ id: '', name: '', price: '', description: '', gender: '', category: '' });
  const [images, setImages] = useState<(string | File)[]>([]);
  const [video, setVideo] = useState<string | File | null>(null);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const isBrowserFile = (x: unknown): x is File => typeof File !== 'undefined' && x instanceof File;

  // Simple inline validation for better UX
  const priceNumber = parseFloat(draft.price || '');
  const priceError = draft.price !== '' && (Number.isNaN(priceNumber) || priceNumber < 0) ? 'Enter a valid price' : null;
  const nameError = draft.name.trim() === '' ? 'Name is required' : null;
  const formInvalid = !!nameError || !!priceError;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load');
      const data = (await res.json()) as Product[];
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
      showToast('Could not load products');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Prevent background scroll when modal is open (mobile/laptop)
  useEffect(() => {
    if (modalOpen && typeof document !== 'undefined') {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [modalOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchesGender = !filterGender || p.gender === filterGender;
      const matchesCategory = !filterCategory || p.category === filterCategory;
      return matchesQuery && matchesGender && matchesCategory;
    });
    // Remove duplicates by stable key (product id) to avoid duplicate cards
    const seen = new Set<string>();
    list = list.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    list = list.sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'price-asc') return a.price - b.price;
      return b.price - a.price;
    });
    return list;
  }, [products, query, sort, filterGender, filterCategory]);

  function openCreate() {
    setEditingId(null);
    setDraft({ id: '', name: '', price: '', description: '', gender: '', category: '' });
    setImages([]);
    setVideo(null);
    setSizes([]);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setDraft({
      id: p.id,
      name: p.name,
      price: String(p.price),
      description: p.description,
      gender: p.gender || '',
      category: p.category || '',
    });
    setImages(p.images || []);
    setVideo(p.videoUrl || null);
    setSizes(p.sizes || []);
    setModalOpen(true);
  }

  async function duplicate(p: Product) {
    const base = `${p.name} Copy`;
    const body = {
      name: base,
      price: p.price,
      description: p.description,
      thumbnail: p.thumbnail,
      images: p.images,
      videoUrl: p.videoUrl,
      sizes: p.sizes,
      gender: p.gender,
      category: p.category,
    };
    const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      showToast('Product duplicated');
      await load();
    } else {
      showToast('Failed to duplicate');
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name || !draft.price || !draft.description) {
      showToast('Please fill required fields');
      return;
    }
    setSaving(true);
    const imageFiles = images.filter((i) => isBrowserFile(i)) as File[];
    const imageUrls = images.filter((i) => !isBrowserFile(i)) as string[];
    let uploadedImageUrls: string[] = [];
    if (imageFiles.length) {
      const fd = new FormData();
      for (const f of imageFiles) fd.append('files', f);
      const resUp = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!resUp.ok) {
        setSaving(false);
        showToast('Image upload failed');
        return;
      }
      const { files } = await resUp.json();
      uploadedImageUrls = files as string[];
    }

    let videoUrl: string = typeof video === 'string' ? (video as string) : '';
    if (video && isBrowserFile(video)) {
      const fd = new FormData();
      fd.append('files', video);
      const resUpV = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!resUpV.ok) {
        setSaving(false);
        showToast('Video upload failed');
        return;
      }
      const { files } = await resUpV.json();
      videoUrl = (files as string[])[0] || '';
    }

    const finalImages = [...imageUrls, ...uploadedImageUrls];
    const payload = {
      id: draft.id || undefined,
      name: draft.name.trim(),
      price: parseFloat(draft.price),
      description: draft.description.trim(),
      thumbnail: finalImages[0] || '/placeholder.svg',
      images: finalImages,
      videoUrl,
      sizes,
      gender: draft.gender || undefined,
      category: draft.category || undefined,
    };
    let ok = false;
    if (editingId) {
      const res = await fetch(`/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      ok = res.ok;
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      ok = res.ok;
    }
    setSaving(false);
    if (ok) {
      setModalOpen(false);
      showToast('Saved');
      await load();
    } else {
      showToast('Failed to save');
    }
  }

  function remove(id: string) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    const res = await fetch(`/api/products/${confirmDeleteId}`, { method: 'DELETE' });
    setConfirmDeleteId(null);
    if (res.ok) {
      showToast('Deleted');
      await load();
    } else {
      showToast('Failed to delete');
    }
  }

  const preview: Product | null = useMemo(() => {
    if (!modalOpen) return null;
    const price = parseFloat(draft.price || '0') || 0;
    return {
      id: draft.id || slugify(draft.name || 'new'),
      name: draft.name || 'Product Name',
      price,
      description: draft.description || 'Description preview',
      thumbnail: images[0]
        ? (typeof File !== 'undefined' && images[0] instanceof File && typeof URL !== 'undefined')
          ? URL.createObjectURL(images[0])
          : (images[0] as string)
        : '/placeholder.svg',
      images: images.map((i) => (typeof File !== 'undefined' && i instanceof File && typeof URL !== 'undefined') ? URL.createObjectURL(i) : (i as string)),
      videoUrl: video
        ? (typeof File !== 'undefined' && video instanceof File && typeof URL !== 'undefined')
          ? URL.createObjectURL(video)
          : (video as string)
        : '',
      sizes,
      gender: draft.gender || undefined,
      category: draft.category || undefined,
    };
  }, [draft, images, video, sizes, modalOpen]);

  const total = products.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin</h1>
          <p className="text-sm text-zinc-500">Manage products, images and videos</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium shadow hover:opacity-90 transition-opacity">Add Product</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-token p-4 surface">
          <div className="text-xs uppercase text-zinc-500">Total Products</div>
          <div className="text-2xl font-bold mt-1">{total}</div>
        </div>
        <div className="rounded-xl border border-token p-4 surface">
          <div className="text-xs uppercase text-zinc-500">Average Price</div>
          <div className="text-2xl font-bold mt-1">{'$'}{(total ? products.reduce((sum, p) => sum + p.price, 0) / total : 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 rounded-full border border-zinc-300/80 dark:border-zinc-700/80 px-3 py-1.5 bg-white dark:bg-zinc-900 w-full sm:w-80">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60"><path d="M21 21L15.8 15.8M18 10.5C18 14.0899 15.0899 17 11.5 17C7.91015 17 5 14.0899 5 10.5C5 6.91015 7.91015 4 11.5 4C15.0899 4 18 6.91015 18 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="bg-transparent outline-none flex-1" />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'name-asc' | 'price-asc' | 'price-desc')}
          className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm"
        >
          <option value="name-asc">Sort: Name</option>
          <option value="price-asc">Sort: Price (Low → High)</option>
          <option value="price-desc">Sort: Price (High → Low)</option>
        </select>
        <select
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value as '' | 'men' | 'women')}
          className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm"
        >
          <option value="">All Genders</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as '' | 'shoes' | 'bags')}
          className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm"
        >
          <option value="">All Categories</option>
          <option value="shoes">Shoes</option>
          <option value="bags">Bags</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-500">
          No products match your search or filters.
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => { setQuery(''); setFilterGender(''); setFilterCategory(''); }} className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700">Reset filters</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-xl overflow-hidden border border-token surface group hover-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail} alt={p.name} className="w-full h-40 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.name || '(Untitled)'}</div>
                  <div className="text-xs text-zinc-500">{p.id}</div>
                </div>
                <div className="font-semibold">{'$'}{Number.isFinite(Number(p.price)) ? Number(p.price).toFixed(2) : '0.00'}</div>
              </div>
              {(p.gender || p.category) && (
                <div className="mt-2 flex gap-2 text-[11px]">
                  {p.gender && (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{p.gender}</span>
                  )}
                  {p.category && (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{p.category}</span>
                  )}
                </div>
              )}
              <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-3 mt-4 text-sm">
                <button onClick={() => openEdit(p)} className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">Edit</button>
                <button onClick={() => duplicate(p)} className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">Duplicate</button>
                <button onClick={() => remove(p.id)} className="ml-auto text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative w-full sm:max-w-4xl mx-0 sm:mx-4 sm:rounded-2xl border border-token surface overflow-hidden shadow-2xl h-[80vh] sm:h-auto max-h-[90vh] flex flex-col overscroll-contain">
            {/* Sticky header for mobile */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200/70 dark:border-zinc-800/70">
              <div className="font-semibold">{editingId ? 'Edit Product' : 'Add Product'}</div>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-zinc-700" aria-label="Close">×</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-0 overflow-y-auto min-h-0">
              <form onSubmit={save} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                      autoFocus
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      required
                      aria-invalid={!!nameError}
                      aria-describedby={nameError ? 'name-error' : undefined}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-base"
                    />
                    {nameError && <p id="name-error" className="mt-1 text-xs text-red-600">{nameError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">ID</label>
                    <div className="flex gap-2">
                      <input value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} placeholder="auto-from-name" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-base" />
                      <button type="button" onClick={() => setDraft({ ...draft, id: slugify(draft.name) })} className="px-4 rounded-md border border-zinc-300 dark:border-zinc-700">Slug</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Price <span className="text-red-500">*</span></label>
                    <input
                      value={draft.price}
                      onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                      aria-invalid={!!priceError}
                      aria-describedby={priceError ? 'price-error' : undefined}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-base"
                    />
                    {priceError && <p id="price-error" className="mt-1 text-xs text-red-600">{priceError}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Gender</label>
                    <select
                      value={draft.gender}
                      onChange={(e) => setDraft({ ...draft, gender: e.target.value as Draft['gender'] })}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-base"
                    >
                      <option value="">— Select —</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Category</label>
                    <select
                      value={draft.category}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value as Draft['category'] })}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-base"
                    >
                      <option value="">— Select —</option>
                      <option value="shoes">Shoes</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={4} required className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-base" />
                </div>

                <div>
                  <label className="block text-sm mb-2">Product Images</label>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((item, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-token elevated">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={(typeof File !== 'undefined' && item instanceof File && typeof URL !== 'undefined') ? URL.createObjectURL(item) : (item as string)}
                          alt="img"
                          className="w-full h-24 object-cover"
                        />
                        <button type="button" onClick={() => setImages((arr) => arr.filter((_, i) => i !== idx))} className="absolute top-1 right-1 text-xs px-2 py-0.5 rounded-full bg-black/70 text-white opacity-80">Remove</button>
                      </div>
                    ))}
                    <label className="flex items-center justify-center h-24 rounded-lg border border-dashed border-token text-zinc-500 cursor-pointer elevated">
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length) setImages((arr) => [...arr, ...files]);
                        e.currentTarget.value = '';
                      }} />
                      <span className="text-2xl">+</span>
                    </label>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">First image becomes the thumbnail.</p>
                </div>

                <div>
                  <label className="block text-sm mb-2">Product Video (optional)</label>
                  <div className="flex items-center gap-3">
                    {video ? (
                      <div className="relative rounded-lg overflow-hidden border border-token elevated">
                        <video className="w-40 h-24 object-cover" controls src={(typeof File !== 'undefined' && video instanceof File && typeof URL !== 'undefined') ? URL.createObjectURL(video) : (video as string)} />
                        <button type="button" onClick={() => setVideo(null)} className="absolute top-1 right-1 text-xs px-2 py-0.5 rounded-full bg-black/70 text-white opacity-80">Remove</button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-40 h-24 rounded-lg border border-dashed border-token text-zinc-500 cursor-pointer elevated">
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                          const file = (e.target.files || [])[0];
                          if (file) setVideo(file);
                          e.currentTarget.value = '';
                        }} />
                        <span className="text-2xl">+</span>
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Available Sizes</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {sizes.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm">
                        {s}
                        <button type="button" onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))} className="text-zinc-500 hover:text-zinc-700">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder="e.g., 7 or 42 EU" className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-base" />
                    <button type="button" onClick={() => { const v = sizeInput.trim(); if (v) { setSizes(Array.from(new Set([...sizes, v]))); setSizeInput(''); } }} className="px-4 rounded-md border border-zinc-300 dark:border-zinc-700">Add</button>
                  </div>
                </div>

                {/* Sticky actions on mobile */}
                <div className="sm:hidden sticky bottom-0 left-0 right-0 -mx-5 p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-t border-zinc-200/70 dark:border-zinc-800/70">
                  <button disabled={saving || formInvalid} className="w-full inline-flex items-center justify-center px-4 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium shadow hover:opacity-90 transition-opacity disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>

                {/* Desktop actions */}
                <div className="hidden sm:flex items-center gap-3 pt-1">
                  <button disabled={saving || formInvalid} className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium shadow hover:opacity-90 transition-opacity disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setDraft({ id: '', name: '', price: '', description: '', gender: '', category: '' }); setImages([]); setVideo(null); }} className="px-3 py-2 rounded-full border border-zinc-300 dark:border-zinc-700">Clear</button>
                  )}
                </div>
              </form>

              {/* Live preview */}
              <div className="p-5 border-t sm:border-t-0 sm:border-l border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/60 dark:bg-zinc-950/40">
                <div className="text-sm font-medium mb-3">Live Preview</div>
                {preview && (
                  <div className="rounded-xl overflow-hidden border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview.thumbnail} alt="preview" className="w-full h-44 object-cover" />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{preview.name || '(Untitled)'}</div>
                        <div className="font-semibold">{'$'}{Number.isFinite(Number(preview.price)) ? Number(preview.price).toFixed(2) : '0.00'}</div>
                      </div>
                      {(preview.gender || preview.category) && (
                        <div className="mt-2 flex gap-2 text-[11px]">
                          {preview.gender && (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{preview.gender}</span>
                          )}
                          {preview.category && (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 uppercase tracking-wide">{preview.category}</span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{preview.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative w-full max-w-md mx-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 p-5">
            <div className="text-lg font-semibold mb-2">Delete product?</div>
            <p className="text-sm text-zinc-500">This action cannot be undone.</p>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-full bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full bg-black text-white shadow-lg" role="status" aria-live="polite">{toast}</div>
      )}
    </div>
  );
}
