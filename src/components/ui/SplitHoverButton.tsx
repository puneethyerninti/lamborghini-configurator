"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function SplitHoverButton({ 
  primaryText, 
  secondaryText, 
  onClick, 
  className = "" 
}: {
  primaryText: string;
  secondaryText: string;
  onClick?: () => void;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden group flex items-center justify-center ${className}`}
      data-cursor="hover"
    >
      <div className="relative flex items-center justify-center h-full w-full">
        {/* Primary Text (Slides up and disappears) */}
        <motion.span
          initial={{ y: 0, opacity: 1 }}
          animate={{ 
            y: isHovered ? -20 : 0, 
            opacity: isHovered ? 0 : 1,
            skewY: isHovered ? 5 : 0 
          }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute block"
        >
          {primaryText}
        </motion.span>
        
        {/* Secondary Text (Slides up from bottom) */}
        <motion.span
          initial={{ y: 20, opacity: 0, skewY: 5 }}
          animate={{ 
            y: isHovered ? 0 : 20, 
            opacity: isHovered ? 1 : 0,
            skewY: isHovered ? 0 : 5 
          }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute block text-[#b59b4c]"
        >
          {secondaryText}
        </motion.span>
        
        {/* Invisible spacer to maintain button size */}
        <span className="opacity-0 block">{primaryText.length > secondaryText.length ? primaryText : secondaryText}</span>
      </div>
    </button>
  );
}
