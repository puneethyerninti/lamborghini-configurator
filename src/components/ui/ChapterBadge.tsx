"use client";

import React from "react";
import { Syncopate } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V"];

export function ChapterBadge({ chapter, title, delay = 0, active = true }: { chapter: number; title: string; delay?: number; active?: boolean }) {
  if (!active) return null;
  return (
    <div 
      className="absolute top-28 md:top-32 left-8 md:left-12 flex items-center gap-6 pointer-events-none z-10 animate-fadein"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Decorative scanline box */}
      <div className="w-8 h-8 border border-white/20 flex items-center justify-center relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-white/10 animate-scanline" style={{ animationDuration: '2s' }} />
        <span className={`${syncopate.className} text-[10px] font-bold text-white`}>
          {chapter + 1}
        </span>
      </div>

      <div className="flex flex-col items-start gap-1">
        <span className={`${syncopate.className} text-[8px] tracking-[0.4em] font-bold text-white uppercase`}>
          CHAPTER {ROMAN_NUMERALS[chapter]}
        </span>
        <span className={`${syncopate.className} text-[7px] tracking-[0.2em] text-white/40 uppercase`}>
          {title}
        </span>
      </div>
    </div>
  );
}
