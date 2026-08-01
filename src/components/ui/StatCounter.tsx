"use client";

import React, { useEffect, useRef, useState } from "react";
import { Syncopate, Montserrat } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["400"], subsets: ["latin"] });

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
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setDisplayValue(0);
      setHasStarted(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let startTime = 0;
    let timeoutId: NodeJS.Timeout;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (expo out)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(value * easeProgress);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
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
  }, [active, value, duration, delay]);

  if (!active && !hasStarted) return null;

  return (
    <div className={`flex flex-col ${hasStarted ? "animate-number" : "opacity-0"}`}>
      <span className={`${syncopate.className} text-6xl md:text-8xl font-bold text-white leading-none tracking-tighter`}>
        {displayValue.toFixed(decimals)}
        <span className="text-3xl text-[#ff3333] ml-2 tracking-normal">{suffix}</span>
      </span>
      <span className={`${montserrat.className} text-[10px] tracking-[0.4em] text-white/50 uppercase block mt-4`}>
        {label}
      </span>
    </div>
  );
}
