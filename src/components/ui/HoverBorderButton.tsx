"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export function HoverBorderButton({ children, onClick, active = false, className = "", color = "#b59b4c" }: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all ${className} ${
        active ? "bg-white/5" : "bg-transparent"
      }`}
      style={{
        border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`
      }}
    >
      {/* Background glow on hover */}
      <motion.div
        animate={{ opacity: active ? 0.3 : opacity }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none absolute -inset-px opacity-0"
        style={{
          background: `radial-gradient(150px circle at ${position.x}px ${position.y}px, ${color}33, transparent 40%)`,
        }}
      />
      
      {/* Tracing border line via clip path or masking trick */}
      <motion.div
        animate={{ opacity }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background: `radial-gradient(100px circle at ${position.x}px ${position.y}px, ${color}, transparent 40%)`,
          WebkitMaskImage: 'linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskImage: 'linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      >
        <div className="w-full h-full bg-black/80" />
      </motion.div>

      <div className="relative z-10 w-full h-full flex flex-col text-left">
        {children}
      </div>
    </button>
  );
}
