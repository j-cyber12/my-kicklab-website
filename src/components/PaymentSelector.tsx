"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./PaymentSelector.module.css";

type PaymentMethod = "crypto" | "wish" | "whatsapp";

const OPTIONS: { key: PaymentMethod; label: string; variant: string }[] = [
  { key: "crypto", label: "Cryptocurrency", variant: styles.crypto },
  { key: "whatsapp", label: "WhatsApp", variant: styles.whatsapp },
  { key: "wish", label: "Whish Money", variant: styles.wish },
];

type PaymentProduct = {
  name: string;
  price: number;
  imageUrl?: string;
};

type Props = {
  amount?: number;
  currency?: string;
  product?: PaymentProduct;
};

type CryptoInstructions = {
  id: string;
  asset: string;
  amount: number;
  address: string;
  network?: string;
  tagOrMemo?: string;
};

const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK || "";

export default function PaymentSelector({ amount, currency = "usd", product }: Props) {
  const [selected, setSelected] = useState<PaymentMethod>("crypto");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoInstructions, setCryptoInstructions] = useState<CryptoInstructions | null>(null);
  const whatsappMessage = useMemo(() => {
    if (!product) return "Hi, I need help with a product.";
    const parts = [`I'm interested in ${product.name}`];
    if (Number.isFinite(product.price)) {
      parts.push(`priced at $${product.price.toFixed(2)}`);
    }
    if (product.imageUrl) {
      parts.push(`Image: ${product.imageUrl}`);
    }
    return `Hi, ${parts.join(", ")}.`;
  }, [product]);
  const whatsappCustomerHref = useMemo(() => {
    if (!whatsappLink) return "";
    const separator = whatsappLink.includes("?") ? "&" : "?";
    return `${whatsappLink}${separator}text=${encodeURIComponent(whatsappMessage)}`;
  }, [whatsappMessage]);

  useEffect(() => {
    const prevFont = document.body.style.fontFamily;
    const prevBg = document.body.style.background;
    document.body.style.fontFamily = `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    document.body.style.background = `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;
    return () => {
      document.body.style.fontFamily = prevFont;
      document.body.style.background = prevBg;
    };
  }, []);


  useEffect(() => {
    if (selected !== "crypto") {
      setCryptoInstructions(null);
      setStatus(null);
      setIsLoading(false);
      return;
    }

    if (!amount || amount <= 0) {
      setStatus("Cryptocurrency requests need a positive amount.");
      return;
    }

    const controller = new AbortController();
    const payload = {
      amount,
      asset: "USDT",
    };

    setIsLoading(true);
    setStatus("Preparing Binance deposit instructions…");

    fetch("/api/crypto/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Unexpected Binance response");
        }
        if (data?.instructions) {
          setCryptoInstructions({ id: data.id, ...data.instructions });
          setStatus(`Send ${data.instructions.amount} ${data.instructions.asset} to the address below.`);
        } else {
          setStatus("Binance did not return instructions.");
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setStatus(`Binance request failed: ${(err as Error).message}`);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [selected, amount]);

  useEffect(() => {
    if (selected === "whatsapp") {
      setStatus(whatsappCustomerHref ? "Tap the button below to chat on WhatsApp." : "WhatsApp link is not configured.");
      setIsLoading(false);
    } else if (selected === "wish") {
      setStatus(null);
    }
  }, [selected, whatsappCustomerHref]);

  return (
    <section className={styles.container}>
      <div className={styles.tabs}>
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`${styles.tab} ${option.variant} ${selected === option.key ? styles.active : ""}`}
            data-method={option.key}
            onClick={() => setSelected(option.key)}
          >
            <span className={styles.iconContainer} aria-hidden>
              {renderIcon(option.key)}
            </span>
            <div className={styles.label}>{option.label}</div>
          </button>
        ))}
      </div>
      {cryptoInstructions && (
        <div className={styles.cryptoInstructions}>
          <p className={styles.instructionsLabel}>
            Send {cryptoInstructions.amount} {cryptoInstructions.asset} to:
          </p>
          <p className={styles.instructionsValue}>{cryptoInstructions.address}</p>
          {cryptoInstructions.tagOrMemo && (
            <p className={styles.instructionsNote}>Memo/Tag: {cryptoInstructions.tagOrMemo}</p>
          )}
          {cryptoInstructions.network && (
            <p className={styles.instructionsNote}>Network: {cryptoInstructions.network}</p>
          )}
        </div>
      )}
      {selected === "whatsapp" && whatsappCustomerHref && (
        <div className={styles.whatsappInstructions}>
          <p className={styles.instructionsLabel}>Need help finalizing the checkout?</p>
          <p className={styles.instructionsNote}>Tap the button below to open WhatsApp with us.</p>
          <a
            className={styles.whatsappButton}
            href={whatsappCustomerHref}
            target="_blank"
            rel="noreferrer"
          >
            Message on WhatsApp
          </a>
        </div>
      )}
      {status && (
        <p className={styles.status} aria-live="polite">
          {isLoading ? "Contacting payment provider…" : status}
        </p>
      )}
    </section>
  );
}

