"use client";

import React, { useEffect, useRef, useState } from "react";
import { syncopate, montserrat } from "@/fonts";




const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

interface StatCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  label: string;
  delay?: number;
  active: boolean;
}

export function StatCounter({ 
  value, 
  duration = 2000, 
  decimals = 0, 
  suffix = "", 
  label,
  delay = 0,
  active 
}: StatCounterProps) {
  const [displayString, setDisplayString] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setDisplayString("");
      setHasStarted(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let startTime = 0;
    let timeoutId: NodeJS.Timeout;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = (value * easeProgress).toFixed(decimals);
      
      // Cyberpunk scramble effect: randomize chars while animating
      if (progress < 1) {
        let scrambled = currentValue.split("").map(char => {
          if (char === "." || char === ",") return char;
          // 40% chance to show a random character
          return Math.random() > 0.6 ? CHARS[Math.floor(Math.random() * CHARS.length)] : char;
        }).join("");
        setDisplayString(scrambled);
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayString(value.toFixed(decimals));
      }
    };

    timeoutId = setTimeout(() => {
      setHasStarted(true);
      rafRef.current = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, value, duration, delay, decimals]);

  if (!active && !hasStarted) return null;

  return (
    <div className={`flex flex-col ${hasStarted ? "animate-number" : "opacity-0"}`}>
      <span className={`${syncopate.className} text-5xl md:text-8xl font-bold text-white leading-none tracking-tighter tabular-nums`}>
        {displayString}
        <span className="text-xl md:text-3xl text-[#ff3333] ml-2 tracking-normal">{suffix}</span>
      </span>
      <span className={`${montserrat.className} text-[8px] md:text-[10px] tracking-[0.4em] text-white/50 uppercase block mt-4`}>
        {label}
      </span>
    </div>
  );
}
