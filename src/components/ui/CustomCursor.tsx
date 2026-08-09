"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (window.innerWidth < 768) {
      setIsMobile(true);
      return;
    }
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over interactive elements
      if (
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("data-cursor") === "hover"
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (!isMounted || isMobile) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          rotate: isHovering ? 45 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 25,
          mass: 0.1,
        }}
      >
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <g transform="translate(2,2) scale(0.85)">
            <path 
              d="M2,0 L30,0 C30,0 32,15 16,32 C0,15 2,0 2,0 Z" 
              fill={isHovering ? "#ffffff" : "transparent"} 
              stroke="#ffffff" 
              strokeWidth="2"
            />
            <path 
              d="M16,8 L19,13 L23,11 L20,16 L25,21 L16,23 L7,21 L12,16 L9,11 L13,13 Z" 
              fill={isHovering ? "#050505" : "#b59b4c"}
            />
          </g>
        </svg>
      </motion.div>
    </>
  );
}
