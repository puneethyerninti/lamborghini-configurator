"use client";

import React, { useEffect, useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

export function ScrambleText({ text, active = true, delay = 0, className = "" }: {
  text: string;
  active?: boolean;
  delay?: number;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplayText(text);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setDisplayText("");
    
    // Start after delay
    const timeout = setTimeout(() => {
      let iteration = 0;
      const maxIterations = text.length * 3;
      
      intervalRef.current = setInterval(() => {
        setDisplayText(prev => {
          return text.split("").map((letter, index) => {
            if (index < iteration / 3) {
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
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, text, delay]);

  return (
    <span className={className}>
      {active ? (displayText || " ") : text}
    </span>
  );
}
