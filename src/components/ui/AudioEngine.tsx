"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

// Global audio state to persist across renders and avoid auto-play restrictions
let globalAudioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let droneOsc: OscillatorNode | null = null;

export function AudioEngine() {
  const isAudioEnabled = useAppStore((s) => s.isAudioEnabled);
  const isEngineRevved = useAppStore((s) => s.isEngineRevved);
  
  // The Music Track
  const musicAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !musicAudio.current) {
      // The provided file is actually a music track!
      musicAudio.current = new Audio("/785503__litesaturation__energy-metal-short.wav");
      musicAudio.current.volume = 0.5;
      musicAudio.current.loop = true;
    }
  }, []);

  // Play/Pause music based on global sound toggle
  useEffect(() => {
    if (!musicAudio.current) return;

    if (isAudioEnabled) {
      musicAudio.current.play().catch(e => console.error("Music play failed:", e));
    } else {
      musicAudio.current.pause();
    }
  }, [isAudioEnabled]);

  // If the user wants a rev sound for Ignite later, it can go here. 
  // For now, Ignite just triggers visual effects since no rev file was provided.
  useEffect(() => {
    if (!isAudioEnabled || !isEngineRevved || !musicAudio.current) return;
    
    // Optional: Boost volume slightly when engine revs as a cool effect
    musicAudio.current.volume = 0.9;
    setTimeout(() => {
      if (musicAudio.current) musicAudio.current.volume = 0.5;
    }, 2000);
  }, [isEngineRevved, isAudioEnabled]);

  return null;
}
