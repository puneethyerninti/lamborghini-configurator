"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export const globalMusic = typeof window !== "undefined" ? new Audio("/785503__litesaturation__energy-metal-short.wav") : null;
if (globalMusic) {
  globalMusic.loop = true;
  globalMusic.volume = 0.5;
}

export function AudioEngine() {
  const isEngineRevved = useAppStore((s) => s.isEngineRevved);
  
  // Handle Revving volume boost
  useEffect(() => {
    if (!globalMusic) return;
    
    if (isEngineRevved) {
      globalMusic.volume = 0.9;
      setTimeout(() => {
        globalMusic.volume = 0.5;
      }, 2000);
    }
  }, [isEngineRevved]);

  return null;
}
