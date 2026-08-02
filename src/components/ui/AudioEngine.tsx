"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export let globalAudioCtx: AudioContext | null = null;
export let musicBuffer: AudioBuffer | null = null;
export let currentSource: AudioBufferSourceNode | null = null;
export let masterGain: GainNode | null = null;

export const initAudio = async () => {
  if (typeof window === "undefined") return;
  
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = globalAudioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(globalAudioCtx.destination);
  }
  
  if (!musicBuffer) {
    try {
      const res = await fetch("/785503__litesaturation__energy-metal-short.wav");
      const arrayBuffer = await res.arrayBuffer();
      musicBuffer = await globalAudioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error("Audio decode failed:", e);
    }
  }
};

export const playGlobalMusic = () => {
  if (!globalAudioCtx || !musicBuffer || !masterGain) return;
  if (globalAudioCtx.state === "suspended") globalAudioCtx.resume();
  
  if (currentSource) {
    try { currentSource.stop(); } catch(e) {}
    currentSource.disconnect();
  }
  
  currentSource = globalAudioCtx.createBufferSource();
  currentSource.buffer = musicBuffer;
  currentSource.loop = true;
  currentSource.connect(masterGain);
  currentSource.start(0);
};

export const pauseGlobalMusic = () => {
  if (currentSource) {
    try { currentSource.stop(); } catch(e) {}
    currentSource.disconnect();
    currentSource = null;
  }
};

export function AudioEngine() {
  const isEngineRevved = useAppStore((s) => s.isEngineRevved);
  
  useEffect(() => {
    initAudio();
  }, []);

  // Handle Revving volume boost
  useEffect(() => {
    if (!masterGain || !globalAudioCtx) return;
    
    if (isEngineRevved) {
      masterGain.gain.setTargetAtTime(0.9, globalAudioCtx.currentTime, 0.1);
      setTimeout(() => {
        if (masterGain && globalAudioCtx) {
          masterGain.gain.setTargetAtTime(0.5, globalAudioCtx.currentTime, 1.0);
        }
      }, 2000);
    }
  }, [isEngineRevved]);

  return null;
}
