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
  
  // Real Audio File Reference
  const revAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !revAudio.current) {
      revAudio.current = new Audio("/785503__litesaturation__energy-metal-short.wav");
      revAudio.current.volume = 0.8;
    }
  }, []);

  useEffect(() => {
    // Initialize once
    if (typeof window !== "undefined" && !globalAudioCtx) {
      globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      masterGain = globalAudioCtx.createGain();
      masterGain.gain.value = 0.0; // Start silent
      masterGain.connect(globalAudioCtx.destination);

      droneOsc = globalAudioCtx.createOscillator();
      droneOsc.type = "sawtooth";
      droneOsc.frequency.value = 110; // A2 note, very audible on all speakers
      
      const filter = globalAudioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400; // Let some buzz through
      
      droneOsc.connect(filter);
      filter.connect(masterGain);
      droneOsc.start();
    }

    if (!globalAudioCtx || !masterGain) return;

    if (isAudioEnabled) {
      if (globalAudioCtx.state === "suspended") {
        globalAudioCtx.resume();
      }
      // Fade in drone
      masterGain.gain.setTargetAtTime(0.15, globalAudioCtx.currentTime, 0.5);
    } else {
      // Fade out drone
      masterGain.gain.setTargetAtTime(0, globalAudioCtx.currentTime, 0.5);
    }
  }, [isAudioEnabled]);

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
