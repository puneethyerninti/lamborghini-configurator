"use client";
import React, { useState, useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

import { Syncopate, Montserrat } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["200", "300", "400"], subsets: ["latin"] });

export function CinematicLoader() {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!active && progress === 100) {
      // Add a generous delay to allow ThreeJS shader compilation to finish
      // before we drop the loader. This prevents the initial hero section from lagging.
      const timer = setTimeout(() => {
        setShow(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
        >
          {/* High-Tech HUD Elements */}
          <div className="absolute top-12 left-12">
             <span className={`${syncopate.className} text-[8px] text-[#ff3333] tracking-widest`}>SYS.BOOT</span>
          </div>
          <div className="absolute top-12 right-12">
             <span className={`${syncopate.className} text-[8px] text-[#ff3333] tracking-widest`}>WEBGL_ACTIVE</span>
          </div>

          <div className="flex flex-col items-center gap-12 w-96 relative z-10">
             
             {/* High-Tech Logo Container */}
             <div className="relative">
               {/* Rotating scanning ring */}
               <div className="absolute inset-[-20px] rounded-full border border-[#00d4ff]/20 border-l-[#00d4ff] animate-[spin_3s_linear_infinite]" />
               <div className="absolute inset-[-30px] rounded-full border border-red-500/10 border-b-red-500/50 animate-[spin_4s_linear_infinite_reverse]" />
               
               <motion.img 
                 initial={{ opacity: 0, scale: 0.8 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 transition={{ duration: 1, ease: "easeOut" }}
                 src="https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg" 
                 alt="Lamborghini Logo" 
                 className="w-16 h-18 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] relative z-10" 
               />
               
               {/* Glitch overlay */}
               <motion.div 
                 animate={{ opacity: [0, 0.5, 0, 1, 0] }}
                 transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
                 className="absolute inset-0 bg-white/10 mix-blend-overlay blur-sm z-20"
               />
             </div>
             
             {/* Advanced Progress UI */}
             <div className="w-full flex flex-col gap-3 relative">
                {/* Global Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none z-50">
                   <div className="w-full h-[1px] bg-[#00d4ff]/20 absolute top-0 animate-[scanline_4s_linear_infinite]" />
                   <div className="w-full h-[1px] bg-red-500/20 absolute top-1/2 animate-[scanline_6s_linear_infinite_reverse]" />
                </div>
                
                <div className="flex justify-between items-end w-full px-2">
                  <div className="flex flex-col">
                    <span className={`${syncopate.className} text-[8px] tracking-[0.6em] text-[#00d4ff] uppercase animate-pulse`}>
                      Uplink Established
                    </span>
                    <span className={`${syncopate.className} text-[12px] tracking-[0.4em] text-white/90 uppercase mt-1`}>
                      INITIALIZING
                    </span>
                  </div>
                  <span className={`${montserrat.className} text-xl font-light tracking-widest text-white`}>
                    {Math.round(progress)}<span className="text-[10px] text-red-500">%</span>
                  </span>
                </div>
                
                {/* Segmented Loading Bar */}
                <div className="w-full h-[2px] bg-white/10 relative overflow-hidden">
                   <div 
                     className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00d4ff] to-red-500 transition-all duration-300 ease-out shadow-[0_0_10px_#00d4ff]"
                     style={{ width: `${progress}%` }}
                   />
                </div>
                
                {/* Simulated Terminal Output */}
                <div className={`${montserrat.className} text-[7px] text-white/40 tracking-widest uppercase flex justify-between px-2 mt-2`}>
                   <span>Loading High-Fidelity Assets</span>
                   <span className="text-red-500/70">{progress === 100 ? 'COMPLETE' : 'STANDBY'}</span>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
