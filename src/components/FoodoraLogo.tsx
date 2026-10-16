import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface FoodoraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  whiteText?: boolean;
}

export const FoodoraLogo: React.FC<FoodoraLogoProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div className={`flex items-center gap-2.5 font-black tracking-tight ${sizeClasses[size]} select-none group`}>
      <div className="relative flex items-center justify-center p-2 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#E8C66A] to-[#B89628] text-[#0B0F14] shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
        <UtensilsCrossed className={iconSizes[size]} />
      </div>
      <div className="flex items-baseline">
        <span className="text-[#F8FAFC] font-extrabold tracking-wider">FOOD</span>
        <span className="text-[#D4AF37] font-black">ORA</span>
        <span className="text-[#E8C66A] text-[10px] font-black ml-1.5 px-1.5 py-0.5 rounded-md bg-[#1C2530] text-[#D4AF37] border border-[#D4AF37]/40 uppercase tracking-widest">
          LK
        </span>
      </div>
    </div>
  );
};
