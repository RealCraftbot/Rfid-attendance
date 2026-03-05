'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  variant?: 'icon' | 'full';
  className?: string;
  iconSize?: number;
  textColor?: string; 
  subtextColor?: string; 
  useWhiteLogo?: boolean; // We added this just in case we need manual control!
}

export default function Logo({ 
  variant = 'full', 
  className = '', 
  iconSize = 32,
  textColor = 'text-brand-navy', // Default is the dark navy for the dashboard
  useWhiteLogo,
}: LogoProps) {
  
  // THE MAGIC TRICK: 
  // If the page asks for white text, OR if we manually say useWhiteLogo, we use logo.png.
  // Otherwise, we default to the dashboard's logo2.png.
  const isDarkBackground = useWhiteLogo || textColor.includes('white');
  
  const currentLogoSrc = isDarkBackground ? '/logo.png' : '/logo2.png';

  // For collapsed sidebars
  if (variant === 'icon') {
    return (
      <Image 
        src={currentLogoSrc} 
        alt="CraftInnovations Icon" 
        width={iconSize} 
        height={iconSize} 
        className={`object-contain shrink-0 ${className}`}
      />
    );
  }

  // For the main dashboard and landing pages
  return (
    <div className={`flex items-center ${className}`}>
      <Image 
        src={currentLogoSrc} 
        alt="CraftInnovations Logo" 
        width={180}  
        height={45} 
        className="object-contain"
        priority
      />
    </div>
  );
}