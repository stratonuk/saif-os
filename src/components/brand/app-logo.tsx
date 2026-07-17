import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: number;
  className?: string;
  /** White rounded frame around the mark. Default true. */
  framed?: boolean;
}

export function AppLogo({ size = 32, className, framed = true }: AppLogoProps) {
  /* Brand mark from /public — next/image not needed for tiny local assets */
  const mark = (
    // eslint-disable-next-line @next/next/no-img-element -- local brand asset
    <img
      src="/brand/logo.png?v=2"
      alt=""
      width={framed ? Math.round(size * 0.78) : size}
      height={framed ? Math.round(size * 0.78) : size}
      className="object-contain"
      aria-hidden
      draggable={false}
    />
  );

  if (!framed) {
    return <span className={cn("inline-flex", className)}>{mark}</span>;
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-white",
        className
      )}
      style={{ width: size, height: size }}
    >
      {mark}
    </span>
  );
}
