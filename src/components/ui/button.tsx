import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs sm:text-sm font-extrabold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-400 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-mint-400 text-black shadow-glow hover:bg-mint-500 hover:shadow-glow-lg border border-emerald-300/50 font-black",
        secondary:
          "bg-void-850 text-slate-200 hover:bg-void-800 hover:text-white border border-white/10 hover:border-mint-400/40 shadow-card",
        outline:
          "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-mint-400/10 hover:border-mint-400/50 hover:text-mint-400 backdrop-blur-md shadow-sm",
        ghost:
          "text-slate-300 hover:bg-white/[0.06] hover:text-mint-400",
        destructive:
          "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25",
        blue:
          "bg-cyber-500 text-black shadow hover:bg-cyber-600 border border-cyan-300/40 font-bold",
        gradient:
          "mint-btn-gradient",
        amber:
          "bg-gradient-to-r from-solar-400 to-solar-500 text-black font-black shadow-glow-amber hover:opacity-95 border border-amber-300/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-7 text-sm sm:text-base font-black tracking-normal",
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
