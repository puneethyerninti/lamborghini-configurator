"use client";
import React, { useState, useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Syncopate, Montserrat } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["200", "300", "400"], subsets: ["latin"] });

export function CinematicLoader() {
  const { active, progress, errors, item, loaded, total } = useProgress();
  const [isReady, setIsReady] = useState(false);
  
  // Ensure we wait for a tiny bit after 100% to let the canvas compile shaders
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {!isReady && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
          transition={{ duration: 1.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Logo with pulsing glow */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative flex flex-col items-center gap-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#b59b4c]/20 blur-[50px] rounded-full animate-pulse" />
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg" 
                alt="Lamborghini" 
                className="w-24 md:w-32 object-contain drop-shadow-[0_0_15px_rgba(181,155,76,0.3)] relative z-10"
              />
            </div>

            <div className="flex flex-col items-center gap-4 w-[60vw] max-w-[300px]">
              {/* Progress Text */}
              <div className="flex justify-between w-full px-1">
                <span className={`${syncopate.className} text-[8px] tracking-[0.4em] text-[#b59b4c] uppercase font-bold`}>
                  Initializing
                </span>
                <span className={`${montserrat.className} text-[10px] tracking-widest text-white/50`}>
                  {Math.round(progress)}%
                </span>
              </div>
              
              {/* Ultra thin progress bar */}
              <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-[#b59b4c] shadow-[0_0_10px_#b59b4c]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              
              {/* Loading sub-status */}
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${syncopate.className} text-[6px] tracking-[0.3em] text-white/30 uppercase mt-4`}
              >
                Rendering Environment
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
