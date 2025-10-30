"use client";

import { useCallback, useState } from "react";

type Props = {
  id: string;
  name: string;
  price?: number;
  imageUrl?: string;
};

export default function ProductShareButton({ id, name, price, imageUrl }: Props) {
  const [sharing, setSharing] = useState(false);

  const onShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/product/${encodeURIComponent(id)}`;
      const priceText = typeof price === "number" ? ` for $${price.toFixed(2)}` : "";
      const text = `Check out "${name}"${priceText} on Kicklab:\n`;

      let file: File | null = null;
      if (imageUrl) {
        try {
          const res = await fetch(imageUrl, { mode: "cors", cache: "no-cache" });
          if (res.ok) {
            const blob = await res.blob();
            const ct = res.headers.get("content-type") || "image/jpeg";
            const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : ct.includes("gif") ? "gif" : "jpg";
            const safeName = name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
            file = new File([blob], `${safeName}.${ext}`, { type: ct });
          }
        } catch {
          // Ignore fetch errors and fall back to text/url share
          file = null;
        }
      }

      const canShareFiles = file && typeof navigator !== "undefined" && "canShare" in navigator && (navigator as any).canShare?.({ files: [file] });

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          if (canShareFiles) {
            await navigator.share({ text, url, files: [file as File] });
          } else {
            await navigator.share({ text: `${text} ${url}` });
          }
          return;
        } catch (err) {
          // If user cancels or share fails, fall through to WhatsApp fallback
        }
      }

      const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
      window.open(wa, "_blank", "noopener,noreferrer");
    } finally {
      setSharing(false);
    }
  }, [id, imageUrl, name, price, sharing]);

  return (
    <button
      type="button"
      aria-label="Share product"
      onClick={onShare}
      disabled={sharing}
      className="btn btn-ghost font-medium disabled:opacity-60 w-full sm:w-auto"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 opacity-80"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.274 3.274 0 0 0 0-1.39l7.02-4.11A2.99 2.99 0 1 0 14 5a3 3 0 0 0 .04.49L7.02 9.6a3 3 0 1 0 0 4.79l7.02 4.11c-.02.15-.04.3-.04.46a3 3 0 1 0 3.98-2.88z"/></svg>
      {sharing ? "Sharing..." : "Share"}
    </button>
  );
}