function renderIcon(kind: PaymentMethod) {
  const base = { width: 40, height: 40 };
  if (kind === "whatsapp") {
    return (
      <svg viewBox="0 0 48 48" fill="none" {...base} aria-hidden>
        <defs>
          <linearGradient id="whatsappGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="36" height="36" rx="12" fill="url(#whatsappGradient)" opacity="0.25" />
        <path
          d="M16 31c1.4 3.2 4.3 4.6 6.8 4.6 5.7 0 8.5-4.8 8.5-8.8 0-4-3.1-8.3-8.5-8.3-3.5 0-6.1 2.1-7.1 4.8"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28.8 18.6c-.2-.3-.9-.7-1.5-.9-.7-.2-1.4-.3-2.2-.3-2.2 0-4.2 1.3-4.6 3-.3 1.1 0 2.4.9 3.4 1 1.1 2.5 1.6 3.8 1.9.8.2 1.2.6 1.2 1.2 0 .6-.2 1.1-.5 1.6-.4.6-1.1 1.1-2.3 1.1-.8 0-1.8-.2-2.6-.4"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "crypto") {
    return (
      <svg viewBox="0 0 48 48" fill="none" {...base} aria-hidden>
        <rect x="6" y="12" width="36" height="24" rx="10" fill="#0f172a" opacity="0.3" />
        <path
          d="M12 20H20L26 28H32L36 18H42"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 26C14 26 16 20 24 20C32 20 34 24 34 24"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="26" r="6" fill="none" stroke="#a5f3fc" strokeWidth="2" />
        <path d="M24 18V30" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "wish") {
    return (
      <svg viewBox="0 0 48 48" fill="none" {...base} aria-hidden>
        <rect x="8" y="12" width="32" height="24" rx="6" fill="#fef3f2" stroke="#f87171" strokeWidth="2" />
        <rect x="12" y="18" width="16" height="10" rx="3" fill="#f87171" opacity="0.1" />
        <path
          d="M12 22h12v6H12z"
          fill="#fee2e2"
        />
        <path
          d="M28 20h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6"
          stroke="#f87171"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="32" cy="23" r="1.5" fill="#f87171" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" {...base} aria-hidden>
      <rect x="6" y="14" width="36" height="20" rx="5" fill="#fef3f2" stroke="#f87171" strokeWidth="2" />
      <path
        d="M12 20H36M12 24H36"
        stroke="#f97316"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 2"
      />
      <path
        d="M12 26V32C12 33.1046 12.8954 34 14 34H34C35.1046 34 36 33.1046 36 32V26"
        fill="#fecdd3"
      />
      <circle cx="32" cy="30" r="2" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.5" />
      <path d="M18 22L20 26L24 22L26 26L30 22" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
