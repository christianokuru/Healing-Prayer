import { cn } from "@/lib/cn";

// Candle illustrations (UI.md section 3.4). Flames flicker unless the user prefers reduced motion.

function Flame({ x, top, delay }: { x: number; top: number; delay: string }) {
  return (
    <g
      className="animate-flicker"
      style={{ transformBox: "fill-box", transformOrigin: "50% 100%", animationDelay: delay }}
    >
      <ellipse cx={x} cy={top - 22} rx="10" ry="18" fill="#ffd27a" />
      <ellipse cx={x} cy={top - 18} rx="5" ry="10" fill="#fff6d6" />
    </g>
  );
}

function Candle({ x, height, delay }: { x: number; height: number; delay: string }) {
  const top = 380 - height;
  return (
    <g>
      <circle cx={x} cy={top - 20} r="46" fill="url(#candle-glow)" />
      <rect x={x - 12} y={top} width="24" height={height} rx="4" fill="#fbf1e2" />
      <rect x={x - 12} y={top} width="8" height={height} rx="3" fill="#efdcc4" />
      <path d={`M${x} ${top}v-8`} stroke="#3e2350" strokeWidth="2" />
      <Flame x={x} top={top} delay={delay} />
    </g>
  );
}

/** Three lit candles in a chapel archway, for the homepage hero. */
export function ChapelCandles({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 420"
      role="img"
      aria-label="Three lit candles in a chapel archway"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <radialGradient id="candle-glow">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chapel-arch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24142f" />
          <stop offset="1" stopColor="#4b2a5e" />
        </linearGradient>
      </defs>
      <path
        d="M30 410V170A140 140 0 0 1 310 170V410Z"
        fill="url(#chapel-arch)"
        stroke="#f0c96a"
        strokeOpacity="0.7"
        strokeWidth="2"
      />
      <path
        d="M44 410V174A126 126 0 0 1 296 174V410"
        fill="none"
        stroke="#f0c96a"
        strokeOpacity="0.35"
      />
      <path
        d="M58 410V178A112 112 0 0 1 282 178V410"
        fill="none"
        stroke="#f0c96a"
        strokeOpacity="0.2"
        strokeDasharray="2 5"
      />
      <path
        d="M170 70v70M150 92h40"
        stroke="#f0c96a"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <Candle x={110} height={120} delay="0s" />
      <Candle x={170} height={170} delay="-0.8s" />
      <Candle x={230} height={95} delay="-1.6s" />
      <rect x="40" y="380" width="260" height="12" rx="3" fill="#c9962e" />
      <rect x="60" y="392" width="220" height="18" fill="#7a560f" opacity="0.6" />
    </svg>
  );
}

/** A single small lit candle, for the top of arch cards. */
export function SingleCandle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width="40"
      height="60"
      viewBox="0 0 40 60"
      className={cn("shrink-0", className)}
    >
      <circle cx="20" cy="16" r="16" fill="#ffd27a" opacity="0.25" />
      <g
        className="animate-flicker"
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      >
        <ellipse cx="20" cy="16" rx="6" ry="11" fill="#e8a93a" />
        <ellipse cx="20" cy="18" rx="3" ry="6" fill="#fff3cf" />
      </g>
      <rect x="12" y="30" width="16" height="28" rx="3" fill="#ead7bd" />
    </svg>
  );
}
