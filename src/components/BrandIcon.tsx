"use client";
import React, { useState } from 'react';
import { siNike, siAdidas } from 'simple-icons';

export type Brand = 'nike' | 'adidas' | 'vans' | 'alexandermcqueen';

const ICONS: Partial<Record<Brand, { path: string; title: string }>> = {
  nike: { path: siNike.path, title: siNike.title },
  adidas: { path: siAdidas.path, title: siAdidas.title },
  // vans and alexandermcqueen not present in simple-icons package; use fallback text
};

export default function BrandIcon({ name, className }: { name: Brand; className?: string }) {
  const [imgOk, setImgOk] = useState(true);
  const label = name === 'alexandermcqueen' ? 'Alexander McQueen' : name.charAt(0).toUpperCase() + name.slice(1);

  // Prefer local asset if available
  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/brands/${name}.svg`}
        alt={label}
        className={className}
        onError={() => setImgOk(false)}
      />
    );
  }

  const icon = ICONS[name as Brand];
  if (icon) {
    return (
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill="currentColor"
      >
        <path d={icon.path} />
      </svg>
    );
  }
  // Fallback: text wordmark
  return (
    <span className={`inline-block ${className || ''}`} aria-label={label} title={label}>
      <span className="align-middle whitespace-nowrap font-semibold">{label}</span>
    </span>
  );
}
