"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AddToCartButton from "@/components/AddToCartButton";

type Props = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  sizes?: string[];
};

export default function ProductActions({ id, name, price, imageUrl, sizes }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  useEffect(() => {
    if (Array.isArray(sizes) && sizes.length > 0 && !selectedSize) {
      setSelectedSize(String(sizes[0]));
    }
  }, [sizes, selectedSize]);

  const nameWithSize = useMemo(() => (
    selectedSize ? `${name} (${selectedSize})` : name
  ), [name, selectedSize]);

  const prefill = useMemo(() => ({
    id,
    name: nameWithSize,
    price,
    qty: 1 as number,
    imageUrl,
  }), [id, nameWithSize, price, imageUrl]);

  const proceedWith = useCallback((method: string) => {
    try { window.localStorage.setItem("preferredPaymentMethod", method); } catch {}
    try {
      const raw = window.localStorage.getItem("cart");
      const list: Array<{ id: string; name: string; price: number; qty: number; imageUrl?: string }> = raw ? JSON.parse(raw) : [];
      const merged = [...list];
      if (prefill) {
        const i = merged.findIndex((x) => x.id === prefill.id);
        if (i >= 0) merged[i] = { ...merged[i], qty: merged[i].qty + prefill.qty }; else merged.push(prefill);
      }
      if (merged.length === 0) return;
      const lines: string[] = [];
      lines.push("Hello! I'd like to order:");
      for (const it of merged) {
        const priceEach = Number(it.price);
        lines.push(`- ${it.name} x${it.qty} - $${priceEach.toFixed(2)} each`);
        if (it.imageUrl) lines.push(`  Photo: ${it.imageUrl}`);
      }
      if (method && method.trim()) { lines.push(""); lines.push(`Preference: ${method.trim()}`); }
      const total = merged.reduce((sum, it) => sum + Number(it.price) * Number(it.qty), 0);
      lines.push(""); lines.push(`Total: $${total.toFixed(2)}`);
      const message = lines.join("\n");

      const encoded = encodeURIComponent(message);
      const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
      const customLink = (process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/message/ZC23PRNRWILSN1").trim();
      let httpsUrl: string;
      if (customLink) { const sep = customLink.includes("?") ? "&" : "?"; httpsUrl = `${customLink}${sep}text=${encoded}`; }
      else if (phone && /^\+?\d{7,}$/.test(phone)) { httpsUrl = `https://wa.me/${phone.replace(/^\+/, "")}?text=${encoded}`; }
      else { httpsUrl = `https://wa.me/?text=${encoded}`; }

      let mobileUrl: string | null = null;
      try {
        const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
        const isMobile = nav.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(nav.userAgent || "");
        if (isMobile) {
          if (phone && /^\+?\d{7,}$/.test(phone)) mobileUrl = `whatsapp://send?phone=${phone.replace(/^\+/, "")}&text=${encoded}`;
          else if (customLink) mobileUrl = httpsUrl;
          else mobileUrl = `whatsapp://send?text=${encoded}`;
        }
      } catch {}

      setOpen(false);
      if (mobileUrl) window.location.href = mobileUrl; else window.open(httpsUrl, "_blank", "noreferrer");
    } catch {}
  }, [prefill]);

  const modal = !open || !mounted ? null : createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Grey full overlay */}
      <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm" />

      {/* Centered modal with animated glow frame */}
      <div className="relative mx-4 w-full max-w-2xl">
        <div className="glow-frame rounded-3xl p-[2px]">
          <div className="glow-inner rounded-3xl bg-zinc-900/95 text-white shadow-2xl">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Payment Method</h2>
                <button
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="btn btn-outline rounded-full px-3 py-1.5 text-sm"
                >
                  ×
                </button>
              </div>

              {/* Size selection removed from modal by request */}

              {/* Simple sentence (no container) */}
              <p
                className="mb-6 text-center text-white font-extrabold text-base md:text-lg tracking-wide glow-soft whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ fontFamily: "'Arial Rounded MT Bold','Baloo 2','Rubik','Poppins','Segoe UI',system-ui,sans-serif" }}
              >
                Choose a payment method to complete your order online.
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {/* Visa / Debit */}
                <button
                  type="button"
                  className="btn w-full flex flex-col items-center justify-center gap-1.5 text-center option-card bg-blue-600 text-white border-blue-600 hover:bg-blue-500 hover:border-blue-500 shadow-sm transition"
                  onClick={() => proceedWith(selectedSize ? `Visa/Debit · Size ${selectedSize}` : 'Visa/Debit')}
                >
                  <span className="font-semibold">Visa/Debit</span>
                  {/* Card icon */}
                  <svg viewBox="0 0 24 24" className="option-icon block h-9 w-9 opacity-95 drop-shadow" aria-hidden="true">
                    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="3"/>
                      <path d="M3 10h18"/>
                      <rect x="6.5" y="13" width="6" height="3.5" rx="0.8"/>
                    </g>
                  </svg>
                </button>

                {/* Cryptocurrencies */}
                <button
                  type="button"
                  className="btn w-full flex flex-col items-center justify-center gap-1.5 text-center option-card bg-yellow-400 text-zinc-900 border-yellow-400 hover:bg-yellow-300 hover:border-yellow-300 shadow-sm transition"
                  onClick={() => proceedWith(selectedSize ? `Cryptocurrencies · Size ${selectedSize}` : 'Cryptocurrencies')}
                >
                  <span className="font-semibold">Cryptocurrencies</span>
                  {/* Crypto icon */}
                  <svg viewBox="0 0 24 24" className="option-icon block h-9 w-9 opacity-95 drop-shadow" aria-hidden="true">
                    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="8"/>
                      <path d="M9 9h5a2 2 0 1 1 0 4H9m5 0a2 2 0 1 1 0 4H9"/>
                    </g>
                  </svg>
                </button>

                {/* Whish Money */}
                <button
                  type="button"
                  className="btn w-full flex flex-col items-center justify-center gap-1.5 text-center option-card bg-red-600 text-white border-red-600 hover:bg-red-500 hover:border-red-500 shadow-sm transition"
                  onClick={() => proceedWith(selectedSize ? `Whish Money · Size ${selectedSize}` : 'Whish Money')}
                >
                  <span className="font-semibold">Whish Money</span>
                  {/* Wallet icon */}
                  <svg viewBox="0 0 24 24" className="option-icon block h-9 w-9 opacity-95 drop-shadow" aria-hidden="true">
                    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="6" width="18" height="12" rx="3"/>
                      <path d="M16 12h3"/>
                      <path d="M3 9l12-3"/>
                    </g>
                  </svg>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="btn btn-outline rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="w-full">
      {/* Desktop / tablet actions */}
      <div className="hidden sm:block">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{'$'}{price.toFixed(2)}</span>
        </div>
        <div className="flex items-center flex-wrap gap-3 sm:gap-4">
          <button type="button" className="btn btn-primary font-medium" onClick={() => setOpen(true)}>Buy</button>
          <AddToCartButton id={id} name={nameWithSize} price={price} imageUrl={imageUrl} />
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="sm:hidden">
        <div className="h-20" />
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-zinc-950/90 border-t border-token backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-zinc-950/70">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <span className="font-display text-2xl font-extrabold tracking-tight">{'$'}{price.toFixed(2)}</span>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>Buy</button>
            <AddToCartButton id={id} name={nameWithSize} price={price} imageUrl={imageUrl} />
          </div>
        </div>
      </div>

      {modal}
    </div>
  );
}


