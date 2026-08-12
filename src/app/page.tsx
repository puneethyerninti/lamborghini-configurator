"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Model3D } from "@/components/ui/Model3D";
import { ConfiguratorUI } from "@/components/ui/ConfiguratorUI";
import { SlideNav } from "@/components/ui/SlideNav";
import { ChapterBadge } from "@/components/ui/ChapterBadge";
import { StatCounter } from "@/components/ui/StatCounter";
import { LineReveal } from "@/components/ui/LineReveal";
import { WaveformViz } from "@/components/ui/WaveformViz";
import { TrackMap } from "@/components/ui/TrackMap";
import { TelemetryHUD } from "@/components/ui/TelemetryHUD";
import { useAppStore } from "@/store/useAppStore";
import { Playfair_Display } from "next/font/google";
import { syncopate, montserrat } from "@/fonts";
import { Hotspots } from "@/components/ui/Hotspots";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Navbar } from "@/components/ui/Navbar";
import { MouseParallaxProvider, useParallax, MouseParallax } from "@/components/ui/MouseParallax";
import { AudioEngine, globalAudioCtx, playGlobalMusic, pauseGlobalMusic } from "@/components/ui/AudioEngine";



const playfair = Playfair_Display({ weight: ["400", "600"], style: ["normal", "italic"], subsets: ["latin"] });

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// UI Utilities
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function Slide({ active, children, className = "" }: { active: boolean; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        scale: active ? 1 : 1.02,
        y: active ? 0 : 10,
        zIndex: active ? 10 : 0
      }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        pointerEvents: active ? "auto" : "none",
        visibility: active ? "visible" : "hidden",
      }}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = "", direction = "up", active = true }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  active?: boolean;
}) {
  const transforms: Record<string, string> = {
    up: "translateY(30px)",
    down: "translateY(-30px)",
    left: "translateX(30px)",
    right: "translateX(-30px)",
    none: "translate(0)",
  };

  if (!active) return <div className={`opacity-0 ${className}`}>{children}</div>;

  return (
    <div
      className={`animate-fadein ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: "both",
        ["--fade-from" as string]: transforms[direction],
      }}
    >
      {children}
    </div>
  );
}

// Parallax component removed â€” redundant with MouseParallax (Framer Motion spring-based)

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Scroll/Touch Handler
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function InteractionHandler() {
  const lastEventTime = useRef(0);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchHandled = useRef(false);

  useEffect(() => {
    const triggerSlide = (direction: "next" | "prev") => {
      const now = performance.now();
      if (now - lastEventTime.current < 700) return;
      lastEventTime.current = now;

      const { nextSlide, prevSlide } = useAppStore.getState();
      if (direction === "next") nextSlide();
      else prevSlide();
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 25) {
        triggerSlide(e.deltaY > 0 ? "next" : "prev");
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      touchHandled.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchHandled.current) return;

      const deltaY = touchStartY.current - e.touches[0].clientY;
      const deltaX = touchStartX.current - e.touches[0].clientX;

      if (Math.abs(deltaY) > 35 && Math.abs(deltaY) > Math.abs(deltaX)) {
        touchHandled.current = true;
        triggerSlide(deltaY > 0 ? "next" : "prev");
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return null;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Slide Content (All 14 Slides)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const SlideContent = React.memo(function SlideContent() {
  const { currentSlide, chapter } = useAppStore();

  return (
    <>
      <SlideNav />

      {/* â”€â”€ Chapter 1: The Bull â”€â”€ */}

      {/* S0: Hero Cold Open */}
      <Slide active={currentSlide === 0} className="p-8 md:p-16">
        <ChapterBadge chapter={0} title="Identity" active={currentSlide === 0} />



        <MouseParallax intensity={20} className="absolute bottom-16 left-8 md:left-16 flex flex-col gap-4">
          <FadeIn delay={0.4} active={currentSlide === 0}>
            <LineReveal direction="x" color="bg-[#ff3333]" className="h-[2px] w-12 mb-4" />
          </FadeIn>
          <SplitTextReveal
            text="AVENTADOR"
            className={`${syncopate.className} text-4xl md:text-6xl text-white font-bold tracking-widest`}
            active={currentSlide === 0}
            delay={0.6}
          />
          <SplitTextReveal
            text="Superveloce Jota"
            className={`${playfair.className} text-xl md:text-3xl text-white/60 italic`}
            active={currentSlide === 0}
            delay={1.2}
            stagger={0.03}
          />
        </MouseParallax>
      </Slide>

      {/* S1: Heritage */}
      <Slide active={currentSlide === 1}>
        <ChapterBadge chapter={0} title="Heritage" delay={0} active={currentSlide === 1} />
        <LineReveal direction="y" delay={0.2} className="absolute left-6 md:left-12 bottom-32 md:top-1/2 md:-translate-y-1/2 md:bottom-auto w-[1px] h-32 md:h-48" color="bg-[#ff3333]/40" />

        <MouseParallax intensity={15} className="absolute left-10 md:left-20 bottom-32 md:top-1/2 md:-translate-y-1/2 md:bottom-auto pr-6">
          <FadeIn delay={0.3} active={currentSlide === 1}>
            <span className={`${syncopate.className} text-[10px] text-[#ff3333] tracking-[0.4em] uppercase mb-4 block`}>Since 1963</span>
            <p className={`${montserrat.className} text-sm md:text-lg text-white/80 max-w-[280px] md:max-w-sm leading-relaxed`}>
              Born in Sant'Agata Bolognese. A lineage of uncompromising V12 power, daring design, and relentless pursuit of the extraordinary.
            </p>
          </FadeIn>
        </MouseParallax>
      </Slide>

      {/* S2: Philosophy */}
      <Slide active={currentSlide === 2}>
        <ChapterBadge chapter={0} title="Philosophy" delay={0} active={currentSlide === 2} />
        <div className="absolute left-4 right-4 bottom-12 md:inset-0 flex md:items-center justify-center pointer-events-none">
          <FadeIn delay={0.3} direction="down" active={currentSlide === 2}>
            <h2 className={`${playfair.className} text-lg md:text-5xl text-white max-w-[280px] md:max-w-4xl text-center leading-relaxed md:leading-tight mx-auto`}>
              "We don't build cars. We build dreams that happen to have four wheels and an engine."
            </h2>
          </FadeIn>
        </div>
      </Slide>


      {/* â”€â”€ Chapter 2: Engineering â”€â”€ */}

      {/* S3: LDVA 2.0 */}
      <Slide active={currentSlide === 3}>
        <ChapterBadge chapter={1} title="The Brain" delay={0} active={currentSlide === 3} />
        <div className="absolute right-6 md:right-16 top-1/4 md:top-1/3 text-right z-20">
          <FadeIn delay={0.2} direction="left" active={currentSlide === 3}>
            <h2 className={`${syncopate.className} text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#0088ff] drop-shadow-[0_0_20px_rgba(0,255,255,0.6)] font-bold mb-4`}>
              <ScrambleText text="LDVA 2.0" active={currentSlide === 3} delay={0.2} />
            </h2>
            <p className={`${montserrat.className} text-xs md:text-sm text-[#00d4ff] max-w-[200px] md:max-w-sm ml-auto uppercase tracking-widest leading-loose mb-8 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]`}>
              Lamborghini Dinamica Veicolo Attiva
            </p>
            <StatCounter value={50} suffix="ms" label="Reaction Time" delay={0.5} active={currentSlide === 3} />
          </FadeIn>
        </div>
      </Slide>

      {/* S4: Aerodynamics */}
      <Slide active={currentSlide === 4}>
        <ChapterBadge chapter={1} title="Active Aero" delay={0} active={currentSlide === 4} />
        <div className="absolute left-8 md:left-16 bottom-24 md:top-1/4 md:bottom-auto max-w-[280px] md:max-w-sm">
          <FadeIn delay={0.3} active={currentSlide === 4}>
            <LineReveal direction="x" delay={0.5} className="w-12 h-[2px] mb-6" color="bg-[#00d4ff]" />
            <h2 className={`${syncopate.className} text-4xl text-white font-bold mb-2`}>ALA 2.0</h2>
            <p className={`${montserrat.className} text-sm text-white/60 leading-relaxed mb-8`}>
              Aerodinamica Lamborghini Attiva. Active aero-vectoring algorithms control electronic motors in the front splitter and rear wing.
            </p>
            <StatCounter value={40} suffix="%" label="Downforce Increase vs SV" delay={0.6} active={currentSlide === 4} />
          </FadeIn>
        </div>
      </Slide>

      {/* S5: V12 Heart */}
      <Slide active={currentSlide === 5}>
        <ChapterBadge chapter={1} title="V12 Engine" delay={0} active={currentSlide === 5} />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-16 flex flex-col items-center">
          <FadeIn delay={0.3} direction="up" active={currentSlide === 5}>
            <WaveformViz />
            <button
              onClick={() => useAppStore.getState().revEngine()}
              className={`group flex flex-col items-center gap-4 mt-8 pointer-events-auto`}
            >
              <div className="w-12 h-12 rounded-full border border-[#ff3333] flex items-center justify-center group-hover:bg-[#ff3333]/10 transition-colors">
                <div className="w-4 h-4 bg-[#ff3333] rounded-full animate-pulse" />
              </div>
              <span className={`${syncopate.className} text-[8px] font-bold tracking-[0.3em] text-[#ff3333] uppercase`}>
                Ignite
              </span>
            </button>
          </FadeIn>
        </div>
      </Slide>

      {/* S6: Carbon Architecture */}
      <Slide active={currentSlide === 6}>
        <ChapterBadge chapter={1} title="Architecture" delay={0} active={currentSlide === 6} />
        <div className="absolute left-6 md:left-16 bottom-24 md:top-1/3 md:bottom-auto z-20">
          <FadeIn delay={0.2} active={currentSlide === 6}>
            <h2 className={`${syncopate.className} text-4xl text-transparent bg-clip-text bg-gradient-to-br from-[#00ffcc] to-[#0055ff] drop-shadow-[0_0_20px_rgba(0,255,204,0.5)] font-bold mb-8`}>
              <ScrambleText text="CARBON" active={currentSlide === 6} delay={0.2} /><br />
              <ScrambleText text="CORE" active={currentSlide === 6} delay={0.4} />
            </h2>
            <StatCounter value={1525} suffix="kg" label="Dry Weight" delay={0.4} active={currentSlide === 6} />
          </FadeIn>
        </div>
      </Slide>


      {/* â”€â”€ Chapter 3: Performance â”€â”€ */}

      {/* S7: Acceleration */}
      <Slide active={currentSlide === 7}>
        <ChapterBadge chapter={2} title="Acceleration" delay={0} active={currentSlide === 7} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <StatCounter value={2.8} decimals={1} suffix="s" label="0-100 KM/H" delay={0.2} active={currentSlide === 7} />
        </div>
      </Slide>

      {/* S8: Top Speed */}
      <Slide active={currentSlide === 8}>
        <ChapterBadge chapter={2} title="Velocity" delay={0} active={currentSlide === 8} />
      </Slide>

      {/* S9: NÃ¼rburgring */}
      <Slide active={currentSlide === 9}>
        <ChapterBadge chapter={2} title="The Ring" delay={0} active={currentSlide === 9} />
        <div className="absolute left-1/2 md:left-16 top-1/2 md:top-1/2 -translate-x-1/2 md:-translate-x-0 -translate-y-1/2 flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-[90vw] md:max-w-none">
          <FadeIn delay={0.2} active={currentSlide === 9}>
            <TrackMap active={currentSlide === 9} />
          </FadeIn>
          <FadeIn delay={1.5} active={currentSlide === 9}>
            <div className="relative min-w-[320px] bg-black/60 backdrop-blur-xl border border-[#b59b4c]/30 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden group">
              {/* Sweeping metallic glare effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#b59b4c] opacity-50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#b59b4c] opacity-50" />

              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 border border-[#b59b4c] rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-0.5 h-0.5 bg-[#b59b4c] rounded-full" />
                  </div>
                  <span className={`${syncopate.className} text-[8px] text-[#b59b4c] tracking-[0.5em] uppercase font-bold`}>
                    OFFICIAL LAP RECORD
                  </span>
                </div>

                {/* Mechanical Number Roll Container */}
                <div className="relative mt-4 mb-6">
                  <span className={`${montserrat.className} text-5xl md:text-7xl text-white font-light tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
                    6:44<span className="text-[#b59b4c]">.97</span>
                  </span>
                </div>

                {/* Tactical Data Separator */}
                <div className="w-full h-[1px] bg-gradient-to-r from-[#b59b4c]/50 to-transparent my-2" />

                <div className="flex items-center justify-between pt-2">
                  <span className={`${syncopate.className} text-[7px] text-white/50 tracking-[0.3em] uppercase`}>NORDSCHLEIFE</span>
                  <span className={`${montserrat.className} text-[9px] text-[#b59b4c] tracking-widest font-light`}>20.6 KM</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Slide>


      {/* â”€â”€ Chapter 4: The Atelier â”€â”€ */}

      {/* S10: Configurator */}
      <Slide active={currentSlide === 10} className="!pointer-events-none">
        <ChapterBadge chapter={3} title="Ad Personam" delay={0} active={currentSlide === 10} />
        <div className="absolute right-0 md:right-48 lg:right-56 bottom-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-auto pointer-events-auto z-10">
          <MouseParallax intensity={10}>
            <FadeIn delay={0.2} direction="left" active={currentSlide === 10}>
              <ConfiguratorUI />
            </FadeIn>
          </MouseParallax>
        </div>
      </Slide>


      {/* â”€â”€ Chapter 5: The Invitation â”€â”€ */}

      {/* S11: Legacy / Stats Wall */}
      <Slide active={currentSlide === 11}>
        <ChapterBadge chapter={4} title="Masterpiece" delay={0} active={currentSlide === 11} />
        <div className="absolute left-8 md:left-16 bottom-16 md:top-1/4 md:bottom-auto max-w-[300px] md:max-w-lg">
          <FadeIn delay={0.2} active={currentSlide === 11}>
            <h2 className={`${syncopate.className} text-xl md:text-2xl text-white font-bold tracking-widest mb-8 md:mb-12 uppercase`}>Technical Specifications</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
              <div className="flex flex-col gap-1 border-l border-white/20 pl-4">
                <span className={`${montserrat.className} text-[8px] text-white/50 uppercase tracking-widest`}>Engine</span>
                <span className={`${syncopate.className} text-xs text-white`}>V12, 60Â°, MPI</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/20 pl-4">
                <span className={`${montserrat.className} text-[8px] text-white/50 uppercase tracking-widest`}>Displacement</span>
                <span className={`${syncopate.className} text-xs text-white`}>6,498 cmÂ³</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/20 pl-4">
                <span className={`${montserrat.className} text-[8px] text-white/50 uppercase tracking-widest`}>Transmission</span>
                <span className={`${syncopate.className} text-xs text-white`}>7-Speed ISR</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/20 pl-4">
                <span className={`${montserrat.className} text-[8px] text-white/50 uppercase tracking-widest`}>Drivetrain</span>
                <span className={`${syncopate.className} text-xs text-white`}>AWD with Haldex Gen IV</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-[#c8a96e] pl-4">
                <span className={`${montserrat.className} text-[8px] text-[#c8a96e] uppercase tracking-widest`}>Production</span>
                <span className={`${syncopate.className} text-xs text-white`}>Limited to 900</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </Slide>

      {/* S12: Inquiry / Reserve */}
      <Slide active={currentSlide === 12} className="pointer-events-none">
        <ChapterBadge chapter={4} title="Ownership" delay={0} active={currentSlide === 12} />
        <div className="absolute left-0 md:left-16 bottom-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-[400px] pointer-events-auto z-10">
          <FadeIn delay={0.2} direction="right" active={currentSlide === 12}>
            <div className="flex flex-col gap-6 p-8 md:p-10 bg-black/90 border-t md:border border-white/10">
              <div>
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg"
                  alt="Lamborghini Logo"
                  className="w-10 h-12 object-contain drop-shadow-2xl brightness-110 mb-6"
                />
                <h2 className={`${syncopate.className} text-xl text-white font-bold tracking-widest uppercase mb-2`}>Acquire</h2>
                <p className={`${montserrat.className} text-[10px] text-white/50 uppercase tracking-[0.2em]`}>Begin the conversation</p>
              </div>

              <div className="flex flex-col gap-5 mt-4">
                <input 
                  type="text" 
                  placeholder="FULL NAME" 
                  className={`bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-[#b59b4c] transition-colors ${syncopate.className} text-[8px] tracking-[0.2em] w-full`} 
                />
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className={`bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-[#b59b4c] transition-colors ${syncopate.className} text-[8px] tracking-[0.2em] w-full`} 
                />
                <input 
                  type="text" 
                  placeholder="PREFERRED DEALERSHIP" 
                  className={`bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-[#b59b4c] transition-colors ${syncopate.className} text-[8px] tracking-[0.2em] w-full`} 
                />
              </div>

              <button
                className={`mt-6 border border-[#b59b4c] px-8 py-4 ${syncopate.className} font-bold tracking-[0.3em] text-[8px] uppercase text-[#b59b4c] hover:bg-[#b59b4c] hover:text-black transition-colors duration-500 w-full`}
              >
                Submit Inquiry
              </button>
            </div>
          </FadeIn>
        </div>
      </Slide>

      {/* Scroll hint on Hero */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none"
        style={{ opacity: currentSlide === 0 ? 1 : 0, transition: "opacity 0.5s ease" }}
      >
        <span className={`${syncopate.className} text-[7px] font-bold tracking-[0.4em] text-white/50 uppercase`}>Scroll</span>
        <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-white h-1/2 animate-scrollpulse" />
        </div>
      </div>
    </>
  );
});

// â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• 
// Cinematic Letterbox (Phase A)
// â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• 
function CinematicLetterbox() {
  const isTransitioning = useAppStore(s => s.isTransitioning);
  return (
    <div className="pointer-events-none z-[100]">
      <div className={`fixed top-0 left-0 w-full h-[12vh] bg-black transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isTransitioning ? 'translate-y-0' : '-translate-y-full'}`} />
      <div className={`fixed bottom-0 left-0 w-full h-[12vh] bg-black transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isTransitioning ? 'translate-y-0' : 'translate-y-full'}`} />
    </div>
  );
}

// â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• 
// Main Page Shell
// â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• 
export default function Home() {
  const { toggleAudio, isAudioEnabled } = useAppStore();

  return (
    <MouseParallaxProvider>
      <main className="fixed inset-0 w-screen h-screen overflow-hidden selection:bg-white/20 bg-black touch-none">
        <AudioEngine />
        <CinematicLetterbox />
        
        <Navbar />

        {/* 3D Canvas Layer */}
        <div className="absolute inset-0 z-0 bg-black">
          <Model3D />
        </div>

        <div className="absolute inset-0 pointer-events-none -z-[1] flex items-center justify-center overflow-hidden opacity-[0.03]">
          <motion.div
            initial={false}
            animate={{
              y: useAppStore.getState().currentSlide * -100,
              scale: 1 + (useAppStore.getState().currentSlide * 0.05)
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`${syncopate.className} text-[40vw] font-bold text-transparent text-stroke-2 text-stroke-white select-none`}
            style={{ WebkitTextStroke: "2px white" }}
          >
            SVJ
          </motion.div>
        </div>

        {/* CSS Vignette â€” replaces expensive post-processing Vignette pass */}
        <div className="absolute inset-0 z-[1] pointer-events-none transform-gpu" style={{ boxShadow: 'inset 0 0 150px 60px rgba(0,0,0,0.7)' }} />

        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden transform-gpu">
          <motion.div
            initial={false}
            animate={{
              skewY: useAppStore.getState().isTransitioning ? (Math.random() > 0.5 ? 2 : -2) : 0,
              scale: useAppStore.getState().isTransitioning ? 0.98 : 1,
              filter: useAppStore.getState().isTransitioning ? "blur(4px)" : "none"
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <SlideContent />
          </motion.div>
        </div>

        <TelemetryHUD />

        <InteractionHandler />
      </main>
    </MouseParallaxProvider>
  );
}
