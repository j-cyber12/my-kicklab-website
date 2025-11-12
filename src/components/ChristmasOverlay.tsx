"use client";

import React, { useEffect, useRef } from "react";

export default function ChristmasOverlay() {
  const lightsRef = useRef<HTMLDivElement>(null);
  const snowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const snowContainer = snowRef.current;
    const lightsContainer = lightsRef.current;
    if (!snowContainer || !lightsContainer) return;

    const snowflakeChars = ["❄", "❅", "❆"];
    const snowflakes: HTMLDivElement[] = [];
    for (let i = 0; i < 60; i++) {
      const snowflake = document.createElement("div");
      snowflake.className = "snowflake";
      snowflake.textContent = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
      snowflake.style.left = Math.random() * 100 + "%";
      snowflake.style.animationDuration = (Math.random() * 3 + 5) + "s";
      snowflake.style.animationDelay = Math.random() * 5 + "s";
      snowflake.style.fontSize = (Math.random() * 0.5 + 0.5) + "em";
      snowContainer.appendChild(snowflake);
      snowflakes.push(snowflake);
    }

    const colors = ["\u0023ff0000", "\u002300ff00", "\u0023ffff00", "\u00230000ff", "\u0023ff00ff", "\u0023ff6600"];
    const lights: HTMLDivElement[] = [];
    for (let i = 0; i < 25; i++) {
      const light = document.createElement("div");
      light.className = "light";
      light.style.left = Math.random() * 100 + "%";
      light.style.top = Math.random() * 100 + "%";
      const color = colors[Math.floor(Math.random() * colors.length)];
      light.style.color = color as string;
      light.style.backgroundColor = color as string;
      light.style.animationDelay = Math.random() * 1.5 + "s";
      lightsContainer.appendChild(light);
      lights.push(light);
    }

    return () => {
      snowflakes.forEach((el) => el.remove());
      lights.forEach((el) => el.remove());
    };
  }, []);

  return (
    <div className="animation-overlay">
      <div className="lights-container" ref={lightsRef} />

      <div className="ornament ornament-1">🔴</div>
      <div className="ornament ornament-2">🟡</div>
      <div className="ornament ornament-3">🔵</div>
      <div className="ornament ornament-4">🟢</div>
      <div className="ornament ornament-5">🔴</div>
      <div className="ornament ornament-6">🟡</div>

      <div className="star star-1">✨</div>
      <div className="star star-2">✨</div>
      <div className="star star-3">✨</div>
      <div className="star star-4">✨</div>
      <div className="star star-5">⭐</div>
      <div className="star star-6">⭐</div>
      <div className="star star-7">✨</div>
      <div className="star star-8">⭐</div>

      <div className="holly holly-1">🎄</div>
      <div className="holly holly-2">🎁</div>
      <div className="holly holly-3">🔔</div>

      <div id="snowfall-container" ref={snowRef} />

      <style jsx global>{`
        .animation-overlay {
          position: relative;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .snowflake {
          position: absolute;
          top: -10px;
          color: white;
          font-size: 1em;
          opacity: 0.9;
          pointer-events: none;
          animation: fall linear infinite;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
        }

        @keyframes fall {
          to {
            transform: translateY(110vh) rotate(360deg);
          }
        }

        .ornament {
          position: absolute;
          pointer-events: none;
          animation: swing ease-in-out infinite;
          transform-origin: top center;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
        .ornament-1 { top: 8%; left: 15%; font-size: 3rem; animation-duration: 3s; }
        .ornament-2 { top: 12%; right: 18%; font-size: 2.5rem; animation-duration: 4s; animation-delay: 0.5s; }
        .ornament-3 { bottom: 20%; left: 12%; font-size: 2.8rem; animation-duration: 3.5s; animation-delay: 1s; }
        .ornament-4 { bottom: 15%; right: 15%; font-size: 2.3rem; animation-duration: 4.2s; animation-delay: 1.5s; }
        .ornament-5 { top: 50%; left: 8%; font-size: 2.6rem; animation-duration: 3.8s; animation-delay: 0.8s; }
        .ornament-6 { top: 45%; right: 10%; font-size: 2.4rem; animation-duration: 3.3s; animation-delay: 1.2s; }

        @keyframes swing {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }

        .star {
          position: absolute;
          color: #ffd700;
          font-size: 1.5rem;
          opacity: 0;
          animation: twinkle 2s ease-in-out infinite;
          pointer-events: none;
          filter: drop-shadow(0 0 4px #ffd700);
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .star-1 { top: 15%; left: 25%; animation-delay: 0s; }
        .star-2 { top: 25%; right: 20%; animation-delay: 0.7s; }
        .star-3 { bottom: 30%; left: 20%; animation-delay: 1.4s; }
        .star-4 { bottom: 25%; right: 25%; animation-delay: 2.1s; }
        .star-5 { top: 40%; left: 30%; animation-delay: 0.5s; }
        .star-6 { top: 60%; right: 30%; animation-delay: 1.8s; }
        .star-7 { top: 20%; left: 50%; animation-delay: 1.1s; }
        .star-8 { bottom: 35%; right: 15%; animation-delay: 0.3s; }

        .lights-container {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
        }
        .light {
          position: absolute;
          width: 10px; height: 10px; border-radius: 50%;
          animation: glow 1.5s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 10px currentColor; }
          50% { opacity: 1; box-shadow: 0 0 20px currentColor; }
        }

        .holly {
          position: absolute;
          font-size: 2rem;
          pointer-events: none;
          animation: float 4s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
        .holly-1 { top: 10%; left: 40%; animation-delay: 0s; }
        .holly-2 { top: 30%; right: 35%; animation-delay: 1.5s; }
        .holly-3 { bottom: 25%; left: 35%; animation-delay: 3s; }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }

        @media (max-width: 768px) {
          .ornament { font-size: 1.8rem !important; }
          .star { font-size: 1.2rem; }
          .holly { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}

