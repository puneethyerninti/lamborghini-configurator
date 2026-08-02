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

  return (
    <div 
      className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col gap-3 mix-blend-difference pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {CHAPTERS.map((chap, i) => {
        const isActive = chapter === chap.id;
        return (
          <div 
            key={chap.id} 
            className="flex items-center justify-end gap-4 cursor-pointer group"
            onClick={() => setSlide(chap.start)}
          >
            <span 
              className={`hidden md:block ${syncopate.className} text-[8px] tracking-[0.3em] font-bold uppercase transition-all duration-300 ${
                isActive || isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              } ${isActive ? "text-white" : "text-white/40 group-hover:text-white/80"}`}
            >
              {chap.title}
            </span>
            <div className="relative flex items-center justify-center w-4 h-4">
              <div 
                className={`w-1 h-1 rounded-full bg-white transition-all duration-300 ${
                  isActive ? "scale-150" : "scale-100 opacity-40 group-hover:opacity-100"
                }`}
              />
              {isActive && (
                <div className="absolute inset-0 rounded-full border border-white/40 animate-ping" style={{ animationDuration: '3s' }} />
              )}
            </div>
          </div>
        );
      })}
      
      {/* Progress Bar */}
      <div className="absolute right-1.5 top-full mt-8 w-[1px] h-32 bg-white/10">
        <div 
          className="w-full bg-white/60 transition-all duration-500 ease-out"
          style={{ height: `${(currentSlide / (totalSlides - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
