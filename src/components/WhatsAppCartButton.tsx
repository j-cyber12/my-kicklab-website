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
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 opacity-90"><path fill="currentColor" d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 .01 5.36.01 12c0 2.11.55 4.08 1.51 5.8L0 24l6.37-1.48A11.95 11.95 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.2-3.48-8.52zM12 22a9.94 9.94 0 0 1-5.07-1.4l-.36-.21-3.77.88.9-3.68-.24-.38A9.94 9.94 0 0 1 2 12C2 6.49 6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm5.42-7.58c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.51-1.8-1.69-2.1-.17-.3-.02-.46.13-.61.14-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.5-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.53.08-.8.37-.27.3-1.05 1.02-1.05 2.47 0 1.45 1.07 2.85 1.22 3.05.15.2 2.1 3.2 5.1 4.49.71.31 1.27.5 1.7.64.71.22 1.35.19 1.86.11.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.28-.2-.58-.35z"/></svg>
      {label}
    </button>
  );
}
