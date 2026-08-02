"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

export function AudioEngine() {
  const isAudioEnabled = useAppStore((s) => s.isAudioEnabled);
  const isEngineRevved = useAppStore((s) => s.isEngineRevved);
  
  const audioCtx = useRef<AudioContext | null>(null);
  const droneOsc = useRef<OscillatorNode | null>(null);
  const revOsc = useRef<OscillatorNode | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const revGain = useRef<GainNode | null>(null);

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

      // Revving Engine
      revGain.current = audioCtx.current.createGain();
      revGain.current.gain.value = 0;
      revGain.current.connect(masterGain.current);

      revOsc.current = audioCtx.current.createOscillator();
      revOsc.current.type = "square";
      revOsc.current.frequency.value = 120;
      
      const revFilter = audioCtx.current.createBiquadFilter();
      revFilter.type = "bandpass";
      revFilter.frequency.value = 800;
      
      revOsc.current.connect(revFilter);
      revFilter.connect(revGain.current);
      revOsc.current.start();
    }

    if (audioCtx.current.state === "suspended") {
      audioCtx.current.resume();
    }
  }, [isAudioEnabled]);

  // Handle Revving
  useEffect(() => {
    if (!audioCtx.current || !revGain.current || !revOsc.current || !isAudioEnabled) return;

    const time = audioCtx.current.currentTime;
    
    if (isEngineRevved) {
      // Rev up
      revGain.current.gain.setTargetAtTime(0.3, time, 0.1);
      revOsc.current.frequency.setTargetAtTime(300, time, 0.2); // Pitch up
    } else {
      // Rev down
      revGain.current.gain.setTargetAtTime(0, time, 0.3);
      revOsc.current.frequency.setTargetAtTime(120, time, 0.5); // Pitch down
    }
  }, [isEngineRevved, isAudioEnabled]);

  return null;
}
