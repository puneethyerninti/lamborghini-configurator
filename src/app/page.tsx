"use client";

import React, { useEffect, useRef, useState } from "react";
import { Model3D } from "@/components/ui/Model3D";
import { ConfiguratorUI } from "@/components/ui/ConfiguratorUI";
import { CinematicLoader } from "@/components/ui/CinematicLoader";
import { SlideNav } from "@/components/ui/SlideNav";
import { ChapterBadge } from "@/components/ui/ChapterBadge";
import { StatCounter } from "@/components/ui/StatCounter";
import { LineReveal } from "@/components/ui/LineReveal";
import { WaveformViz } from "@/components/ui/WaveformViz";
import { TrackMap } from "@/components/ui/TrackMap";
import { useAppStore } from "@/store/useAppStore";
import { Syncopate, Montserrat, Playfair_Display } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["200", "300", "400", "500"], subsets: ["latin"] });
const playfair = Playfair_Display({ weight: ["400", "600"], style: ["normal", "italic"], subsets: ["latin"] });

// ═══════════════════════════════════════════════════════════════════
// UI Utilities
// ═══════════════════════════════════════════════════════════════════

function Slide({ active, children, className = "" }: { active: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity: active ? 1 : 0,
        transition: "opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
        willChange: "opacity",
        pointerEvents: active ? "auto" : "none",
        visibility: active ? "visible" : "hidden",
      }}
    >
      {children}
    </div>
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

function Parallax({ children, intensity = 15, className = "" }: { children: React.ReactNode; intensity?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let rafId: number;
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    const onMove = (e: MouseEvent) => {
      targetX = ((e.clientX / window.innerWidth) - 0.5) * intensity * 2;
      targetY = ((e.clientY / window.innerHeight) - 0.5) * intensity * 2;
    };
    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      if (ref.current) ref.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId); };
  }, [intensity]);
  return <div ref={ref} className={className} style={{ willChange: "transform" }}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════════
