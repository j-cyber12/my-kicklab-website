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
      lines.push(`• ${it.name} x${it.qty} — $${Number(it.price).toFixed(2)} each`);
      if (it.imageUrl) lines.push(`  Photo: ${it.imageUrl}`);
    }
    const total = list.reduce((sum, it) => sum + Number(it.price) * Number(it.qty), 0);
    lines.push("");
    lines.push(`Total: $${total.toFixed(2)}`);
    return lines.join("\n");
  }, [items, prefill]);

  const onClick = useCallback(() => {
    if (!message) return;
    const encoded = encodeURIComponent(message);
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
    // Ensure a reliable fallback to your shop link in production
    const customLink = (process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/message/ZC23PRNRWILSN1").trim();

    // Build HTTPS fallback (works on desktop and mobile)
    let httpsUrl: string;
    if (customLink) {
      const sep = customLink.includes("?") ? "&" : "?";
      httpsUrl = `${customLink}${sep}text=${encoded}`;
    } else if (phone && /^\+?\d{7,}$/.test(phone)) {
      httpsUrl = `https://wa.me/${phone.replace(/^\+/, "")}?text=${encoded}`;
    } else {
      if (process.env.NODE_ENV !== "production") {
        // Help developers notice missing config during development
        // eslint-disable-next-line no-console
        console.warn("WhatsApp phone/link not configured. Falling back to share sheet (wa.me/?text=…)");
      }
      httpsUrl = `https://wa.me/?text=${encoded}`;
    }

    // Build native mobile deep link when possible
    let mobileUrl: string | null = null;
    try {
      const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
      const isMobile = nav.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(nav.userAgent || "");
      if (isMobile) {
        // Prefer phone-based deep link on mobile for reliability
        if (phone && /^\+?\d{7,}$/.test(phone)) {
          mobileUrl = `whatsapp://send?phone=${phone.replace(/^\+/, "")}&text=${encoded}`;
        } else if (customLink) {
          // No whatsapp:// equivalent for wa.me/message short codes; use https
          mobileUrl = httpsUrl;
        } else {
          // Last resort: share sheet
          mobileUrl = `whatsapp://send?text=${encoded}`;
        }
      }
    } catch {
      // ignore UA parsing issues
    }

    try {
      if (mobileUrl) {
        window.location.href = mobileUrl;
      } else {
        window.open(httpsUrl, "_blank", "noreferrer");
      }
    } catch {
      window.location.href = httpsUrl;
    }
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
