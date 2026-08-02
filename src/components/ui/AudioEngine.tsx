"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

export function AudioEngine() {
  const isAudioEnabled = useAppStore((s) => s.isAudioEnabled);
  const isEngineRevved = useAppStore((s) => s.isEngineRevved);
  
  const audioCtx = useRef<AudioContext | null>(null);
  const droneOsc = useRef<OscillatorNode | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  
  // Real Audio File Reference
  const revAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !revAudio.current) {
      revAudio.current = new Audio("/785503__litesaturation__energy-metal-short.wav");
      revAudio.current.volume = 0.8;
    }
  }, []);

  useEffect(() => {
    if (!isAudioEnabled) {
      if (audioCtx.current?.state === "running") {
        audioCtx.current.suspend();
      }
      return;
    }

    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      masterGain.current = audioCtx.current.createGain();
      masterGain.current.gain.value = 0.1;
      masterGain.current.connect(audioCtx.current.destination);

      // Deep V12 idling drone
      droneOsc.current = audioCtx.current.createOscillator();
      droneOsc.current.type = "sawtooth";
      droneOsc.current.frequency.value = 45; // Deep rumble
      
      // Lowpass filter for drone
      const filter = audioCtx.current.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 150;
      
      droneOsc.current.connect(filter);
      filter.connect(masterGain.current);
      droneOsc.current.start();
    }

    if (audioCtx.current.state === "suspended") {
      audioCtx.current.resume();
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
