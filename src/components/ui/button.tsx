import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-purple text-white shadow-glow hover:bg-brand-purple-hover hover:shadow-glow-lg border border-purple-400/30",
        secondary:
          "bg-obsidian-850 text-slate-200 hover:bg-obsidian-800 hover:text-white border border-white/10 hover:border-violet-500/30 shadow-card",
        outline:
          "border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08] hover:border-violet-500/40 hover:text-white backdrop-blur-md shadow-sm",
        ghost:
          "text-slate-300 hover:bg-white/[0.06] hover:text-white",
        destructive:
          "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25",
        blue:
          "bg-brand-blue text-white shadow hover:bg-brand-blue-hover border border-blue-400/30",
        gradient:
          "cyber-btn-gradient",
        amber:
          "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-glow-amber hover:opacity-95 border border-amber-400/40",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base font-bold",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
