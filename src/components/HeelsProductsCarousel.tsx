"use client";

import Link from "next/link";
import Marquee from "./Marquee";
import ProductThumbCarousel from "./ProductThumbCarousel";
import type { PricedProduct } from "@/lib/products";

type Props = {
  items: PricedProduct[];
  speed?: number; // px/s
};

export default function HeelsProductsCarousel({ items, speed = 42 }: Props) {
  if (!items?.length) return null;

  const nodes = items.map((p) => (
    <Link key={p.id} href={`/product/${p.id}`} className="block group">
      <div
        className="w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] group rounded-xl overflow-hidden border border-token surface hover-lift"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <ProductThumbCarousel product={p} preset="grid" />
        </div>
        <div className="p-2">
          <div className="text-[13px] font-medium truncate">{p.name || '(Untitled)'}</div>
        </div>
      </div>
    </Link>
  ));

  return <Marquee items={nodes} speed={speed} gapPx={16} />;
}

