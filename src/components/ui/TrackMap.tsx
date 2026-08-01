"use client";

import React, { useEffect, useRef, useState } from "react";
import { Syncopate } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });

export function TrackMap({ active }: { active: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);
  const [pathLength, setPathLength] = useState(0);

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

    let startTime = 0;
    let animationFrameId: number;
    const DURATION = 3000; // 3 seconds to draw the track

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const p = Math.min(elapsed / DURATION, 1);
      
      // Ease in out cubic
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      
      setProgress(ease);

      if (p < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [active, pathLength]);

  return (
    <div className="relative w-full max-w-[300px] aspect-[4/3]">
      <svg 
        viewBox="0 0 400 300" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Base track (faint) */}
        <path
          d="M 150 250 C 120 250, 80 230, 50 180 C 20 130, 50 80, 100 50 C 150 20, 220 30, 280 60 C 330 85, 360 130, 350 180 C 340 230, 280 270, 220 260 C 180 250, 160 250, 150 250"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Animated racing line */}
        <path
          ref={pathRef}
          d="M 150 250 C 120 250, 80 230, 50 180 C 20 130, 50 80, 100 50 C 150 20, 220 30, 280 60 C 330 85, 360 130, 350 180 C 340 230, 280 270, 220 260 C 180 250, 160 250, 150 250"
          stroke="#ff3333"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - (pathLength * progress)}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>

      {/* Sector labels that pop in as the line passes */}
      {progress > 0.3 && (
        <div className={`absolute top-[10%] left-[25%] animate-fadein ${syncopate.className} text-[8px] tracking-[0.2em] font-bold text-white`}>
          SECTOR 1
        </div>
      )}
      {progress > 0.7 && (
        <div className={`absolute top-[20%] right-[10%] animate-fadein ${syncopate.className} text-[8px] tracking-[0.2em] font-bold text-white`}>
          SECTOR 2
        </div>
      )}
      {progress === 1 && (
        <div className={`absolute bottom-[10%] left-[45%] animate-fadein ${syncopate.className} text-[8px] tracking-[0.2em] font-bold text-[#ff3333]`}>
          START / FINISH
        </div>
      )}
    </div>
  );
}
