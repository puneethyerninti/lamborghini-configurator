"use client";
import React, { createContext, useContext, useEffect } from "react";
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";

const ParallaxContext = createContext<{ mouseX: MotionValue<number>; mouseY: MotionValue<number> } | null>(null);

export function MouseParallaxProvider({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <ParallaxContext.Provider value={{ mouseX, mouseY }}>
      {children}
    </ParallaxContext.Provider>
  );
}

export function useParallax(intensity: number = 30) {
  const context = useContext(ParallaxContext);
  
  // Dummy values if context is missing (to satisfy hook rules)
  const dummyX = useMotionValue(0);
  const dummyY = useMotionValue(0);
  
  const mX = context ? context.mouseX : dummyX;
  const mY = context ? context.mouseY : dummyY;

  const springConfig = { damping: 30, stiffness: 100, mass: 1.5 };
  const smoothX = useSpring(mX, springConfig);
  const smoothY = useSpring(mY, springConfig);

  const x = useTransform(smoothX, [-1, 1], [-intensity, intensity]);
  const y = useTransform(smoothY, [-1, 1], [-intensity, intensity]);

  return { x, y };
}

export function MouseParallax({ children, intensity = 30, className = "" }: { children: React.ReactNode, intensity?: number, className?: string }) {
  const { x, y } = useParallax(intensity);

  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
