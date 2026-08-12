"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Syncopate } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });

const CHAPTERS = [
  { id: 0, title: "THE BULL", start: 0 },
  { id: 1, title: "ENGINEERING", start: 3 },
  { id: 2, title: "PERFORMANCE", start: 7 },
  { id: 3, title: "THE ATELIER", start: 10 },
  { id: 4, title: "LEGACY", start: 12 },
];

export function SlideNav() {
  const { currentSlide, chapter, setSlide, totalSlides } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        useAppStore.getState().nextSlide();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        useAppStore.getState().prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const progress = currentSlide / (totalSlides - 1);
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - progress * circumference;

  return (
    <div
      className="fixed right-4 bottom-4 md:bottom-auto md:right-8 md:top-1/2 md:-translate-y-1/2 z-[100] flex flex-col items-end gap-3 mix-blend-difference pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="hidden md:flex flex-col items-end gap-4 mb-8">
        {CHAPTERS.map((chap) => {
          const isActive = chapter === chap.id;
          return (
            <div
              key={chap.id}
              className="flex items-center justify-end gap-4 cursor-pointer group"
              onClick={() => setSlide(chap.start)}
            >
              <span
                className={`hidden md:block ${syncopate.className} text-[9px] tracking-[0.3em] font-bold uppercase transition-all duration-300 ${isActive || isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  } ${isActive ? "text-white" : "text-white/40 group-hover:text-white/80"}`}
              >
                {chap.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3D Technical Progress Ring */}
      <div className="relative flex items-center justify-center cursor-pointer group" onClick={() => useAppStore.getState().nextSlide()}>
        <svg className="w-16 h-16 transform -rotate-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {/* Background track */}
          <circle cx="32" cy="32" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
          {/* Progress fill */}
          <circle
            cx="32" cy="32" r="20"
            stroke="#ffffff" strokeWidth="2" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          />
          {/* Inner rotating technical dashed ring */}
          <circle
            cx="32" cy="32" r="14"
            stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"
            strokeDasharray="2 4"
            className="origin-center animate-[spin_10s_linear_infinite]"
          />
        </svg>
        <div className={`absolute text-[8px] font-bold tracking-widest ${syncopate.className} text-white group-hover:scale-110 transition-transform`}>
          {String(currentSlide + 1).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
