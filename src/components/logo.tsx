import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-10 w-auto", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="silk-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g style={{ filter: "url(#glow)" }}>
        <path
          d="M 20,80 Q 50,20 80,80"
          stroke="url(#silk-gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 20,20 Q 50,80 80,20"
          stroke="url(#silk-gradient)"
          strokeWidth="8"
          fill="none"

          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
