"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; price: number; qty: number; imageUrl?: string };

type Props = {
  label?: string;
  prefill: Item;
  className?: string;
};

export default function BuyNowButton({ label = "Buy", prefill, className }: Props) {
  const router = useRouter();
  const onClick = useCallback(() => {
    try {
      window.localStorage.setItem("checkoutPrefill", JSON.stringify(prefill));
    } catch {}
    router.push("/checkout");
  }, [prefill, router]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={"btn btn-primary font-medium w-full sm:w-auto " + (className || "")}
      aria-label={label}
    >
      {label}
    </button>
  );
}
