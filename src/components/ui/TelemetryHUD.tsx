"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Syncopate, Montserrat } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["300", "400", "700"], subsets: ["latin"] });

export function TelemetryHUD() {
  const chapter = useAppStore((s) => s.chapter);
  const active = chapter === 2; // Performance chapter
  
  const [rpm, setRpm] = useState(1000);
  const [speed, setSpeed] = useState(0);
  const [gForce, setGForce] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!active) return;
    
    let raf: number;
    let targetSpeed = 0;
    
    const updateTelemetry = () => {
      // Simulate erratic high-speed telemetry
      const time = Date.now() / 1000;
      
      // Speed races up to ~350 then fluctuates
      targetSpeed = Math.min(352, targetSpeed + (Math.random() * 5 + 1));
      if (targetSpeed > 340) targetSpeed -= Math.random() * 10;
      
      setSpeed(prev => {
        const next = prev + (targetSpeed - prev) * 0.1;
        return next;
      });

      // RPM fluctuates wildly near redline
      setRpm(8000 + Math.sin(time * 10) * 400 + Math.random() * 200);

      // G-Force jitters in a circle
      setGForce({
        x: Math.sin(time * 5) * 1.2 + (Math.random() - 0.5) * 0.5,
        y: Math.cos(time * 4) * 0.8 + (Math.random() - 0.5) * 0.5
      });

      raf = requestAnimationFrame(updateTelemetry);
    };

    raf = requestAnimationFrame(updateTelemetry);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden mix-blend-screen opacity-80 animate-fadein">
      
      {/* HUD Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] border border-[#00d4ff]/20 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
      
      {/* RPM Gauge */}
      <div className="absolute left-8 bottom-8 md:left-16 md:bottom-16 w-64 h-32 flex flex-col justify-end">
        <span className={`${syncopate.className} text-[10px] text-[#00d4ff] tracking-[0.3em] uppercase mb-2`}>Engine RPM</span>
        <div className="w-full h-2 bg-white/10 overflow-hidden relative">
           <div 
             className="absolute top-0 left-0 h-full bg-[#00d4ff] transition-all duration-75"
             style={{ width: `${Math.min(100, (rpm / 8500) * 100)}%` }}
           />
           {/* Redline marker */}
           <div className="absolute top-0 right-[5%] w-[1px] h-full bg-red-500" />
        </div>
        <div className="flex justify-between mt-2">
           <span className={`${montserrat.className} text-xl text-white font-bold`}>{Math.floor(rpm)}</span>
           <span className={`${syncopate.className} text-[8px] text-white/40 mt-1`}>/ 8500</span>
        </div>
      </div>

      {/* Speedometer */}
      <div className="absolute right-8 bottom-8 md:right-16 md:bottom-16 text-right">
        <span className={`${syncopate.className} text-[10px] text-[#00d4ff] tracking-[0.3em] uppercase block mb-1`}>Velocity</span>
        <div className="flex items-baseline justify-end gap-2">
          <span className={`${syncopate.className} text-6xl md:text-8xl text-white font-bold tracking-tighter`}>
            {Math.floor(speed)}
          </span>
          <span className={`${montserrat.className} text-sm text-white/50`}>KM/H</span>
        </div>
      </div>

      {/* G-Force Meter */}
      <div className="absolute top-24 right-8 md:top-32 md:right-16 flex flex-col items-end gap-2">
         <span className={`${syncopate.className} text-[8px] text-[#00d4ff] tracking-[0.3em] uppercase`}>G-Force</span>
         <div className="w-24 h-24 rounded-full border border-white/20 relative flex items-center justify-center">
            {/* Crosshair */}
            <div className="w-full h-[1px] bg-white/10 absolute top-1/2" />
            <div className="h-full w-[1px] bg-white/10 absolute left-1/2" />
            
            {/* Dot */}
            <div 
              className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red] absolute transition-all duration-75"
              style={{ 
                transform: `translate(${gForce.x * 30}px, ${gForce.y * 30}px)` 
              }}
            />
         </div>
      </div>

      {/* Glitch overlays */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </div>
  );
}
