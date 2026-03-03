import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center tracking-widest uppercase transition-all duration-300 font-medium";
    
    const variants = {
      primary: "bg-foreground text-background hover:bg-gray-300 disabled:opacity-50",
      secondary: "bg-transparent border border-border text-foreground hover:bg-surface",
      ghost: "bg-transparent text-foreground hover:opacity-70",
    };

    const sizes = {
      sm: "text-[10px] px-4 py-2",
      md: "text-xs px-6 py-3 md:px-8 md:py-4",
      lg: "text-sm px-10 py-5",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
