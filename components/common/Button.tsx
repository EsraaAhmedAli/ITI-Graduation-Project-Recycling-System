import React from "react";
import { ButtonProps } from "../Interfaces/Ui.interface";

const defaultClassName =
  "bg-primary text-white rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export default function Button({
  children,
  width,
  height,
  padding,
  margin,
  className = "",
  loading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const style: React.CSSProperties = {
    width,
    height,
    padding,
    margin,
  };

  const combinedClassName = `
    bg-primary text-white rounded cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    inline-flex items-center justify-center
    ${className}
  `.trim();

  return (
    <button
      style={style}
      className={combinedClassName}
      disabled={loading || disabled} // disable when loading
      {...rest}
    >
      {loading && (
        <svg
          aria-hidden="true"
          role="status"
          className="inline w-4 h-4 me-2 animate-spin"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M100 50.5908C100 78.2051..." fill="#E5E7EB" />
          <path d="M93.9676 39.0409C96.393..." fill="currentColor" />
        </svg>
      )}
      {children}
    </button>
  );
}
