"use client";

import Link from "next/link";
import Marquee from "./Marquee";

type Item = { id: string; name: string; imageUrl: string };

type Props = {
  items: Item[];
  speed?: number; // px/s
};

export default function SaleProductsCarousel({ items, speed = 50 }: Props) {
  if (!items.length) return null;
  const nodes = items.map((p) => (
    <Link key={p.id} href={`/product/${p.id}`} className="block group">
      <div
        className="relative rounded-full border border-token bg-white dark:bg-zinc-900 shadow-sm overflow-hidden w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 transition-transform duration-200 group-hover:scale-105"
      >
        {/* SALE badge */}
        <span className="absolute -top-1 -right-1 z-10 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-red-600 text-white shadow">
          SALE
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
      </div>
    </Link>
  ));
  return (
    <Marquee items={nodes} speed={speed} gapPx={16} />
  );
}

