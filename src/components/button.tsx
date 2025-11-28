import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "action"
    | "status"
    | "submit"
    | "reset"
    | "disabled"
    | "maroon"
    | "view"; // <-- added "view"
  size?: "sm" | "md" | "lg" | "xs";
}

export default function Button({
  variant = "primary",
  size = "sm",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    " font-medium transition duration-200 focus:outline-none inline-flex items-center justify-center";

  const sizeStyles = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }[size];

  const variantStyles = {
    primary:
      "rounded-sm bg-[var(--forest-green)] text-white hover:bg-[#004d38]",
    secondary:
      "rounded-sm bg-[var(--grey)] text-[var(--black)]  hover:bg-[#D0D0D0]",
    action: "bg-[var(--grey)] text-[var(--black)]   hover:bg-[#D0D0D0]",
    status:
      " rounded-3xl bg-[var(--grey)] text-[var(--black)]   hover:bg-[#D0D0D0]",
    submit: "rounded-sm bg-[var(--forest-green)] text-white hover:bg-[#004d38]",
    reset: "rounded-sm bg-[var(--maroon)] text-white hover:bg-[#660000]",
    disabled:
      "rounded-sm bg-[var(--grey)] text-[var(--dark-grey)] cursor-not-allowed",
    maroon: "rounded-sm bg-[var(--maroon)] text-white hover:bg-[#660000]",
    view: "rounded-md bg-[var(--grey)] text-[var(--black)] hover:bg-[#D0D0D0] py-0.5 px-3 text-xs",
  }[variant];

  return (
    <button
      className={clsx(baseStyles, sizeStyles, variantStyles, className)}
      {...props}
    >
      {children}
    </button>
  );
}
