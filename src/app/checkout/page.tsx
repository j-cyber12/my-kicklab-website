"use client";

import { useEffect, useMemo, useState } from "react";
import PaymentMethods from "@/components/PaymentMethods";
import WhatsAppCartButton from "@/components/WhatsAppCartButton";

type Item = { id: string; name: string; price: number; qty: number; imageUrl?: string };

export default function CheckoutPage() {
  const [method, setMethod] = useState<string>("Visa/Debit Card");
  const [prefill, setPrefill] = useState<Item | undefined>(undefined);
  const [cartCount, setCartCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("checkoutPrefill");
      if (raw) setPrefill(JSON.parse(raw));
    } catch {}
    try {
      const key = "cart";
      const rawCart = window.localStorage.getItem(key);
      const list: Item[] = rawCart ? JSON.parse(rawCart) : [];
      setCartCount(Array.isArray(list) ? list.reduce((n, i) => n + (i?.qty || 0), 0) : 0);
      setTotal(Array.isArray(list) ? list.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0) : 0);
    } catch {}
  }, []);

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (prefill) parts.push(`${prefill.name} x${prefill.qty}`);
    if (cartCount > 0) parts.push(`${cartCount} item(s) in cart`);
    return parts.join(" · ");
  }, [prefill, cartCount]);

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h1>Choose Payment Method</h1>
        <p className="subtitle">
          Select how you&apos;d like to pay, then continue to complete your order in a refined experience.
        </p>

        {summary && (
          <div className="summary">
            <span className="label">Summary:</span>
            <span className="value">{summary}</span>
            {total > 0 && (
              <>
                <span className="label">Total approx</span>
                <span className="value">${total.toFixed(2)}</span>
              </>
            )}
          </div>
        )}

        <div className="mt-8">
          <PaymentMethods value={method} onChange={setMethod} />
        </div>

        <div className="actions">
          <WhatsAppCartButton label="Continue" prefill={prefill} note={method} className="btn btn-primary" />
          <button type="button" className="btn btn-ghost" onClick={() => window.close?.()}>
            Close tab
          </button>
        </div>
      </div>

      <style jsx>{`
        .checkout-page {
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          animation: gradientShift 15s ease infinite;
          background-size: 200% 200%;
          position: relative;
          overflow: hidden;
        }

        .checkout-page::before,
        .checkout-page::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
        }

        .checkout-page::before {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          top: -250px;
          right: -250px;
          animation: float 20s ease-in-out infinite;
        }

        .checkout-page::after {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
          bottom: -200px;
          left: -200px;
          animation: float 15s ease-in-out infinite reverse;
        }

        .checkout-card {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 3.5rem;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.5) inset;
          max-width: 650px;
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        h1 {
          text-align: center;
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 3rem;
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          animation: fadeIn 1s ease-out 0.3s both;
        }

        .subtitle {
          text-align: center;
          margin: 0 auto 0;
          color: #475569;
          font-size: 1rem;
          max-width: 470px;
        }

        .summary {
          margin-top: 1.75rem;
          font-size: 0.95rem;
          color: #475569;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1rem;
          justify-content: center;
        }

        .summary .label {
          color: #a1aed5;
          font-weight: 600;
        }

        .summary .value {
          color: #1f2937;
          font-weight: 700;
        }

        .actions {
          margin-top: 2.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }

        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(50px, 50px) scale(1.1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 640px) {
          .checkout-card {
            padding: 2.5rem;
          }

          h1 {
            font-size: 1.75rem;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
