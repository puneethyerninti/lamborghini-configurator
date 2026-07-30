"use client";

import React, { useEffect, useRef } from "react";
import { Model3D } from "@/components/ui/Model3D";
import { ConfiguratorUI } from "@/components/ui/ConfiguratorUI";
import { CinematicLoader } from "@/components/ui/CinematicLoader";
import { MouseParallax } from "@/components/ui/MouseParallax";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { Syncopate, Montserrat, Playfair_Display } from "next/font/google";

// Inject Native Next.js Google Fonts for maximum stability and visual fidelity
const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["200", "300", "400"], subsets: ["latin"] });
const playfair = Playfair_Display({ weight: ["400", "600"], style: ["normal", "italic"], subsets: ["latin"] });

// Beautiful, readable, PPT-style animated typography
function PPTHeader({ text }: { text: string }) {
  return (
    <div className="absolute top-24 md:top-32 left-8 md:left-16 pointer-events-none z-10 select-none">
      <motion.h1
        initial={{ opacity: 0, x: -50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 1.05 }}
        transition={{ duration: 0.8, type: "spring", damping: 20 }}
        className={`${syncopate.className} font-bold text-3xl md:text-5xl lg:text-6xl text-white tracking-widest uppercase`}
      >
        {text}
      </motion.h1>
    </div>
  );
}

function SubTitle({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="overflow-hidden mb-6">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
        className={`${syncopate.className} text-[10px] md:text-xs tracking-[0.4em] text-[#ff3333] uppercase`}
      >
        {children}
      </motion.div>
    </div>
  );
}

