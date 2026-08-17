import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { colorConfig } from "../../styles/colorConfig";

const myButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "hover:opacity-90",
        outline: "border hover:opacity-80",
        ghost: "hover:opacity-80",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface MyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof myButtonVariants> {
  asChild?: boolean;
}

const MyButton = React.forwardRef<HTMLButtonElement, MyButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Aplicar estilos de color según la variante
    let style: React.CSSProperties = {};

    if (variant === "default") {
      style = {
        background: 'var(--accent-primary)',
        color: 'var(--text-inverted)',
      };
    } else if (variant === "outline") {
      style = {
        borderColor: 'var(--border-primary)',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-surface)',
      };
    } else if (variant === "ghost") {
      style = {
        color: 'var(--text-primary)',
      };
    } else if (variant === "link") {
      style = {
        color: 'var(--accent-primary)',
      };
    }

    return (
      <Comp
        className={cn(myButtonVariants({ variant, size, className }))}
        ref={ref}
        style={{ ...style, ...props.style }}
        {...props}
      />
    );
  }
);

MyButton.displayName = "MyButton";

export { MyButton, myButtonVariants };
