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

          <div className="flex flex-col items-center gap-12 w-80 relative z-10">
             
             {/* Glowing Lamborghini Logo */}
             <motion.img 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
               src="https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg" 
               alt="Lamborghini Logo" 
               className="w-16 h-18 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
             />
             
             {/* Progress UI */}
             <div className="w-full flex flex-col gap-4">
                <div className="flex justify-between items-end w-full">
                  <span className={`${syncopate.className} text-[10px] tracking-[0.4em] text-white/90 uppercase`}>
                    INITIALIZING
                  </span>
                  <span className={`${montserrat.className} text-[10px] tracking-widest text-[#ff3333]`}>
                    {Math.round(progress)}%
                  </span>
                </div>
                
                {/* Segmented Loading Bar */}
                <div className="w-full h-1 bg-white/5 flex gap-[2px]">
                   <motion.div 
                     className="h-full bg-[#ff3333] shadow-[0_0_10px_#ff3333]" 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     transition={{ ease: "linear", duration: 0.2 }}
                   />
                </div>
                
                <span className={`${montserrat.className} text-[8px] tracking-[0.3em] text-white/30 text-right uppercase block`}>
                  Loading High-Fidelity Assets
                </span>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
