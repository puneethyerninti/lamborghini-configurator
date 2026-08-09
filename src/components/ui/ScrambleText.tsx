"use client";

import React, { useEffect, useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

export function ScrambleText({ text, active = true, delay = 0, className = "", hoverMode = false }: {
  text: string;
  active?: boolean;
  delay?: number;
  className?: string;
  hoverMode?: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Determine if we should scramble
    const shouldScramble = hoverMode ? isHovered : active;

    if (!shouldScramble) {
      setDisplayText(text);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setDisplayText("");
    
    // Start after delay (skip delay if hoverMode)
    const timeout = setTimeout(() => {
      let iteration = 0;
      const maxIterations = text.length * 2;
      
      intervalRef.current = setInterval(() => {
        setDisplayText(prev => {
          return text.split("").map((letter, index) => {
            if (index < iteration / 2) {
              return text[index];
            }
            if (letter === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("");
        });
        
        if (iteration >= maxIterations) {
          clearInterval(intervalRef.current!);
        }
        iteration += 1;
      }, 30);
    }, hoverMode ? 0 : delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, text, delay, hoverMode, isHovered]);

  return (
    <span 
      className={className} 
      onMouseEnter={() => hoverMode && setIsHovered(true)}
      onMouseLeave={() => hoverMode && setIsHovered(false)}
    >
      {((hoverMode ? isHovered : active)) ? (displayText || " ") : text}
    </span>
  );
}
