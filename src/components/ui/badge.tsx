import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-tight transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-mint-400/40 bg-mint-400/15 text-mint-400 font-extrabold shadow-sm",
        mint:
          "border-mint-400/40 bg-mint-400/15 text-mint-400 font-extrabold shadow-sm",
        cyber:
          "border-cyan-400/40 bg-cyan-400/15 text-cyan-300 font-extrabold shadow-sm",
        solar:
          "border-amber-400/40 bg-amber-400/15 text-amber-300 font-bold shadow-sm",
        secondary:
          "border-white/10 bg-void-850 text-slate-300",
        blue:
          "border-cyan-400/40 bg-cyan-400/15 text-cyan-300 font-extrabold",
        success:
          "border-emerald-400/40 bg-emerald-400/15 text-emerald-300 font-bold",
        warning:
          "border-amber-400/40 bg-amber-400/15 text-amber-300 font-bold",
        destructive:
          "border-rose-400/40 bg-rose-400/15 text-rose-300 font-bold",
        outline:
          "border-white/15 text-slate-300 bg-white/[0.03]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
