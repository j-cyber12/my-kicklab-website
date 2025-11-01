"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Item = { id: string; name: string; price: number; qty: number; imageUrl?: string };

type Props = {
  label?: string;
  className?: string;
  prefill?: Item; // optionally include this item in the message without mutating cart
};

export default function WhatsAppCartButton({ label = "Proceed to checkout", className, prefill }: Props) {
  const [items, setItems] = useState<Item[]>([]);

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

  const message = useMemo(() => {
    const list: Item[] = [...items];
    if (prefill) {
      const i = list.findIndex((x) => x.id === prefill.id);
      if (i >= 0) {
        list[i] = { ...list[i], qty: list[i].qty + prefill.qty };
      } else {
        list.push(prefill);
      }
    }
    if (list.length === 0) return "";
    const lines: string[] = [];
    lines.push("Hello! I'd like to order:");
    for (const it of list) {
      const line = `• ${it.name} x${it.qty} — $${Number(it.price).toFixed(2)} each`;
      lines.push(line);
    }
    const total = list.reduce((sum, it) => sum + Number(it.price) * Number(it.qty), 0);
    lines.push("—");
    lines.push(`Total: $${total.toFixed(2)}`);
    return lines.join("\n");
  }, [items, prefill]);

  const onClick = useCallback(() => {
    if (!message) return;
    const encoded = encodeURIComponent(message);
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
    const url = phone && /^\+?\d{7,}$/.test(phone)
      ? `https://wa.me/${phone.replace(/^\+/, "")}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    try { window.open(url, "_blank", "noreferrer"); } catch { window.location.href = url; }
  }, [message]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!message}
      className={"btn btn-primary font-medium w-full sm:w-auto disabled:opacity-60 " + (className || "")}
      aria-label={label}
    >
      {label}
    </button>
  );
}
