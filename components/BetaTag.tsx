import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const betaTagVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-blue-50 text-blue-700 ring-blue-700/10",
        primary: "bg-primary/10 text-primary ring-primary/20",
        secondary: "bg-secondary/10 text-secondary ring-secondary/20",
        success: "bg-green-50 text-green-700 ring-green-600/20",
        warning: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
        danger: "bg-red-50 text-red-700 ring-red-600/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BetaTagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof betaTagVariants> {
  marginTop?: string;
}

export function BetaTag({
  marginTop,
  className,
  variant,
  ...props
}: BetaTagProps) {
  return (
    <span
      style={{ marginLeft: "5px", marginTop: marginTop }}
      className={cn(betaTagVariants({ variant }), className)}
      {...props}
    >
      Beta
    </span>
  );
}
