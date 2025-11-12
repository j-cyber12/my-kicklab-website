"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { cld } from "@/lib/images";

type Props = {
  product: Product;
};

export default function ProductMediaViewer({ product }: Props) {
  const images = useMemo(() => {
    const list = [product.thumbnail, ...(product.images || [])].filter(Boolean);
    return list.length > 0 ? list : [product.thumbnail].filter(Boolean);
  }, [product.thumbnail, product.images]);

  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const mainRef = useRef<HTMLDivElement | null>(null);

  const mainSrc = cld(images[idx] || images[0], "detail");

  function onMouseMove(e: React.MouseEvent) {
    const el = mainRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);
  const next = useCallback(() => {
    setIdx((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setLightbox(false);
      if (ev.key === "ArrowLeft") prev();
      if (ev.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  return (
    <div className="space-y-4">
      <div className="md:flex md:items-start md:gap-4">
        <div className="flex-1 flex justify-center">
          <div
            ref={mainRef}
            className="relative mx-auto w-full max-w-[640px] rounded-3xl border border-token overflow-hidden bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-black shadow-xl"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onMouseMove={onMouseMove}
          >
            <Image
              src={mainSrc}
              alt={product.name}
              width={800}
              height={800}
              sizes="(max-width: 768px) 90vw, 800px"
              className="w-full h-auto object-contain aspect-square md:aspect-[3/4] transition-transform duration-300 cursor-zoom-in"
              style={{ transformOrigin: `${origin.x}% ${origin.y}%`, transform: hovering ? "scale(1.05)" : "scale(1)" }}
              onClick={() => setLightbox(true)}
            />
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-6">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-2">
            {images.map((img, i) => {
              const src = cld(img, "gallery");
              const isActive = i === idx;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`snap-center shrink-0 rounded-2xl overflow-hidden border transition ${
                    isActive ? "border-white shadow-lg" : "border-transparent hover:border-white/60"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${product.name} photo ${i + 1}`}
                    width={320}
                    height={320}
                    className="w-[280px] h-[360px] object-cover transition duration-200"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {images.length > 1 && (
        <div className="mt-6">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-2">
            {images.map((img, i) => {
              const src = cld(img, "gallery");
              const isActive = i === idx;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`snap-center shrink-0 rounded-2xl overflow-hidden border transition ${
                    isActive ? "border-white shadow-lg" : "border-transparent hover:border-white/60"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${product.name} photo ${i + 1}`}
                    width={320}
                    height={320}
                    className="w-[280px] h-[360px] object-cover transition duration-200"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={cld(images[idx] || images[0], "detail")}
              alt={product.name}
              width={1200}
              height={1200}
              className="w-full h-auto object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              aria-label="Close"
              onClick={() => setLightbox(false)}
              className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-token flex items-center justify-center hover:bg-white/95 dark:hover:bg-zinc-900/95"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29 10.59 10.59 16.89 4.29z"/></svg>
            </button>
            {/* Lightbox arrow buttons removed per request; keyboard arrows still work */}
          </div>
        </div>
      )}
    </div>
  );
}
