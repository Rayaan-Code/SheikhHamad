import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'short' | 'arabic';
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'full', color = "text-purple" }) => {
  return (
    <div className={`flex flex-col items-center md:items-start select-none ${className}`}>
      <div className="flex flex-col">
        <span className={`font-arabic text-3xl leading-none ${color} tracking-tight`}>
          شيخ حمد بن عاصف الشافعي الأثري
        </span>
        {variant === 'full' && (
          <span className={`font-sans text-[10px] uppercase tracking-[0.3em] font-black mt-2 ${color} opacity-60`}>
            Shaykh Hamad bin Aasif Ash-Shafi'i al-Athari
          </span>
        )}
      </div>
    </div>
  );
};
