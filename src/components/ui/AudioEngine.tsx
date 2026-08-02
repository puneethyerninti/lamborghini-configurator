"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

export function AudioEngine() {
  const isAudioEnabled = useAppStore((s) => s.isAudioEnabled);
  const isEngineRevved = useAppStore((s) => s.isEngineRevved);
  
  // Real Audio File Reference
  const revAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !revAudio.current) {
      revAudio.current = new Audio("/785503__litesaturation__energy-metal-short.wav");
      revAudio.current.volume = 0.8;
    }
  }, []);

  // Handle Revving with Real Audio File
  useEffect(() => {
    if (!isAudioEnabled || !revAudio.current) return;

    if (isEngineRevved) {
      revAudio.current.currentTime = 0; // Reset to start
      revAudio.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [isEngineRevved, isAudioEnabled]);

  return null;
}
