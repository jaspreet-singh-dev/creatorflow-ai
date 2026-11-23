import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-brand-purple text-white shadow hover:bg-brand-purple-hover active:scale-[0.98]",
        secondary:
          "bg-navy-800 text-slate-100 hover:bg-navy-700 border border-navy-700 active:scale-[0.98]",
        outline:
          "border border-navy-700 bg-transparent text-slate-200 hover:bg-navy-850 hover:text-white hover:border-navy-600",
        ghost:
          "text-slate-300 hover:bg-navy-850 hover:text-white",
        destructive:
          "bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30",
        blue:
          "bg-brand-blue text-white shadow hover:bg-brand-blue-hover active:scale-[0.98]",
        gradient:
          "bg-gradient-to-r from-brand-purple via-violet-600 to-brand-blue text-white shadow-glow hover:opacity-95 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
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
