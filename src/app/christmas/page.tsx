"use client";

import { useEffect, useRef } from "react";

type WelcomeConfig = {
  christmas_greeting: string;
  welcome_message: string;
  background_color: string;
  text_color: string;
  message_color: string;
  shadow_color: string;
  ornament_color: string;
};

const defaultConfig: WelcomeConfig = {
  christmas_greeting: "Merry Christmas",
  welcome_message: "WELLCOME",
  background_color: "#1a472a",
  text_color: "#DC143C",
  message_color: "#DC143C",
  shadow_color: "#8B0000",
  ornament_color: "#ff0000",
};

declare global {
  interface Window {
    elementSdk?: {
      init: (options: {
        defaultConfig: WelcomeConfig;
        onConfigChange: (config?: Partial<WelcomeConfig>) => void;
        mapToCapabilities: () => {
          recolorables: Array<{
            get: () => string;
            set: (value: string) => void;
          }>;
          borderables: unknown[];
          fontEditable: unknown;
          fontSizeable: unknown;
        };
        mapToEditPanelValues: () => Map<string, string>;
      }) => void;
      setConfig?: (config: Partial<WelcomeConfig>) => void;
    };
  }
}

export default function ChristmasWelcomePage() {
  const welcomeRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add("christmas-welcome-page");
    document.documentElement.classList.add("christmas-welcome-page");
    return () => {
      document.body.classList.remove("christmas-welcome-page");
      document.documentElement.classList.remove("christmas-welcome-page");
    };
  }, []);

  useEffect(() => {
    const welcomeScreen = welcomeRef.current;
    const greetingContainer = greetingRef.current;
    const messageElement = messageRef.current;
    if (!welcomeScreen || !greetingContainer || !messageElement) return;

    const icons = ["🎄", "🎁", "⭐", "🔔", "🎅", "🦌", "🕯️", "🎀"];
    const ornamentIcons = ["🎄", "⭐", "🎁", "🔔", "🎀", "🦌"];
    const sparklePositions = [
      { top: "10%", left: "20%", delay: "0s" },
      { top: "30%", right: "25%", delay: "0.5s" },
      { bottom: "15%", left: "30%", delay: "1s" },
      { bottom: "35%", right: "20%", delay: "1.5s" },
    ];
    const ornamentPositions = [
      { top: "15%", left: "10%", delay: "1.5s" },
      { top: "20%", right: "15%", delay: "1.7s" },
      { bottom: "25%", left: "12%", delay: "1.9s" },
      { bottom: "20%", right: "10%", delay: "2.1s" },
      { top: "50%", left: "5%", delay: "2.3s" },
      { top: "50%", right: "5%", delay: "2.5s" },
    ];

    const snowflakes: HTMLDivElement[] = [];
    const ornaments: HTMLDivElement[] = [];
    const sparkles: HTMLDivElement[] = [];

    const configState: WelcomeConfig = { ...defaultConfig };

    const adjustBrightness = (hex: string, percent: number) => {
      const num = parseInt(hex.replace("#", ""), 16);
      const r = Math.min(255, Math.max(0, (num >> 16) + percent));
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
      const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
      return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
    };

    const applyConfig = (partial: Partial<WelcomeConfig>) => {
      const merged = { ...configState, ...partial };
      Object.assign(configState, merged);

      welcomeScreen.style.background = `linear-gradient(135deg, ${configState.background_color} 0%, ${adjustBrightness(
        configState.background_color,
        20,
      )} 50%, ${configState.background_color} 100%)`;

      messageElement.innerHTML = "";
      const words = (configState.welcome_message || defaultConfig.welcome_message).split(" ");
      words.forEach((word, index) => {
        const span = document.createElement("span");
        if (index === 0) {
          span.className = "special-word";
        }
        span.textContent = word;
        messageElement.appendChild(span);
        if (index < words.length - 1) {
          messageElement.appendChild(document.createTextNode(" "));
        }
      });
      messageElement.style.color = configState.message_color;

      greetingContainer.innerHTML = "";
      (configState.christmas_greeting || defaultConfig.christmas_greeting).split("").forEach((letter, index) => {
        const span = document.createElement("span");
        span.className = "bubble-letter";
        span.textContent = letter;
        span.style.animationDelay = `${index * 0.1}s`;
        span.style.color = configState.text_color;
        span.style.textShadow = `3px 3px 0px ${configState.shadow_color}, 5px 5px 10px rgba(0, 0, 0, 0.5)`;
        greetingContainer.appendChild(span);
      });

      ornaments.forEach((node) => {
        node.style.color = configState.ornament_color;
      });
    };

    const createSnowflakes = () => {
      for (let i = 0; i < 25; i += 1) {
        const snowflake = document.createElement("div");
        snowflake.className = "snowflake";
        snowflake.textContent = icons[Math.floor(Math.random() * icons.length)];
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
        snowflake.style.animationDelay = `${Math.random() * 2}s`;
        snowflake.style.fontSize = `${Math.random() * 0.5 + 0.5}em`;
        welcomeScreen.appendChild(snowflake);
        snowflakes.push(snowflake);
      }
    };

    const createOrnaments = () => {
      ornamentPositions.forEach((position, index) => {
        const ornament = document.createElement("div");
        ornament.className = "ornament";
        ornament.textContent = ornamentIcons[index % ornamentIcons.length];
        ornament.style.top = position.top || "auto";
        ornament.style.left = position.left || "auto";
        ornament.style.right = position.right || "auto";
        ornament.style.bottom = position.bottom || "auto";
        ornament.style.animationDelay = position.delay;
        ornament.style.color = configState.ornament_color;
        welcomeScreen.appendChild(ornament);
        ornaments.push(ornament);
      });
    };

    const createSparkles = () => {
      sparklePositions.forEach((pos) => {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";
        sparkle.textContent = "%";
        sparkle.style.top = pos.top || "auto";
        sparkle.style.right = pos.right || "auto";
        sparkle.style.left = pos.left || "auto";
        sparkle.style.bottom = pos.bottom || "auto";
        sparkle.style.animationDelay = pos.delay;
        welcomeScreen.appendChild(sparkle);
        sparkles.push(sparkle);
      });
    };

    const onConfigChange = (config: Partial<WelcomeConfig> = {}) => {
      applyConfig(config);
    };

    const mapToCapabilities = () => ({
      recolorables: [
        {
          get: () => configState.background_color,
          set: (value: string) => {
            applyConfig({ background_color: value });
            window.elementSdk?.setConfig?.({ background_color: value });
          },
        },
        {
          get: () => configState.text_color,
          set: (value: string) => {
            applyConfig({ text_color: value });
            window.elementSdk?.setConfig?.({ text_color: value });
          },
        },
        {
          get: () => configState.message_color,
          set: (value: string) => {
            applyConfig({ message_color: value });
            window.elementSdk?.setConfig?.({ message_color: value });
          },
        },
        {
          get: () => configState.shadow_color,
          set: (value: string) => {
            applyConfig({ shadow_color: value });
            window.elementSdk?.setConfig?.({ shadow_color: value });
          },
        },
        {
          get: () => configState.ornament_color,
          set: (value: string) => {
            applyConfig({ ornament_color: value });
            window.elementSdk?.setConfig?.({ ornament_color: value });
          },
        },
      ],
      borderables: [],
      fontEditable: undefined,
      fontSizeable: undefined,
    });

    const mapToEditPanelValues = () =>
      new Map([
        ["christmas_greeting", configState.christmas_greeting],
        ["welcome_message", configState.welcome_message],
      ]);

    createSnowflakes();
    createOrnaments();
    createSparkles();
    applyConfig(configState);

    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities,
        mapToEditPanelValues,
      });
    }

    return () => {
      snowflakes.forEach((el) => el.remove());
      ornaments.forEach((el) => el.remove());
      sparkles.forEach((el) => el.remove());
    };
  }, []);

  return (
    <>
      <div className="christmas-page">
        <div id="welcome-screen" ref={welcomeRef}>
          <div className="christmas-greeting" id="christmas-greeting" ref={greetingRef} />
          <div className="welcome-message" id="welcome-message" ref={messageRef}>
            Welcome to our festive website
          </div>
        </div>
      </div>
      <style jsx global>{`
        @view-transition { navigation: auto; }
        html.christmas-welcome-page,
        body.christmas-welcome-page {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold', cursive, sans-serif;
          overflow: hidden;
          height: 100%;
        }

        .christmas-page {
          height: 100vh;
          width: 100vw;
          position: relative;
        }

        #welcome-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .snowflake {
          position: absolute;
          top: -10%;
          font-size: 2em;
          opacity: 0;
          animation: fall linear infinite, iconPulse 2s ease-in-out infinite;
          background: linear-gradient(135deg, #ffd700, #ffa500, #ff6347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
        }

        @keyframes fall {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translateY(110%);
          }
        }

        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
          }
          50% {
            transform: scale(1.2);
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.9));
          }
        }

        .christmas-greeting {
          font-size: 5em;
          font-weight: bold;
          text-align: center;
          margin-bottom: 30px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }

        .bubble-letter {
          display: inline-block;
          color: #dc143c;
          text-shadow: 3px 3px 0px #8b0000, 5px 5px 15px rgba(220, 20, 60, 0.6), 0 0 20px rgba(220, 20, 60, 0.4);
          animation: bubbleBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          opacity: 0;
          transform: scale(0) translateY(-100px) rotate(-180deg);
        }

        @keyframes bubbleBounce {
          0% {
            opacity: 0;
            transform: scale(0) translateY(-100px) rotate(-180deg);
          }
          40% {
            transform: scale(1.3) translateY(15px) rotate(5deg);
          }
          60% {
            transform: scale(0.85) translateY(-10px) rotate(-3deg);
          }
          75% {
            transform: scale(1.1) translateY(5px) rotate(2deg);
          }
          90% {
            transform: scale(0.95) translateY(-2px) rotate(-1deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotate(0deg);
          }
        }

        .bubble-letter:hover {
          animation: wiggle 0.6s ease-in-out infinite;
          cursor: pointer;
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg) scale(1) translateY(0);
          }
          15% {
            transform: rotate(-15deg) scale(1.15) translateY(-5px);
          }
          30% {
            transform: rotate(15deg) scale(1.2) translateY(-8px);
          }
          45% {
            transform: rotate(-12deg) scale(1.15) translateY(-5px);
          }
          60% {
            transform: rotate(12deg) scale(1.15) translateY(-5px);
          }
          75% {
            transform: rotate(-8deg) scale(1.1) translateY(-3px);
          }
        }

        .welcome-message {
          font-size: 2em;
          color: #ffffff;
          text-align: center;
          opacity: 0;
          animation: fadeInSlide 1.5s ease-out 2s forwards;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
          padding: 0 20px;
        }

        .special-word {
          font-family: "Brush Script MT", "Lucida Handwriting", cursive;
          font-size: 1.4em;
          color: #dc143c;
          font-weight: bold;
          text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.6), 0 0 30px rgba(220, 20, 60, 0.8), 0 0 50px rgba(220, 20, 60, 0.5);
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%,
          100% {
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.6), 0 0 30px rgba(220, 20, 60, 0.8), 0 0 50px rgba(220, 20, 60, 0.5);
          }
          50% {
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.6), 0 0 40px rgba(220, 20, 60, 1), 0 0 70px rgba(220, 20, 60, 0.7);
          }
        }

        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ornament {
          position: absolute;
          font-size: 2.5em;
          width: auto;
          height: auto;
          opacity: 0;
          background: linear-gradient(135deg, #ffd700, #ffa500, #ff6347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ornamentFloat 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, ornamentSway 3s ease-in-out 2.5s infinite, iconPulse 2s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.7));
        }

        @keyframes ornamentFloat {
          0% {
            opacity: 0;
            transform: translateY(-80px) translateX(-30px) scale(0.5);
          }
          60% {
            transform: translateY(10px) translateX(5px) scale(1.1);
          }
          80% {
            transform: translateY(-5px) translateX(-2px) scale(0.95);
          }
          100% {
            opacity: 0.9;
            transform: translateY(0) translateX(0) scale(1);
          }
        }

        @keyframes ornamentSway {
          0%,
          100% {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(10px) translateY(-5px);
          }
          75% {
            transform: translateX(-10px) translateY(-5px);
          }
        }

        .sparkle {
          position: absolute;
          font-size: 2.5em;
          font-weight: bold;
          opacity: 0.9;
          background: linear-gradient(135deg, #ffd700, #ffa500, #ff6347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: iconPulse 2s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.7));
        }

        .lights-container,
        .light {
          display: none;
        }

        @media (max-width: 768px) {
          .christmas-greeting {
            font-size: 3em;
            gap: 5px;
          }
          .welcome-message {
            font-size: 1.5em;
          }
          .ornament {
            font-size: 1.8rem !important;
          }
          .sparkle {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .christmas-greeting {
            font-size: 2em;
          }
          .welcome-message {
            font-size: 1.2em;
          }
        }
      `}</style>
    </>
  );
}
