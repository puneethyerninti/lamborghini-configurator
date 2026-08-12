"use client";

import React, { useEffect, useRef, useState } from "react";
import { syncopate, montserrat } from "@/fonts";




const TRACK_PATH = "M 130 260 C 90 260, 60 230, 50 180 C 40 130, 60 80, 100 50 C 140 20, 190 20, 230 40 C 260 55, 270 90, 300 100 C 330 110, 360 100, 370 130 C 380 160, 360 210, 330 240 C 290 280, 240 280, 200 250 C 170 230, 160 260, 130 260 Z";
const ORO_ELIOS = "#b59b4c";

export function TrackMap({ active }: { active: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const [progress, setProgress] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    if (!active || pathLength === 0) {
      setProgress(0);
      return;
    }
    if (isHovering) return; // Disable auto animation when scrubbing

    let startTime = 0;
    let animationFrameId: number;
    const DURATION = 6000;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const p = Math.min(elapsed / DURATION, 1);
      
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      
      setProgress(ease);

      if (pathRef.current && dotRef.current) {
        const currentLength = ease * pathLength;
        const point = pathRef.current.getPointAtLength(currentLength);
        dotRef.current.setAttribute("cx", String(point.x));
        dotRef.current.setAttribute("cy", String(point.y));
      }

      if (p < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [active, pathLength, isHovering]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !active) return;
    const rect = containerRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setProgress(p);

    if (pathRef.current && dotRef.current) {
      const currentLength = p * pathLength;
      const point = pathRef.current.getPointAtLength(currentLength);
      dotRef.current.setAttribute("cx", String(point.x));
      dotRef.current.setAttribute("cy", String(point.y));
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[400px] aspect-square flex items-center justify-center perspective-[1000px] cursor-ew-resize group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      
      {/* 3D Isometric Container */}
      <div 
        className="relative w-[70vw] h-[70vw] md:w-[300px] md:h-[300px] transition-transform duration-1000 ease-out"
        style={{ transform: active ? 'rotateX(55deg) rotateZ(-35deg) scale(1.1)' : 'rotateX(0deg) rotateZ(0deg) scale(0.9)' }}
      >
        <svg 
          viewBox="0 0 400 300" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_20px_30px_rgba(181,155,76,0.15)] overflow-visible"
        >
          {/* Base track (Frosted Ribbon) */}
          <path
            d={TRACK_PATH}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="blur-[0.5px]"
          />
          <path
            d={TRACK_PATH}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Active Traced Line */}
          <path
            ref={pathRef}
            d={TRACK_PATH}
            stroke={ORO_ELIOS}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - (pathLength * progress)}
            style={{ filter: `drop-shadow(0 0 10px ${ORO_ELIOS})` }}
          />

          {/* Tracer Orb */}
          <circle
            ref={dotRef}
            cx="0" cy="0" r="6"
            fill="#ffffff"
            className={`drop-shadow-[0_0_12px_${ORO_ELIOS}]`}
            stroke={ORO_ELIOS}
            strokeWidth="2"
          />
        </svg>

        {/* Tactical Sector Labels (Absolute positioned within 3D space so they tilt too) */}
        
        {/* Sector 1: Flugplatz */}
        <div className={`absolute top-[18%] left-[25%] flex flex-col items-center transition-all duration-700 ${progress > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
          <span className={`${syncopate.className} text-[6px] tracking-[0.3em] font-bold text-white mb-1 drop-shadow-md`}>FLUGPLATZ</span>
          <div className="h-8 w-[1px] bg-gradient-to-t from-[#b59b4c] to-transparent" />
          <div className="w-1.5 h-1.5 border border-[#b59b4c] bg-black/50 rounded-full mt-[-2px]" />
        </div>

        {/* Sector 2: Karussell */}
        <div className={`absolute top-[30%] right-[12%] flex flex-col items-center transition-all duration-700 ${progress > 0.45 ? 'opacity-100' : 'opacity-0'}`}>
          <span className={`${syncopate.className} text-[6px] tracking-[0.3em] font-bold text-white mb-1 drop-shadow-md`}>KARUSSELL</span>
          <div className="h-12 w-[1px] bg-gradient-to-t from-[#b59b4c] to-transparent" />
          <div className="w-1.5 h-1.5 border border-[#b59b4c] bg-black/50 rounded-full mt-[-2px]" />
        </div>

        {/* Start / Finish */}
        <div className={`absolute bottom-[20%] left-[45%] flex flex-col items-center transition-all duration-700 ${progress > 0.85 ? 'opacity-100' : 'opacity-0'}`}>
          <span className={`${syncopate.className} text-[8px] tracking-[0.4em] font-bold text-[#b59b4c] mb-2 drop-shadow-[0_0_8px_rgba(181,155,76,0.5)]`}>
            {progress === 1 ? 'RECORD SECURED' : 'START / FINISH'}
          </span>
          <div className="w-full max-w-[40px] h-[1px] bg-[#b59b4c]" />
        </div>

        {/* Scrubbing Hint */}
        <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <span className={`${montserrat.className} text-[8px] tracking-widest text-white/50 uppercase`}>
            Telemetry: {(progress * 6.44).toFixed(2)} min / G-Force: {(1.2 + Math.sin(progress * 10) * 0.4).toFixed(2)}g
          </span>
        </div>

      </div>
    </div>
  );
}
