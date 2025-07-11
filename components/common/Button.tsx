import React from 'react';
import { ButtonProps } from '../Interfaces/Ui.interface';


export default function Button({
  children,
  onClick,
  width,
  height,
  padding,
  margin,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const style: React.CSSProperties = {
    width,
    height,
    padding,
    margin,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`
        bg-primary text-white rounded cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}
