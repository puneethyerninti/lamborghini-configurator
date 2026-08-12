"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Syncopate, Montserrat } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["200", "300", "400"], subsets: ["latin"] });

// Ultra-premium Oro Elios gold
const ORO_ELIOS = "#b59b4c";

export function TelemetryHUD() {
  const chapter = useAppStore((s) => s.chapter);
  const active = chapter === 2;

  const rpmTextRef = useRef<HTMLSpanElement>(null);
  const rpmNeedleRef = useRef<SVGLineElement>(null);
  const speedTextRef = useRef<HTMLSpanElement>(null);
  const speedDecimalsRef = useRef<HTMLSpanElement>(null);
  const gForceCrosshairRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    let raf: number;
    let targetSpeed = 0;
    let currentSpeed = 0;
    let currentRpm = 1000;

    // Smooth trailing G-Force
    let currentGx = 0;
    let currentGy = 0;

    const updateTelemetry = () => {
      const time = Date.now() / 1000;

      // Speed races up to ~353
      targetSpeed = Math.min(353, targetSpeed + (Math.random() * 4 + 1));
      if (targetSpeed > 348) targetSpeed -= Math.random() * 8;

      // Eased speed for realism
      currentSpeed += (targetSpeed - currentSpeed) * 0.15;

      // RPM fluctuates wildly near redline
      currentRpm = 8200 + Math.sin(time * 15) * 200 + Math.random() * 100;

      // G-Force (spring physics approach)
      const targetGx = Math.sin(time * 3) * 1.2 + (Math.random() - 0.5) * 0.4;
      const targetGy = Math.cos(time * 2.5) * 0.9 + (Math.random() - 0.5) * 0.4;
      currentGx += (targetGx - currentGx) * 0.1;
      currentGy += (targetGy - currentGy) * 0.1;

      // DOM writes
      if (rpmTextRef.current) {
        rpmTextRef.current.textContent = String(Math.floor(currentRpm)).padStart(4, '0');
      }

      if (rpmNeedleRef.current) {
        const maxRpm = 8500;
        const progress = Math.min(1, currentRpm / maxRpm);
        // Needle sweeps from -140deg to 140deg
        const angle = -140 + (progress * 280);
        rpmNeedleRef.current.style.transform = `rotate(${angle}deg)`;

        if (progress > 0.95) {
          rpmNeedleRef.current.style.stroke = "#ff3333";
          rpmNeedleRef.current.style.filter = "drop-shadow(0 0 5px #ff3333)";
        } else {
          rpmNeedleRef.current.style.stroke = ORO_ELIOS;
          rpmNeedleRef.current.style.filter = `drop-shadow(0 0 4px ${ORO_ELIOS})`;
        }
      }

      if (speedTextRef.current && speedDecimalsRef.current) {
        const speedStr = currentSpeed.toFixed(1);
        const [whole, dec] = speedStr.split(".");
        speedTextRef.current.textContent = whole;
        speedDecimalsRef.current.textContent = `.${dec}`;
      }

      if (gForceCrosshairRef.current) {
        gForceCrosshairRef.current.style.transform = `translate(${currentGx * 35}px, ${currentGy * 35}px)`;
      }

      raf = requestAnimationFrame(updateTelemetry);
    };

    raf = requestAnimationFrame(updateTelemetry);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden mix-blend-screen opacity-90 animate-glitch">

      {/* ── Reticle: Aerospace Minimalist ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[70vh] h-[90vw] md:h-[70vh] max-w-[700px] max-h-[700px] opacity-30">
        <div className="absolute inset-0 border-[0.5px] border-white/20 rounded-full animate-[spin_120s_linear_infinite]" />
        {/* Hairline crosshairs */}
        <div className="absolute top-1/2 left-[-10%] right-[-10%] h-[0.5px] bg-white/10" />
        <div className="absolute left-1/2 top-[-10%] bottom-[-10%] w-[0.5px] bg-white/10" />

        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-[1px] border-l-[1px] border-[#b59b4c] opacity-50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-[1px] border-r-[1px] border-[#b59b4c] opacity-50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1px] border-l-[1px] border-[#b59b4c] opacity-50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1px] border-r-[1px] border-[#b59b4c] opacity-50" />
      </div>

      {/* ── RPM Minimalist Arc (Bottom Left) ── */}
      <div className="absolute left-4 bottom-12 md:left-24 md:bottom-24 w-20 h-20 md:w-48 md:h-48 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full absolute">
          {/* Base track */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="565" strokeDashoffset="141" strokeLinecap="round" className="-rotate-90 origin-center" />

          {/* Ticks (every 1000 RPM) */}
          <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeDasharray="1 30.5" strokeDashoffset="0" className="-rotate-90 origin-center" />

          {/* Sweeping Needle */}
          <line
            ref={rpmNeedleRef as any}
            x1="100" y1="100" x2="100" y2="15"
            stroke={ORO_ELIOS}
            strokeWidth="2"
            className="origin-[100px_100px]"
            style={{ transition: 'transform 0.1s linear, stroke 0.2s' }}
          />
          {/* Center cap */}
          <circle cx="100" cy="100" r="4" fill="white" />
        </svg>

        <div className="absolute flex flex-col items-center justify-center pt-8">
          <div className="flex items-baseline gap-1">
            <span ref={rpmTextRef} className={`${montserrat.className} text-base md:text-2xl text-white font-light tracking-[0.2em]`}>0000</span>
          </div>
          <span className={`${syncopate.className} text-[5px] md:text-[8px] text-[#b59b4c] tracking-[0.4em] uppercase mt-1 opacity-80`}>ENGINE RPM</span>
        </div>
      </div>

      {/* ── Velocity (Bottom Right) ── */}
      <div className="absolute right-4 bottom-12 md:right-24 md:bottom-24 text-right flex flex-col items-end">
        <span className={`${syncopate.className} text-[6px] md:text-[9px] text-[#b59b4c] tracking-[0.5em] uppercase block mb-1 md:mb-2 opacity-80`}>VELOCITY</span>
        <div className="flex items-baseline justify-end gap-1">
          <span ref={speedTextRef} className={`${montserrat.className} text-4xl md:text-8xl text-white font-light tracking-tighter`}>
            0
          </span>
          <span ref={speedDecimalsRef} className={`${montserrat.className} text-xl md:text-4xl text-white/40 font-light tracking-tighter w-8 md:w-12 text-left`}>
            .0
          </span>
          <span className={`${syncopate.className} text-[6px] md:text-[8px] text-[#b59b4c] tracking-[0.2em] font-bold ml-1 md:ml-2`}>KM/H</span>
        </div>
      </div>

      {/* ── G-Force Tactical Radar (Top Left on Mobile, Top Right on Desktop) ── */}
      <div className="absolute top-24 left-4 md:left-auto md:top-32 md:right-24 flex flex-col items-start md:items-end gap-2 md:gap-3">
        <span className={`${syncopate.className} text-[6px] md:text-[9px] text-[#b59b4c] tracking-[0.5em] uppercase opacity-80`}>G-FORCE</span>

        <div className="w-20 h-20 md:w-40 md:h-40 relative flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">

          {/* Concentric rings */}
          <div className="absolute inset-[15%] rounded-full border-[0.5px] border-white/5" />
          <div className="absolute inset-[40%] rounded-full border-[0.5px] border-white/5" />
          <div className="absolute inset-[65%] rounded-full border-[0.5px] border-white/5" />

          {/* Fine Grid */}
          <div className="w-full h-[0.5px] bg-white/10 absolute top-1/2" />
          <div className="h-full w-[0.5px] bg-white/10 absolute left-1/2" />

          {/* Center target */}
          <div className="w-1 h-1 bg-[#b59b4c]/50 rounded-full absolute" />

          {/* Moving Crosshair */}
          <div
            ref={gForceCrosshairRef}
            className="absolute w-4 h-4"
            style={{ transition: 'transform 0.1s ease-out' }}
          >
            {/* Gold Reticle */}
            <div className="absolute inset-0 border border-[#b59b4c] rounded-full shadow-[0_0_8px_rgba(181,155,76,0.6)]" />
            <div className="absolute top-1/2 left-1/2 -mt-[0.5px] -ml-2 w-4 h-[1px] bg-[#b59b4c]" />
            <div className="absolute top-1/2 left-1/2 -mt-2 -ml-[0.5px] w-[1px] h-4 bg-[#b59b4c]" />
          </div>
        </div>
      </div>
    </div>
  );
}
