"use client";
import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function MouseParallax({ children, intensity = 30, className = "" }: { children: React.ReactNode, intensity?: number, className?: string }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -1 to 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const springConfig = { damping: 30, stiffness: 100, mass: 1.5 };
  const smoothX = useSpring(0, springConfig);
  const smoothY = useSpring(0, springConfig);

  useEffect(() => {
    smoothX.set(mousePosition.x);
    smoothY.set(mousePosition.y);
  }, [mousePosition, smoothX, smoothY]);

  const x = useTransform(smoothX, [-1, 1], [-intensity, intensity]);
  const y = useTransform(smoothY, [-1, 1], [-intensity, intensity]);

  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
