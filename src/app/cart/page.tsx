"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PaymentSelector from "@/components/PaymentSelector";

type Item = { id: string; name: string; price: number; qty: number; imageUrl?: string };

export default function CartPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const key = "cart";
    const read = () => {
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
        const list: Item[] = raw ? JSON.parse(raw) : [];
        setItems(Array.isArray(list) ? list : []);
      } catch {
        setItems([]);
      }
    };
    read();
    const onCustom = () => read();
    window.addEventListener("cart:updated", onCustom as EventListener);
    return () => window.removeEventListener("cart:updated", onCustom as EventListener);
  }, []);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  const cartProduct = useMemo(() => {
    const label = items.length === 1 ? items[0].name : `${items.length} items in cart`;
    return {
      name: label || "Cart summary",
      price: total,
      imageUrl: items[0]?.imageUrl,
    };
  }, [items, total]);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) => {
      const next = prev
        .map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it))
        .filter((it) => it.qty > 0);
      try {
        window.localStorage.setItem("cart", JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("cart:updated"));
      } catch {}
      return next;
    });
  };

  const clear = () => {
    try {
      window.localStorage.setItem("cart", JSON.stringify([]));
      window.dispatchEvent(new CustomEvent("cart:updated"));
      setItems([]);
    } catch {}
  };

  const openCheckout = () => {
    if (total <= 0) return;
    setCheckoutOpen(true);
  };
  const closeCheckout = () => setCheckoutOpen(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your Cart</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-12 text-center text-zinc-500">
          <p>Your cart is empty.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 border border-token surface rounded-xl p-3">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden flex items-center justify-center">
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" src={it.imageUrl} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-xs text-zinc-400">No image</span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-zinc-500">${it.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 rounded border"
                  onClick={() => updateQty(it.id, -1)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="min-w-[2ch] text-center">{it.qty}</span>
                <button
                  className="px-2 py-1 rounded border"
                  onClick={() => updateQty(it.id, +1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <div className="w-20 text-right font-medium">${(it.qty * it.price).toFixed(2)}</div>
            </div>
          ))}

          <div className="mt-2 flex items-center justify-between gap-3 border-t pt-4 flex-wrap">
            <button className="text-sm text-zinc-600 hover:underline" onClick={clear}>
              Clear cart
            </button>
            <div className="flex flex-wrap items-center gap-3 ml-auto">
              <div className="text-lg font-semibold">Total: ${total.toFixed(2)}</div>
              <button
                type="button"
                className="btn btn-primary font-medium disabled:opacity-50"
                onClick={openCheckout}
                disabled={total <= 0}
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Checkout</p>
                <h2 className="text-2xl font-bold">Select how you want to pay</h2>
              </div>
              <button
                type="button"
                aria-label="Close checkout"
                onClick={closeCheckout}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                ×
              </button>
            </div>
            <div className="mt-4">
              <PaymentSelector amount={total} product={cartProduct} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
