import { Droplet } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  variant?: "default" | "light";
}

export function Logo({ size = "md", showText = true, variant = "default" }: LogoProps) {
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-14 w-14" : "h-10 w-10";
  const iconSize = size === "sm" ? 16 : size === "lg" ? 28 : 20;
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dim} rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand`}>
        <Droplet className="text-primary-foreground" size={iconSize} strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className={`${text} font-bold ${variant === "light" ? "text-white" : "text-foreground"}`}>
            Highest Wash
          </div>
          <div className={`text-[10px] font-medium tracking-widest uppercase ${variant === "light" ? "text-white/70" : "text-muted-foreground"}`}>
            Merchant
          </div>
        </div>
      )}
    </div>
  );
}
