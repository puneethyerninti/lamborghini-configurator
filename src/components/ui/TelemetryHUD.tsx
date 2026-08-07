"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Syncopate, Montserrat } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["300", "400", "700"], subsets: ["latin"] });

export function TelemetryHUD() {
  const chapter = useAppStore((s) => s.chapter);
  const active = chapter === 2; // Performance chapter
  
  // Direct DOM refs — bypass React reconciliation entirely
  const rpmTextRef = React.useRef<HTMLSpanElement>(null);
  const rpmBarRef = React.useRef<HTMLDivElement>(null);
  const speedTextRef = React.useRef<HTMLSpanElement>(null);
  const gForceDotRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    
    let raf: number;
    let targetSpeed = 0;
    let currentSpeed = 0;
    let currentRpm = 1000;
    
    const updateTelemetry = () => {
      const time = Date.now() / 1000;
      
      // Speed races up to ~350 then fluctuates
      targetSpeed = Math.min(352, targetSpeed + (Math.random() * 5 + 1));
      if (targetSpeed > 340) targetSpeed -= Math.random() * 10;
      currentSpeed += (targetSpeed - currentSpeed) * 0.1;

      // RPM fluctuates wildly near redline
      currentRpm = 8000 + Math.sin(time * 10) * 400 + Math.random() * 200;

      // G-Force jitters in a circle
      const gX = Math.sin(time * 5) * 1.2 + (Math.random() - 0.5) * 0.5;
      const gY = Math.cos(time * 4) * 0.8 + (Math.random() - 0.5) * 0.5;

      // Direct DOM writes — zero React overhead
      if (rpmTextRef.current) rpmTextRef.current.textContent = String(Math.floor(currentRpm));
      if (rpmBarRef.current) rpmBarRef.current.style.width = `${Math.min(100, (currentRpm / 8500) * 100)}%`;
      if (speedTextRef.current) speedTextRef.current.textContent = String(Math.floor(currentSpeed));
      if (gForceDotRef.current) gForceDotRef.current.style.transform = `translate(${gX * 30}px, ${gY * 30}px)`;

      raf = requestAnimationFrame(updateTelemetry);
    };

    raf = requestAnimationFrame(updateTelemetry);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden mix-blend-screen opacity-80 animate-fadein">
      
      {/* HUD Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[60vh] h-[90vw] md:h-[60vh] max-w-[500px] max-h-[500px] border border-[#00d4ff]/20 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
      
      {/* RPM Gauge */}
      <div className="absolute left-6 bottom-6 md:left-16 md:bottom-16 w-40 md:w-64 flex flex-col justify-end">
        <span className={`${syncopate.className} text-[8px] md:text-[10px] text-[#00d4ff] tracking-[0.3em] uppercase mb-2`}>Engine RPM</span>
        <div className="w-full h-2 bg-white/10 overflow-hidden relative">
           <div 
             ref={rpmBarRef}
             className="absolute top-0 left-0 h-full bg-[#00d4ff]"
             style={{ width: '0%' }}
           />
           {/* Redline marker */}
           <div className="absolute top-0 right-[5%] w-[1px] h-full bg-red-500" />
        </div>
        <div className="flex justify-between mt-2">
           <span ref={rpmTextRef} className={`${montserrat.className} text-xl text-white font-bold`}>1000</span>
           <span className={`${syncopate.className} text-[8px] text-white/40 mt-1`}>/ 8500</span>
        </div>
      </div>

      {/* Speedometer */}
      <div className="absolute right-6 bottom-6 md:right-16 md:bottom-16 text-right">
        <span className={`${syncopate.className} text-[8px] md:text-[10px] text-[#00d4ff] tracking-[0.3em] uppercase block mb-1`}>Velocity</span>
        <div className="flex items-baseline justify-end gap-1 md:gap-2">
          <span ref={speedTextRef} className={`${syncopate.className} text-5xl md:text-8xl text-white font-bold tracking-tighter`}>
            0
          </span>
          <span className={`${montserrat.className} text-sm text-white/50`}>KM/H</span>
        </div>
      </div>

      {/* G-Force Meter */}
      <div className="absolute top-24 right-6 md:top-32 md:right-16 flex flex-col items-end gap-2 origin-top-right scale-75 md:scale-100">
         <span className={`${syncopate.className} text-[8px] text-[#00d4ff] tracking-[0.3em] uppercase`}>G-Force</span>
         <div className="w-24 h-24 rounded-full border border-white/20 relative flex items-center justify-center">
            {/* Crosshair */}
            <div className="w-full h-[1px] bg-white/10 absolute top-1/2" />
            <div className="h-full w-[1px] bg-white/10 absolute left-1/2" />
            
            {/* Dot */}
            <div 
              ref={gForceDotRef}
              className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red] absolute"
              style={{ transform: 'translate(0px, 0px)' }}
            />
         </div>
      </div>

      {/* Glitch overlays */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </div>
  );
}
