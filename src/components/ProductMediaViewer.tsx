"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  const thumbs = useMemo(() => images.slice(0, Math.min(4, images.length)), [images]);

  const mainSrc = cld(images[idx] || images[0], "detail");

  function onMouseMove(e: React.MouseEvent) {
    const el = mainRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  function prev() {
    setIdx((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setIdx((i) => (i + 1) % images.length);
  }

  useEffect(() => {
    if (!lightbox) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setLightbox(false);
      if (ev.key === "ArrowLeft") prev();
      if (ev.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, images.length]);

  return (
    <div className="space-y-4">
      <div className="md:flex md:items-start md:gap-4">
        <div className="flex-1 flex justify-center">
          <div
            ref={mainRef}
            className="relative mx-auto w-full max-w-[560px] md:max-w-[640px] rounded-3xl border border-token overflow-hidden bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-black shadow-xl"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onMouseMove={onMouseMove}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainSrc}
              alt={product.name}
              className="w-full h-auto object-contain aspect-square md:aspect-[4/5] transition-transform duration-300 cursor-zoom-in"
              style={{ transformOrigin: `${origin.x}% ${origin.y}%`, transform: hovering ? "scale(1.06)" : "scale(1)" }}
              onClick={() => setLightbox(true)}
            />
            {/* Arrow buttons removed per request */}
          </div>
        </div>
        {/* Right-side rail removed; thumbnails moved below the main image */}
      </div>

      {images.length > 1 && (
        <div className="mt-3">
          {/* Desktop/tablet: 4-up grid below main image */}
          <div className="hidden md:grid grid-cols-4 gap-3">
            {thumbs.map((img, i) => {
              const src = cld(img, "gallery");
              const isActive = i === idx;
              return (
                // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (images.length > 4 && i === thumbs.length - 1) {
                      setIdx(i);
                      setLightbox(true);
                    } else {
                      setIdx(i);
                    }
                  }}
                  className={`group relative rounded-xl overflow-hidden border transition will-change-transform ${
                    isActive ? "border-indigo-600 dark:border-violet-400 shadow-sm" : "border-token hover:border-zinc-400 dark:hover:border-zinc-500"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} className="w-full h-24 object-cover transition-transform duration-200 group-hover:scale-[1.06]" />
                  {images.length > 4 && i === thumbs.length - 1 && (
                    <span className="absolute inset-0 bg-black/40 text-white text-sm font-medium flex items-center justify-center">+{images.length - 4}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile: horizontal row */}
          <div className="flex md:hidden gap-3 overflow-x-auto py-1">
            {thumbs.map((img, i) => {
              const src = cld(img, "gallery");
              const isActive = i === idx;
              return (
                // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (images.length > 4 && i === thumbs.length - 1) {
                      setIdx(i);
                      setLightbox(true);
                    } else {
                      setIdx(i);
                    }
                  }}
                  className={`group relative rounded-xl overflow-hidden border transition will-change-transform ${
                    isActive ? "border-indigo-600 dark:border-violet-400 shadow-sm" : "border-token hover:border-zinc-400 dark:hover:border-zinc-500"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} className="w-[88px] h-[88px] object-cover transition-transform duration-200 group-hover:scale-[1.06]" />
                  {images.length > 4 && i === thumbs.length - 1 && (
                    <span className="absolute inset-0 bg-black/40 text-white text-sm font-medium flex items-center justify-center">+{images.length - 4}</span>
                  )}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cld(images[idx] || images[0], "detail")}
              alt={product.name}
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
