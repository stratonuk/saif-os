import { cn } from "@/lib/utils";

interface StratonLogoProps {
  size?: number;
  className?: string;
}

/** Straton workspace mark — blue tile with white S (full-bleed). */
export function StratonLogo({ size = 32, className }: StratonLogoProps) {
  return (
    <span
      className={cn("flex shrink-0 overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/straton-logo.png?v=1"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        aria-hidden
        draggable={false}
      />
    </span>
  );
}
