import React from 'react';

const variants = {
  primary: 'bg-[#E31E24] text-white hover:bg-[#c41a1f]',
  secondary: 'border-2 border-[#E31E24] text-[#E31E24] hover:bg-[#E31E24] hover:text-white',
  dark: 'bg-[#0A0A0A] text-white hover:bg-[#1a1a1a]',
  outline: 'border-2 border-white text-white hover:bg-white hover:text-[#0A0A0A]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  href,
}) {
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold tracking-wide
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  if (href) {
    return (
      <a href={href} className={baseClasses} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}