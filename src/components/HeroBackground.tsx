"use client";

import styles from "./HeroBackground.module.css";

const ICONS = ["🎄", "⭐", "🎁", "🔔", "❄️", "🎅"];

type Snowflake = {
  id: string;
  left: string;
  delay: string;
  duration: string;
  size: string;
};

type Star = {
  id: string;
  left: string;
  top: string;
  delay: string;
};

const SNOWFLAKES: Snowflake[] = [
  { id: "s1", left: "8%", delay: "0.4s", duration: "5.8s", size: "1.2em" },
  { id: "s2", left: "28%", delay: "1.1s", duration: "6.2s", size: "1.0em" },
  { id: "s3", left: "45%", delay: "0.3s", duration: "5.1s", size: "1.4em" },
  { id: "s4", left: "60%", delay: "2.0s", duration: "6.7s", size: "0.9em" },
  { id: "s5", left: "72%", delay: "1.6s", duration: "4.9s", size: "1.3em" },
  { id: "s6", left: "90%", delay: "0.8s", duration: "5.4s", size: "1.1em" },
  { id: "s7", left: "15%", delay: "2.2s", duration: "5.0s", size: "1.0em" },
  { id: "s8", left: "36%", delay: "0.7s", duration: "6.0s", size: "1.6em" },
  { id: "s9", left: "55%", delay: "3.0s", duration: "5.8s", size: "0.8em" },
  { id: "s10", left: "68%", delay: "1.0s", duration: "5.3s", size: "1.5em" },
  { id: "s11", left: "83%", delay: "2.5s", duration: "6.1s", size: "1.0em" },
  { id: "s12", left: "95%", delay: "1.2s", duration: "6.5s", size: "1.4em" },
];

const STARS: Star[] = [
  { id: "st1", left: "7%", top: "20%", delay: "0.3s" },
  { id: "st2", left: "22%", top: "70%", delay: "1.1s" },
  { id: "st3", left: "38%", top: "25%", delay: "0.6s" },
  { id: "st4", left: "53%", top: "60%", delay: "2.0s" },
  { id: "st5", left: "69%", top: "15%", delay: "1.4s" },
  { id: "st6", left: "85%", top: "55%", delay: "2.3s" },
  { id: "st7", left: "92%", top: "35%", delay: "0.8s" },
  { id: "st8", left: "40%", top: "80%", delay: "1.6s" },
  { id: "st9", left: "62%", top: "40%", delay: "0.9s" },
  { id: "st10", left: "10%", top: "50%", delay: "1.9s" },
  { id: "st11", left: "80%", top: "70%", delay: "0.5s" },
  { id: "st12", left: "28%", top: "10%", delay: "0.2s" },
  { id: "st13", left: "66%", top: "85%", delay: "1.7s" },
  { id: "st14", left: "95%", top: "20%", delay: "1.0s" },
  { id: "st15", left: "50%", top: "45%", delay: "0.4s" },
];

export default function HeroBackground() {
  return (
    <div className={styles.background}>
      {SNOWFLAKES.map((flake) => (
        <span
          key={flake.id}
          className={styles.snowflake}
          style={{
            left: flake.left,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
            fontSize: flake.size,
          }}
        >
          ❄
        </span>
      ))}
      {STARS.map((star) => (
        <span
          key={star.id}
          className={styles.star}
          style={{ left: star.left, top: star.top, animationDelay: star.delay }}
        />
      ))}
      {ICONS.map((icon, idx) => {
        const iconClass = styles[`icon${idx + 1}` as keyof typeof styles];
        return (
          <span key={icon} className={`${styles.christmasIcon} ${iconClass}`}>
            {icon}
          </span>
        );
      })}
    </div>
  );
}
