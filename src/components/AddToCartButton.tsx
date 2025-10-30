"use client";

import { useCallback, useState } from "react";

type Props = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
};

export default function AddToCartButton({ id, name, price, imageUrl }: Props) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const onAdd = useCallback(() => {
    if (adding) return;
    setAdding(true);
    try {
      const key = "cart";
      const current = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      const list: Array<{ id: string; name: string; price: number; qty: number; imageUrl?: string }> = current ? JSON.parse(current) : [];
      const idx = list.findIndex((i) => i.id === id);
      if (idx >= 0) {
        list[idx].qty += 1;
      } else {
        list.push({ id, name, price, qty: 1, imageUrl });
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(list));
        // Notify listeners (e.g., cart icon badge) that cart changed
        try { window.dispatchEvent(new CustomEvent('cart:updated')); } catch {}
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  }, [adding, id, name, price, imageUrl]);

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={adding}
      className="btn btn-outline font-medium w-full sm:w-auto disabled:opacity-60"
      aria-label="Add to cart"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 opacity-90"><path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0-2h10a1 1 0 0 0 .96-.73L21 7H6.21l-.94-3H2v2h2l3.6 10.59A3 3 0 0 0 7 20h10v-2H7zM17 18a2 2 0 1 0 .001 4.001A2 2 0 0 0 17 18z"/></svg>
      {added ? "Added" : adding ? "Adding..." : "Add to Cart"}
    </button>
  );
}
