import React from 'react';

const variants = {
  new: 'bg-[#E31E24] text-white',
  bestseller: 'bg-[#0A0A0A] text-white',
  school: 'bg-white text-[#0A0A0A] border border-[#0A0A0A]',
  default: 'bg-[#9CA3AF] text-white',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}