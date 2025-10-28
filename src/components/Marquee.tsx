"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  items: React.ReactNode[];
  speed?: number; // pixels per second
  gapPx?: number;
  className?: string;
  trackClassName?: string;
};

export default function Marquee({ items, speed = 40, gapPx = 12, className = '', trackClassName = '' }: Props) {
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [baseWidth, setBaseWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // Triplicate to ensure coverage even on very wide viewports
  const loopItems = useMemo(() => items.concat(items).concat(items), [items]);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.scrollWidth;
    // We render 3x; base width equals one sequence (total/3)
    const base = Math.max(1, Math.round(w / 3));
    setBaseWidth(base);
    // Reset transform to avoid visible jump after resize/content change
    offsetRef.current = 0;
    el.style.transform = 'translateX(0px)';
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure, items.length]);

  useEffect(() => {
    if (reduceMotion) return;
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // seconds
      lastTsRef.current = ts;
      if (!paused && baseWidth > 0) {
        const dx = -speed * dt; // move left
        let next = offsetRef.current + dx;
        // wrap seamlessly when one sequence width is traversed
        if (next <= -baseWidth) {
          next += baseWidth; // keep within [-baseWidth, 0)
        }
        offsetRef.current = next;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${next}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [baseWidth, paused, reduceMotion, speed]);

  return (
    <div className={`marquee ${className}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        ref={trackRef}
        className={`marquee__track inline-flex items-center select-none` + (trackClassName ? ` ${trackClassName}` : '')}
        style={{ gap: `${gapPx}px`, willChange: 'transform' }}
      >
        {loopItems.map((node, i) => (
          <div key={i} className="shrink-0">
            {node}
          </div>
        ))}
      </div>
      <style
        // edge fade; removed keyframes since we use rAF for continuous motion
        dangerouslySetInnerHTML={{
          __html: `
            .marquee{ mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
          `,
        }}
      />
    </div>
  );
}
