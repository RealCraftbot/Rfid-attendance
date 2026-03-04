'use client';

import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'full';
  className?: string;
  iconSize?: number;
  textColor?: string;
  subtextColor?: string;
}

export default function Logo({ 
  variant = 'full', 
  className = '', 
  iconSize = 32,
  textColor = 'text-brand-navy',
  subtextColor = 'text-brand-navy/40'
}: LogoProps) {
  const iconSvg = (
    <svg 
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path 
        d="M25 0H85L60 45H0L25 0Z" 
        fill="#0143DF" 
      />
      <path 
        d="M15 55H75L100 100H40L15 55Z" 
        fill="#0143DF" 
      />
    </svg>
  );

  if (variant === 'icon') {
    return iconSvg;
  }

  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      <div className="flex items-center gap-2">
        {iconSvg}
        <span className={`font-bold text-xl tracking-tight ${textColor}`}>
          Craft<span className="text-brand-blue">Innovations</span>
        </span>
      </div>
      <p className={`text-[8px] font-bold uppercase tracking-[0.2em] ml-10 ${subtextColor}`}>
        Nigeria Limited
      </p>
    </div>
  );
}
