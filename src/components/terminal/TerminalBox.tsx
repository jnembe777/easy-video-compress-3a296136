import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalBoxProps {
  title?: string;
  children: ReactNode;
  className?: string;
  tone?: "primary" | "muted" | "accent";
}

export function TerminalBox({ title, children, className, tone = "primary" }: TerminalBoxProps) {
  const borderColor =
    tone === "accent"
      ? "border-accent/70"
      : tone === "muted"
      ? "border-muted-foreground/40"
      : "border-primary/70";
  const titleColor =
    tone === "accent" ? "text-accent" : tone === "muted" ? "text-muted-foreground" : "text-primary";

  return (
    <div
      className={cn(
        "relative border-2 border-double bg-background/80 font-mono text-[13px] text-foreground/90",
        borderColor,
        className
      )}
    >
      {title && (
        <div className={cn("px-3 py-1 border-b border-double border-current uppercase tracking-wider text-xs", titleColor)}>
          {title}
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}

export function TerminalButton({
  children,
  onClick,
  active = false,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border border-double border-primary/60 px-2 py-1 font-mono text-xs uppercase tracking-wider transition-colors",
        "hover:bg-primary/15 hover:text-primary",
        active && "bg-primary/20 text-primary border-primary",
        className
      )}
    >
      [ {children} ]
    </button>
  );
}
