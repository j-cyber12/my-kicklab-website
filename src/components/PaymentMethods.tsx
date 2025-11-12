"use client";

import { useEffect, useState } from "react";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

type OptionKey = "card" | "crypto" | "wish";
const OPTIONS: Array<{ key: OptionKey; label: string; className: string }> = [
  { key: "card", label: "Visa/Debit Card", className: "tab-visa" },
  { key: "crypto", label: "Cryptocurrencies", className: "tab-crypto" },
  { key: "wish", label: "Wish Money", className: "tab-wish" },
];

export default function PaymentMethods({ value, onChange, className }: Props) {
  const [selected, setSelected] = useState<string>(value || OPTIONS[0].label);
  const [rippleTarget, setRippleTarget] = useState<string | null>(null);

  useEffect(() => {
    if (value && value !== selected) setSelected(value);
  }, [value, selected]);

  useEffect(() => {
    try {
      window.localStorage.setItem("preferredPaymentMethod", selected);
    } catch {}
    onChange?.(selected);
  }, [selected, onChange]);

  return (
    <div className={["payment-tabs", className].filter(Boolean).join(" ")}>
      <div className="tabs">
        {OPTIONS.map((opt, idx) => {
          const isActive = selected === opt.label;
          return (
            <button
              key={opt.key}
              type="button"
              aria-pressed={isActive}
              className={`tab ${opt.className} ${isActive ? "active" : ""}`}
          style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
              onClick={() => {
                setSelected(opt.label);
                setRippleTarget(opt.label);
                setTimeout(() => setRippleTarget((prev) => (prev === opt.label ? null : prev)), 1000);
              }}
            >
              <div className="tab-icon-wrapper">
                <Icon kind={opt.key} />
              </div>
              <span className="tab-content">{opt.label}</span>
              <div className="checkmark" aria-hidden>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {isActive && rippleTarget === opt.label && <span className="ripple" />}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .tabs {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .tab {
          padding: 2rem 2.5rem;
          border: none;
          font-size: 1.25rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          color: white;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          position: relative;
          overflow: hidden;
          animation: slideInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          box-shadow: 0 18px 35px rgba(15, 23, 42, 0.35);
          background-clip: padding-box;
          border-radius: 0;
          clip-path: polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
          border: 1px solid rgba(255, 255, 255, 0.45);
        }
        .tab:nth-child(1) {
          animation-delay: 0.4s !important;
        }
        .tab:nth-child(2) {
          animation-delay: 0.5s !important;
        }
        .tab:nth-child(3) {
          animation-delay: 0.6s !important;
        }

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateX(-50px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .tab::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .tab:hover::before {
          opacity: 1;
        }

        .tab::after {
          content: "";
          position: absolute;
          width: 60px;
          height: 60px;
          top: -20px;
          right: -20px;
          background: rgba(255, 255, 255, 0.15);
          transform: rotate(45deg);
          border-radius: 12px;
          transition: transform 0.5s ease, opacity 0.5s ease;
          opacity: 0;
        }

        .tab:hover::after {
          transform: rotate(45deg) scale(1.1);
          opacity: 1;
        }

        .tab:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
        }

        .tab.active {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
        }

        .tab.active .ripple {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 20px;
          animation: rippleEffect 1s ease-out;
        }

        @keyframes rippleEffect {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          100% {
            box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
          }
        }

        .tab-visa {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }

        .tab-crypto {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .tab-wish {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .tab-icon-wrapper {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 1;
        }

        .tab:hover .tab-icon-wrapper {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(-10deg) scale(1.1);
        }

        .tab.active .tab-icon-wrapper {
          background: rgba(255, 255, 255, 0.35);
          transform: rotate(0deg) scale(1.15);
          animation: iconBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes iconBounce {
          0%,
          100% {
            transform: rotate(0deg) scale(1.15);
          }
          25% {
            transform: rotate(-15deg) scale(1.25);
          }
          50% {
            transform: rotate(10deg) scale(1.3);
          }
          75% {
            transform: rotate(-5deg) scale(1.2);
          }
        }

        .tab-icon {
          width: 32px;
          height: 32px;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .tab:hover .tab-icon {
          transform: scale(1.1);
        }

        .tab.active .tab-icon {
          animation: iconSpin 0.6s ease-out;
        }

        @keyframes iconSpin {
          0% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }

        .tab-content {
          flex: 1;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 1;
          letter-spacing: -0.01em;
        }

        .tab:hover .tab-content {
          transform: translateX(8px);
        }

        .checkmark {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: transparent;
          position: relative;
          z-index: 1;
        }

        .tab.active .checkmark {
          transform: translateX(8px);
        }

        .checkmark svg {
          width: 28px;
          height: 28px;
          opacity: 0.5;
          transform: translateX(-10px);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          fill: white;
        }

        .tab.active .checkmark svg {
          opacity: 1;
          transform: translateX(0);
          animation: arrowSlide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }

        @keyframes arrowSlide {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          50% {
            transform: translateX(5px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .tab-visa.active .checkmark svg,
        .tab-crypto.active .checkmark svg,
        .tab-wish.active .checkmark svg {
          fill: white;
        }

        @media (max-width: 640px) {
          .tab {
            padding: 1.5rem 2rem;
            font-size: 1.125rem;
          }

          .tab-icon-wrapper {
            width: 48px;
            height: 48px;
          }

          .tab-icon {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}

function Icon({ kind }: { kind: OptionKey }) {
  const base = { width: 32, height: 32 } as const;
  if (kind === "card") {
    return (
      <svg className="tab-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={base} aria-hidden>
        <rect x="2" y="8" width="28" height="16" rx="3" fill="white" opacity="0.95" />
        <rect x="2" y="8" width="28" height="16" rx="3" stroke="white" strokeWidth="2" />
        <rect x="2" y="13" width="28" height="4" fill="rgba(59,130,246,0.8)" />
        <rect x="5" y="20" width="8" height="3" rx="1.5" fill="rgba(59,130,246,0.9)" />
        <rect x="15" y="20" width="6" height="3" rx="1.5" fill="rgba(59,130,246,0.9)" />
        <circle cx="25" cy="21.5" r="2" fill="rgba(59,130,246,0.9)" />
      </svg>
    );
  }
  if (kind === "crypto") {
    return (
      <svg className="tab-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={base} aria-hidden>
        <circle cx="16" cy="16" r="13" fill="white" opacity="0.95" />
        <circle cx="16" cy="16" r="13" stroke="white" strokeWidth="2" />
        <path
          d="M16 7V25M11 11H18.5C19.88 11 21 12.12 21 13.5C21 14.88 19.88 16 18.5 16H11M11 16H19C20.38 16 21.5 17.12 21.5 18.5C21.5 19.88 20.38 21 19 21H11M11 11V21"
          stroke="rgba(245,158,11,0.9)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className="tab-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={base} aria-hidden>
      <path d="M26 10H6C4.9 10 4 10.9 4 12V24C4 25.1 4.9 26 6 26H26C27.1 26 28 25.1 28 24V12C28 10.9 27.1 10 26 10Z" fill="white" opacity="0.95" />
      <path d="M26 10H6C4.9 10 4 10.9 4 12V24C4 25.1 4.9 26 6 26H26C27.1 26 28 25.1 28 24V12C28 10.9 27.1 10 26 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 10V8C22 7.46957 21.7893 6.96086 21.4142 6.58579C21.0391 6.21071 20.5304 6 20 6H12C11.4696 6 10.9609 6.21071 10.5858 6.58579C10.2107 6.96086 10 7.46957 10 8V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="18" r="3" fill="rgba(239,68,68,0.9)" />
      <path d="M13 18H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 15V21" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