function EditorialParagraph({ text, delay = 0 }: { text: string; delay?: number }) {
  const lines = text.split(". ").filter(t => t.length > 0);
  return (
    <div className="flex flex-col gap-4 max-w-lg">
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden">
          <motion.p
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-50%", opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + (i * 0.15) }}
            className={`${montserrat.className} text-sm md:text-[15px] font-light leading-relaxed text-white/80`}
          >
            {line}.
          </motion.p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { currentSlide, nextSlide, prevSlide, isInteriorMode, toggleInteriorMode, revEngine } = useAppStore();
  const isScrolling = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling.current || isInteriorMode) return;
      if (Math.abs(e.deltaY) > 20) {
        isScrolling.current = true;
        if (e.deltaY > 0) nextSlide();
        else prevSlide();
        // HYPER-RESPONSIVE LOCK: Lowered from 1200ms to 600ms so it never feels stuck
        setTimeout(() => { isScrolling.current = false; }, 600);
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [nextSlide, prevSlide, isInteriorMode]);

  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden selection:bg-white/20 bg-black">
      <CinematicLoader />

      {/* Global Navigation Header */}
      <header className="absolute top-0 left-0 w-full p-8 md:p-12 z-50 flex justify-between items-center pointer-events-auto text-white">
        <div className="flex items-center gap-4">
          {/* High-Res Lamborghini Shield Logo */}
          <img
            src="https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg"
            alt="Lamborghini Logo"
            className="w-10 h-11 md:w-12 md:h-14 object-contain drop-shadow-2xl brightness-110"
          />
        </div>
        <div className={`flex gap-8 ${syncopate.className} text-[9px] font-bold tracking-[0.2em] uppercase opacity-80`}>
          <button className="hover:opacity-100 transition-opacity drop-shadow-lg">Models</button>
          <button className="hover:opacity-100 transition-opacity drop-shadow-lg">Menu</button>
        </div>
      </header>

      <div className="absolute inset-0 z-0 bg-black">
        <Model3D />
      </div>

      {/* 2D Graphic Design Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* INSTANT CROSSFADE: Removed mode="wait" so slides transition instantly! */}
        <AnimatePresence>

          {currentSlide === 0 && !isInteriorMode && (
            <motion.div key="s0" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16">
               
               {/* Massive Ultra-Lightweight Background Typography */}
               {/* Uses gradient clipping and text-stroke instead of heavy drop shadows */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-full flex justify-center -z-10">
                  <motion.h1 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, ease: "easeOut" }}
                    className={`${syncopate.className} text-[15vw] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent select-none`}
                  >
                    V12
                  </motion.h1>
               </div>

               {/* Top Left Minimal Data */}
               <motion.div 
                 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}
                 className="flex flex-col gap-2 mt-20 md:mt-24"
               >
                 <div className="w-8 h-[1px] bg-white/50" />
                 <span className={`${montserrat.className} text-[9px] md:text-[10px] tracking-[0.4em] text-white/50 uppercase`}>
                   Model 01 / Automobili Lamborghini
                 </span>
               </motion.div>

               {/* Bottom Content Area */}
               <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-8">
                 
                 {/* Main Title */}
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2 }}
                   className="flex flex-col"
                 >
                   <span className={`${syncopate.className} text-[10px] md:text-xs tracking-[0.6em] text-[#ff3333] uppercase font-bold mb-4`}>
                     Superveloce Jota
                   </span>
                   <h2 className={`${playfair.className} text-5xl md:text-7xl lg:text-8xl text-white leading-none`}>
                     Aventador
                   </h2>
                 </motion.div>

                 {/* Actions and Specs */}
                 <motion.div 
                   initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4 }}
                   className="flex flex-col items-end gap-8 pointer-events-auto"
                 >
                   <div className="flex flex-col items-end gap-2 text-right">
                     <span className={`${montserrat.className} text-[9px] tracking-[0.3em] text-white/40 uppercase`}>Peak Power</span>
                     <span className={`${syncopate.className} text-sm md:text-base text-white tracking-widest`}>770 CV</span>
                   </div>
                   
                   <div className="flex gap-4">
                     <button 
                       onClick={() => nextSlide()}
                       className={`border border-white/20 px-8 md:px-12 py-4 ${syncopate.className} text-[9px] font-bold tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-colors duration-300`}
                     >
                       Explore
                     </button>
                     <button 
                       onClick={() => { for(let i=0; i<5; i++) nextSlide(); }}
                       className={`bg-[#ff2222] border border-[#ff2222] px-8 md:px-12 py-4 ${syncopate.className} text-[9px] font-bold tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black hover:border-white transition-colors duration-300`}
                     >
                       Configure
                     </button>
                   </div>
                 </motion.div>

               </div>
            </motion.div>
          )}

          {currentSlide === 1 && !isInteriorMode && (
            <motion.div key="s1" className="absolute inset-0 pointer-events-none">
              <PPTHeader text="LDVA 2.0" />
              <div className="absolute right-12 md:right-24 top-1/2 -translate-y-1/2 max-w-lg text-right pointer-events-auto">
                <MouseParallax intensity={15}>
                  <EditorialParagraph
                    delay={0.2}
                    text="Lamborghini Dinamica Veicolo Attiva 2.0. The central brain of the SVJ. It interprets driver inputs in real-time, executing predictive computational models to adjust the active suspension, steering, and aerodynamics in under 50 milliseconds."
                  />
                </MouseParallax>
              </div>
            </motion.div>
          )}

          {currentSlide === 2 && !isInteriorMode && (
            <motion.div key="s2" className="absolute inset-0 pointer-events-none">
              <PPTHeader text="AERODYNAMICS" />
              <div className="absolute bottom-32 left-12 md:left-24 max-w-2xl pointer-events-auto">
                <MouseParallax intensity={20}>
                  <SubTitle delay={0.2}>Aerodinamica Lamborghini Attiva</SubTitle>
                  <EditorialParagraph
                    delay={0.4}
                    text="Active aero-vectoring algorithms control electronic motors in the front splitter and rear wing. By stalling the inner channels, ALA 2.0 drastically reduces aerodynamic drag on straights. In corners, it channels air to individual wheels to maximize cornering downforce."
                  />
                </MouseParallax>
              </div>
            </motion.div>
          )}

          {currentSlide === 3 && !isInteriorMode && (
            <motion.div key="s3" className="absolute inset-0 pointer-events-none">
              <PPTHeader text="V12 POWER" />
              <div className="absolute left-12 md:left-24 top-1/3 max-w-md pointer-events-auto">
                <MouseParallax intensity={10}>
                  <SubTitle delay={0.2}>The Heart of the Bull</SubTitle>
                  <EditorialParagraph
                    delay={0.4}
                    text="A masterpiece of mechanical engineering. The naturally aspirated 6.5L V12 beats at an astonishing 8,500 RPM, delivering 770 CV. Titanium intake valves and a lightweight exhaust system ensure an unparalleled, ear-shattering symphony."
                  />
                  <motion.button
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.6 }}
                    onClick={revEngine}
                    className={`group flex items-center gap-4 mt-12 text-[10px] ${syncopate.className} font-bold tracking-[0.2em] uppercase text-white hover:text-[#ff3333] transition-colors pointer-events-auto`}
                  >
                    <span className="w-12 h-[1px] bg-white group-hover:bg-[#ff3333] transition-colors" />
                    Ignite Engine
                  </motion.button>
                </MouseParallax>
              </div>
            </motion.div>
          )}

          {currentSlide === 4 && !isInteriorMode && (
            <motion.div key="s4" className="absolute inset-0 pointer-events-none">
              <PPTHeader text="PERFORMANCE" />

              <div className="absolute top-1/3 left-12 md:left-24 pointer-events-auto">
                <MouseParallax intensity={10}>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <span className={`${syncopate.className} text-6xl md:text-8xl font-bold text-white leading-none block`}>2.8<span className="text-3xl text-[#ff3333]">s</span></span>
                    <span className={`${montserrat.className} text-[10px] tracking-[0.4em] text-[#ff3333] uppercase block mt-2`}>0-100 KM/H Acceleration</span>
                  </motion.div>
                </MouseParallax>
              </div>

              <div className="absolute top-1/2 right-12 md:right-24 text-right pointer-events-auto mt-12">
                <MouseParallax intensity={15}>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <span className={`${syncopate.className} text-6xl md:text-8xl font-bold text-white leading-none block`}>352</span>
                    <span className={`${montserrat.className} text-[10px] tracking-[0.4em] text-[#ff3333] uppercase block mt-2`}>Top Speed (KM/H)</span>
                  </motion.div>
                </MouseParallax>
              </div>
            </motion.div>
          )}

          {currentSlide === 5 && !isInteriorMode && (
            <motion.div key="s5" className="absolute right-12 md:right-24 top-1/2 -translate-y-1/2 pointer-events-auto">
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <MouseParallax intensity={15}>
                  <ConfiguratorUI />
                </MouseParallax>
              </motion.div>
            </motion.div>
          )}

          {currentSlide === 6 && !isInteriorMode && (
            <motion.div key="s6" className="absolute inset-0 pointer-events-none">
              <PPTHeader text="CARBON CORE" />
              <div className="absolute left-12 md:left-24 top-1/3 max-w-lg pointer-events-auto">
                <MouseParallax intensity={15}>
                  <SubTitle delay={0.2}>Forged Composites® Tub</SubTitle>
                  <EditorialParagraph
                    delay={0.4}
                    text="The entire cockpit is built around an ultra-rigid carbon-fiber monocoque tub. This aerospace-grade structure provides immense torsional stiffness, keeping the car perfectly flat through high-G corners while maximizing driver protection."
                  />
                  <motion.button
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
                    onClick={toggleInteriorMode}
                    className={`group flex items-center gap-4 mt-12 text-[10px] ${syncopate.className} font-bold tracking-[0.2em] uppercase text-white hover:text-white/50 transition-colors pointer-events-auto`}
                  >
                    <span className="w-12 h-[1px] bg-white group-hover:bg-white/50 transition-colors" />
                    Enter Cockpit
                  </motion.button>
                </MouseParallax>
              </div>
            </motion.div>
          )}

          {currentSlide === 7 && !isInteriorMode && (
            <motion.div key="s7" className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
              <MouseParallax intensity={10} className="text-center mt-32">
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.5, type: "spring", damping: 15 }}
                  className={`border border-white/40 px-20 py-6 ${syncopate.className} font-bold tracking-[0.3em] text-[10px] uppercase text-white hover:bg-white hover:text-black transition-all duration-700 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.1)]`}
                >
                  Submit Inquiry
                </motion.button>
              </MouseParallax>
            </motion.div>
          )}

        </AnimatePresence>

        {isInteriorMode && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <button
              onClick={toggleInteriorMode}
              className={`bg-black/40 backdrop-blur-md border border-white/20 px-10 py-4 ${syncopate.className} font-bold tracking-[0.2em] text-[9px] uppercase text-white hover:bg-white hover:text-black transition-all shadow-2xl`}
            >
              Exit Cockpit
            </button>
          </div>
        )}

        <AnimatePresence>
          {!isInteriorMode && currentSlide === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5 pointer-events-none"
            >
              <span className={`${syncopate.className} text-[8px] font-bold tracking-[0.4em] text-white/50 uppercase drop-shadow-md`}>
                Discover
              </span>
              <div className="w-[1px] h-16 bg-white/20 relative overflow-hidden">
                <motion.div
                  animate={{ y: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-white h-1/2"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
