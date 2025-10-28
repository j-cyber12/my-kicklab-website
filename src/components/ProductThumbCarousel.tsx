"use client";
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/products';
import { cld } from '@/lib/images';

type Props = {
  product: Product;
  preset?: 'grid' | 'thumb';
  intervalMs?: number;
};

export default function ProductThumbCarousel({ product, preset = 'grid', intervalMs = 2200 }: Props) {
  const sources = useMemo(() => {
    const imgs = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const list = [product.thumbnail, ...imgs].filter(Boolean);
    // Ensure at least one image
    return list.length > 0 ? list : [product.thumbnail].filter(Boolean);
  }, [product]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (sources.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % sources.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [sources.length, intervalMs]);

  const src = cld(sources[idx] || product.thumbnail, preset === 'thumb' ? 'thumb' : 'grid');

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={product.name}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );
}

