"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

export function WaveformViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      const { engineRevLevel, currentSlide } = useAppStore.getState();
      if (currentSlide !== 5) { // Assuming slide 5 is V12 Heart
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      // Base amplitude plus extra based on rev level
      const targetAmplitude = 5 + (engineRevLevel * 45); 
      
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let x = 0; x < width; x++) {
        // Create a complex waveform using multiple sine waves
        const normalizedX = x / width;
        
        // Envelope so it fades out at edges
        const envelope = Math.sin(normalizedX * Math.PI);
        
        // Frequencies
        const f1 = Math.sin((normalizedX * 10) + time * 0.1);
        const f2 = Math.sin((normalizedX * 25) - time * 0.2) * 0.5;
        const f3 = engineRevLevel > 0 ? (Math.random() - 0.5) * engineRevLevel : 0; // Noise when revving

        const y = centerY + (f1 + f2 + f3) * targetAmplitude * envelope;
        
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = engineRevLevel > 0 ? "#ff3333" : "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mirror reflection
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x < width; x++) {
        const normalizedX = x / width;
        const envelope = Math.sin(normalizedX * Math.PI);
        const f1 = Math.sin((normalizedX * 10) + time * 0.1);
        const f2 = Math.sin((normalizedX * 25) - time * 0.2) * 0.5;
        const f3 = engineRevLevel > 0 ? (Math.random() - 0.5) * engineRevLevel : 0;
        const y = centerY - (f1 + f2 + f3) * targetAmplitude * envelope * 0.5; // Half amplitude for reflection
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = engineRevLevel > 0 ? "rgba(255, 51, 51, 0.3)" : "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      time += 0.5 + (engineRevLevel * 2); // Faster when revving
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={120} 
      className="w-full max-w-[400px] h-[120px]"
    />
  );
}