// Scroll/Touch Handler
// ═══════════════════════════════════════════════════════════════════
function InteractionHandler() {
  const lastEventTime = useRef(0);
  const touchStartY = useRef(0);
  const locked = useRef(false);

  useEffect(() => {
    const handleMove = (deltaY: number) => {
      const { isInteriorMode, nextSlide, prevSlide } = useAppStore.getState();
      if (isInteriorMode) return;

      const now = performance.now();
      if (now - lastEventTime.current > 1200) locked.current = false;
      if (locked.current) return;

      if (Math.abs(deltaY) > 25) {
        locked.current = true;
        lastEventTime.current = now;
        if (deltaY > 0) nextSlide();
        else prevSlide();
      }
    };

    const onWheel = (e: WheelEvent) => handleMove(e.deltaY);
    const onTouchStart = (e: TouchEvent) => touchStartY.current = e.touches[0].clientY;
    const onTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      handleMove(deltaY); // Swiping up means scrolling down (positive delta)
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}

// ═══════════════════════════════════════════════════════════════════
// Slide Content (All 14 Slides)
// ═══════════════════════════════════════════════════════════════════
const SlideContent = React.memo(function SlideContent() {
  const { currentSlide, isInteriorMode, chapter } = useAppStore();

  return (
    <>
      <SlideNav />

      {/* ── Chapter 1: The Bull ── */}
      
      {/* S0: Hero Cold Open */}
      <Slide active={currentSlide === 0 && !isInteriorMode} className="p-8 md:p-16">
        <ChapterBadge chapter={0} title="Identity" active={currentSlide === 0} />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-full flex flex-col items-center justify-center pointer-events-none mix-blend-overlay z-[-1]">
          <FadeIn delay={0.2} direction="none" active={currentSlide === 0}>
            <h1 className={`${syncopate.className} text-[18vw] font-bold tracking-tighter leading-none text-white/5 opacity-30 select-none`}>
              SVJ
            </h1>
          </FadeIn>
        </div>

        <div className="absolute bottom-16 left-8 md:left-16 flex flex-col gap-4">
          <FadeIn delay={0.4} active={currentSlide === 0}>
            <LineReveal direction="x" color="bg-[#ff3333]" className="h-[2px] w-12" />
            <h2 className={`${syncopate.className} text-4xl md:text-6xl text-white font-bold tracking-widest mt-4`}>AVENTADOR</h2>
            <h3 className={`${playfair.className} text-xl md:text-3xl text-white/60 italic`}>Superveloce Jota</h3>
          </FadeIn>
        </div>
      </Slide>

      {/* S1: Heritage */}
      <Slide active={currentSlide === 1}>
        <ChapterBadge chapter={0} title="Heritage" delay={0} active={currentSlide === 1} />
        <LineReveal direction="y" delay={0.2} className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-[1px] h-48" color="bg-[#ff3333]/40" />
        
        <div className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 pr-6">
          <FadeIn delay={0.3} active={currentSlide === 1}>
            <span className={`${syncopate.className} text-[10px] text-[#ff3333] tracking-[0.4em] uppercase mb-4 block`}>Since 1963</span>
            <p className={`${montserrat.className} text-lg text-white/80 max-w-sm leading-relaxed`}>
              Born in Sant'Agata Bolognese. A lineage of uncompromising V12 power, daring design, and relentless pursuit of the extraordinary.
            </p>
          </FadeIn>
        </div>
      </Slide>

      {/* S2: Philosophy */}
      <Slide active={currentSlide === 2}>
        <ChapterBadge chapter={0} title="Philosophy" delay={0} active={currentSlide === 2} />
        <div className="absolute inset-0 flex items-center justify-center">
          <FadeIn delay={0.3} direction="down" active={currentSlide === 2}>
            <h2 className={`${playfair.className} text-3xl md:text-5xl text-white max-w-4xl text-center leading-tight`}>
              "We don't build cars. We build dreams that happen to have four wheels and an engine."
            </h2>
          </FadeIn>
        </div>
      </Slide>


      {/* ── Chapter 2: Engineering ── */}
      
      {/* S3: LDVA 2.0 */}
      <Slide active={currentSlide === 3}>
        <ChapterBadge chapter={1} title="The Brain" delay={0} active={currentSlide === 3} />
        <div className="absolute right-16 top-1/3 text-right">
          <FadeIn delay={0.2} direction="left" active={currentSlide === 3}>
            <h2 className={`${syncopate.className} text-4xl md:text-6xl text-white font-bold mb-4`}>LDVA 2.0</h2>
            <p className={`${montserrat.className} text-sm text-[#00d4ff] max-w-sm ml-auto uppercase tracking-widest leading-loose mb-8`}>
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
        <div className="absolute left-16 top-1/3">
          <FadeIn delay={0.2} active={currentSlide === 6}>
            <h2 className={`${syncopate.className} text-4xl text-white font-bold mb-8`}>CARBON<br/>CORE</h2>
            <StatCounter value={1525} suffix="kg" label="Dry Weight" delay={0.4} active={currentSlide === 6} />
          </FadeIn>
        </div>
      </Slide>


      {/* ── Chapter 3: Performance ── */}
      
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
        <div className="absolute right-24 bottom-24 text-right">
           <StatCounter value={352} suffix="KM/H" label="Top Speed" delay={0.2} active={currentSlide === 8} />
        </div>
      </Slide>

      {/* S9: Nürburgring */}
      <Slide active={currentSlide === 9}>
        <ChapterBadge chapter={2} title="The Ring" delay={0} active={currentSlide === 9} />
        <div className="absolute left-16 top-1/2 -translate-y-1/2 flex items-center gap-16">
          <FadeIn delay={0.2} active={currentSlide === 9}>
            <TrackMap active={currentSlide === 9} />
          </FadeIn>
          <FadeIn delay={1.5} active={currentSlide === 9}>
            <div className="flex flex-col gap-2">
              <span className={`${syncopate.className} text-[10px] text-[#ff9900] tracking-[0.4em] uppercase font-bold`}>Lap Record</span>
              <span className={`${syncopate.className} text-6xl text-white font-bold`}>6:44.97</span>
              <span className={`${montserrat.className} text-[9px] text-white/50 tracking-widest uppercase mt-2`}>Nordschleife / 20.6 km</span>
            </div>
          </FadeIn>
        </div>
      </Slide>


      {/* ── Chapter 4: The Atelier ── */}
      
      {/* S10: Configurator */}
      <Slide active={currentSlide === 10 && !isInteriorMode} className="!pointer-events-none">
        <ChapterBadge chapter={3} title="Ad Personam" delay={0} active={currentSlide === 10} />
        <div className="absolute right-0 md:right-48 lg:right-56 bottom-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-auto pointer-events-auto z-10">
          <Parallax intensity={10}>
            <FadeIn delay={0.2} direction="left" active={currentSlide === 10}>
              <ConfiguratorUI />
            </FadeIn>
          </Parallax>
        </div>
      </Slide>

      {/* S11: Interior (Same Configurator UI, but camera moves inside) */}
      <Slide active={currentSlide === 11} className="!pointer-events-none">
         <ChapterBadge chapter={3} title="Cockpit" delay={0} active={currentSlide === 11} />
         <div className="absolute right-0 md:right-48 lg:right-56 bottom-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-auto pointer-events-auto z-10">
          <Parallax intensity={10}>
            <FadeIn delay={0} direction="left" active={currentSlide === 11}>
              <ConfiguratorUI />
            </FadeIn>
          </Parallax>
        </div>
      </Slide>


      {/* ── Chapter 5: The Invitation ── */}
      
      {/* S12: Legacy / Stats Wall */}
      <Slide active={currentSlide === 12}>
        <ChapterBadge chapter={4} title="Masterpiece" delay={0} active={currentSlide === 12} />
        <div className="absolute left-8 md:left-16 top-1/4 max-w-[300px] md:max-w-lg">
          <FadeIn delay={0.2} active={currentSlide === 12}>
            <h2 className={`${syncopate.className} text-xl md:text-2xl text-white font-bold tracking-widest mb-8 md:mb-12 uppercase`}>Technical Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
              <div className="flex flex-col gap-1 border-l border-white/20 pl-4">
                <span className={`${montserrat.className} text-[8px] text-white/50 uppercase tracking-widest`}>Engine</span>
                <span className={`${syncopate.className} text-xs text-white`}>V12, 60°, MPI</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/20 pl-4">
                <span className={`${montserrat.className} text-[8px] text-white/50 uppercase tracking-widest`}>Displacement</span>
                <span className={`${syncopate.className} text-xs text-white`}>6,498 cm³</span>
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

      {/* S13: Inquiry */}
      <Slide active={currentSlide === 13} className="flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[-1]" />
        <FadeIn delay={0.3} active={currentSlide === 13} className="flex flex-col items-center pointer-events-auto">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg"
            alt="Lamborghini Logo"
            className="w-16 h-20 object-contain drop-shadow-2xl brightness-110 mb-8"
          />
          <h2 className={`${playfair.className} text-4xl text-white mb-12`}>Begin the Conversation</h2>
          <div className="flex gap-4">
             <input type="text" placeholder="NAME" className={`bg-transparent border-b border-white/20 px-4 py-2 text-white outline-none focus:border-white transition-colors ${syncopate.className} text-[9px] tracking-widest`} />
             <input type="email" placeholder="EMAIL" className={`bg-transparent border-b border-white/20 px-4 py-2 text-white outline-none focus:border-white transition-colors ${syncopate.className} text-[9px] tracking-widest`} />
          </div>
          <button
            className={`mt-12 border border-white px-16 py-5 ${syncopate.className} font-bold tracking-[0.3em] text-[9px] uppercase text-black bg-white hover:bg-black hover:text-white transition-all duration-500 cursor-pointer`}
          >
            Submit Inquiry
          </button>
        </FadeIn>
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

// ═══════════════════════════════════════════════════════════════════
// Main Page Shell
// ═══════════════════════════════════════════════════════════════════
export default function Home() {
  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden selection:bg-white/20 bg-black touch-none">
      <CinematicLoader />

      <header className="absolute top-0 left-0 w-full p-6 md:p-12 z-50 flex justify-between items-center pointer-events-auto text-white">
        <div className="flex items-center gap-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg"
            alt="Lamborghini Logo"
            className="w-10 h-11 md:w-12 md:h-14 object-contain drop-shadow-2xl brightness-110 cursor-pointer"
            onClick={() => useAppStore.getState().setSlide(0)}
          />
        </div>
        <div className={`hidden md:flex gap-8 ${syncopate.className} text-[9px] font-bold tracking-[0.2em] uppercase opacity-80`}>
          <button className="hover:opacity-100 transition-opacity drop-shadow-lg">Models</button>
          <button className="hover:opacity-100 transition-opacity drop-shadow-lg">Menu</button>
        </div>
      </header>

      <div className="absolute inset-0 z-0 bg-black">
        <Model3D />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <SlideContent />
      </div>

      <InteractionHandler />
    </main>
  );
}
