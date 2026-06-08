import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalBoxProps {
  title?: string;
  children: ReactNode;
  className?: string;
  tone?: "primary" | "muted" | "accent";
  dense?: boolean;
}

export function TerminalBox({ title, children, className, tone = "primary", dense = false }: TerminalBoxProps) {
  const borderColor =
    tone === "accent"
      ? "border-accent/70"
      : tone === "muted"
      ? "border-muted-foreground/40"
      : "border-primary/60";
  const titleColor =
    tone === "accent" ? "text-accent" : tone === "muted" ? "text-muted-foreground" : "text-primary";

  return (
    <div
      className={cn(
        "relative border-2 border-double bg-background/70 font-mono text-[12.5px] text-foreground/90",
        borderColor,
        className
      )}
    >
      {title && (
        <div
          className={cn(
            "absolute -top-[10px] left-3 px-2 bg-background uppercase tracking-[0.18em] text-[10.5px]",
            titleColor
          )}
        >
          {title}
        </div>
      )}
      <div className={cn(dense ? "px-3 py-2" : "px-3 py-2.5", title && "pt-3")}>{children}</div>
    </div>
  );
}

export function TerminalButton({
  children,
  onClick,
  active = false,
  className,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "border border-primary/50 px-2 py-[3px] font-mono text-[11px] uppercase tracking-wider transition-colors",
        "hover:bg-primary/15 hover:text-primary hover:border-primary",
        active && "bg-primary/20 text-primary border-primary",
        className
      )}
    >
      {children}
    </button>
  );
}
