import { useMemo } from "react";
import type { CSSProperties } from "react";
import "./Confetti.css";

const CONFETTI_COLORS = [
  "#c9a227",
  "#b4534a",
  "#5c7a6e",
  "#6b6399",
  "#1a1714",
  "#d4a574",
  "#7d8aa8",
  "#8f6b52",
];

export interface ConfettiProps {
  /** When true, confetti is visible and animating */
  active: boolean;
  /** Change to spawn a fresh burst with new random positions */
  burstKey: number;
}

export function Confetti({ active, burstKey }: ConfettiProps) {
  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 90 }, (_, i) => {
      const w = 6 + Math.random() * 7;
      const h = 8 + Math.random() * 10;
      const isStripe = Math.random() > 0.45;
      return {
        id: `${burstKey}-${i}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.45,
        duration: 2.6 + Math.random() * 2.2,
        drift: -40 + Math.random() * 80,
        spin: 480 + Math.random() * 720,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        w,
        h,
        isStripe,
        round: Math.random() > 0.72,
      };
    });
  }, [active, burstKey]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={
            "confetti-piece" +
            (p.round ? " confetti-piece--round" : "") +
            (p.isStripe ? " confetti-piece--rect" : " confetti-piece--ribbon")
          }
          style={
            {
              "--left": `${p.left}%`,
              "--delay": `${p.delay}s`,
              "--duration": `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
              "--pc": p.color,
              "--pw": `${p.w}px`,
              "--ph": `${p.h}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default Confetti;
