"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Variant = "floating" | "inline";

type Props = {
  variant?: Variant;
  className?: string;
};

export default function CartButton({ variant = "floating", className }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const key = "cart";
    const read = () => {
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
        const list: Array<{ qty?: number }> = raw ? JSON.parse(raw) : [];
        const c = Array.isArray(list)
          ? list.reduce((sum, it) => sum + (Number.isFinite(Number(it.qty)) ? Number(it.qty) : 0), 0)
          : 0;
        setCount(c);
      } catch {
        setCount(0);
      }
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (!e || e.key === key) read();
    };
    const onCustom = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart:updated", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart:updated", onCustom as EventListener);
    };
  }, []);

  const badge = useMemo(() => (
    <span
      aria-hidden
      className="ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-semibold px-1.5 py-0.5"
    >
      {count}
    </span>
  ), [count]);

  if (variant === "inline") {
    return (
      <Link href="/cart" aria-label="View cart" className={"flex flex-col items-center text-xs " + (className || "") }>
        <span className="relative">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
            <path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0-2h10a1 1 0 0 0 .96-.73L21 7H6.21l-.94-3H2v2h2l3.6 10.59A3 3 0 0 0 7 20h10v-2H7zM17 18a2 2 0 1 0 .001 4.001A2 2 0 0 0 17 18z"/>
          </svg>
          <span className="absolute -top-1 -right-2">{badge}</span>
        </span>
        <span className="mt-1">Cart</span>
      </Link>
    );
  }

  // floating variant
  return (
    <Link
      href="/cart"
      aria-label="View cart"
      className={
        "fixed top-4 right-4 z-50 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 " +
        "bg-white/90 dark:bg-zinc-900/90 backdrop-blur shadow-lg px-3 py-2 inline-flex items-center text-sm " +
        (className || "")
      }
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0-2h10a1 1 0 0 0 .96-.73L21 7H6.21l-.94-3H2v2h2l3.6 10.59A3 3 0 0 0 7 20h10v-2H7zM17 18a2 2 0 1 0 .001 4.001A2 2 0 0 0 17 18z"/>
      </svg>
      <span className="ml-2">Cart</span>
      {badge}
    </Link>
  );
}

