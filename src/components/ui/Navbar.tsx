"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Syncopate, Montserrat } from "next/font/google";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { globalAudioCtx, playGlobalMusic, pauseGlobalMusic } from "@/components/ui/AudioEngine";
import { motion, AnimatePresence } from "framer-motion";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitHoverButton } from "@/components/ui/SplitHoverButton";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["200", "300", "400", "500"], subsets: ["latin"] });

const OTHER_MODELS = [
  { name: "REVUELTO", type: "V12 Hybrid", img: "https://www.lamborghini.com/sites/it-en/files/DAM/lamborghini/facelift_2019/models_gw/2023/03_29_revuelto/gate_models_s_02_m.jpg" },
  { name: "URUS SE", type: "Super SUV", img: "https://www.lamborghini.com/sites/it-en/files/DAM/lamborghini/facelift_2019/models_gw/2024/04_24_urus_se/gate_models_s_03_m.jpg" },
  { name: "HURACÁN", type: "V10", img: "https://www.lamborghini.com/sites/it-en/files/DAM/lamborghini/facelift_2019/models_gw/2023/11_20_huracan_stj/gate_models_s_04_m.jpg" },
];

const MENU_LINKS = ["CUSTOMIZATION", "OWNERSHIP", "MOTORSPORT", "DEALERSHIPS", "STORE"];

export function Navbar() {
  const { toggleAudio, isAudioEnabled, setSlide, isThermalMode, toggleThermalMode, isPolarized, togglePolarized } = useAppStore();
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="absolute top-0 left-0 w-full p-6 md:p-12 z-[100] flex justify-between items-center pointer-events-auto text-white transform-gpu">
        <div className="flex items-center gap-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg"
            alt="Lamborghini Logo"
            className="w-8 h-9 md:w-12 md:h-14 object-contain drop-shadow-2xl brightness-110 cursor-pointer"
            onClick={() => {
              setSlide(0);
              setIsModelsOpen(false);
              setIsMenuOpen(false);
            }}
          />
        </div>

        <div className={`flex flex-wrap justify-end gap-3 md:gap-8 ${syncopate.className} text-[6.5px] md:text-[9px] font-bold tracking-[0.2em] uppercase opacity-80 mix-blend-difference`}>
          <MagneticButton className="hidden md:block">
            <SplitHoverButton 
              primaryText={isPolarized ? "POLARIZED" : "LENS"}
              secondaryText={isPolarized ? "OFF" : "ON"}
              onClick={() => togglePolarized()}
              className={isPolarized ? "text-[#00d4ff]" : ""}
            />
          </MagneticButton>
          <MagneticButton className="hidden md:block">
            <SplitHoverButton 
              primaryText={isThermalMode ? "THERMAL" : "VISION"}
              secondaryText={isThermalMode ? "OFF" : "ON"}
              onClick={() => toggleThermalMode()}
              className={isThermalMode ? "text-[#ff3300]" : ""}
            />
          </MagneticButton>

          <MagneticButton>
            <SplitHoverButton 
              primaryText={isAudioEnabled ? "SOUND ON" : "SOUND OFF"}
              secondaryText={isAudioEnabled ? "MUTE" : "PLAY"}
              onClick={() => {
                toggleAudio();
                if (globalAudioCtx && globalAudioCtx.state === "suspended") {
                  globalAudioCtx.resume();
                }
                if (!isAudioEnabled) {
                  playGlobalMusic();
                } else {
                  pauseGlobalMusic();
                }
              }}
            />
          </MagneticButton>

          <MagneticButton className="hidden md:block">
            <SplitHoverButton 
              primaryText="MODELS"
              secondaryText="VIEW ALL"
              onClick={() => {
                setIsModelsOpen(!isModelsOpen);
                setIsMenuOpen(false);
              }}
              className={isModelsOpen ? "text-[#b59b4c]" : ""}
            />
          </MagneticButton>

          <MagneticButton>
            <SplitHoverButton 
              primaryText={isMenuOpen ? "CLOSE" : "MENU"}
              secondaryText={isMenuOpen ? "BACK" : "OPEN"}
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsModelsOpen(false);
              }}
              className={isMenuOpen ? "text-[#b59b4c]" : ""}
            />
          </MagneticButton>
        </div>
      </header>

      {/* ── Models Mega-Menu ── */}
      <AnimatePresence>
        {isModelsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed top-0 left-0 w-full pt-32 pb-16 px-6 md:px-16 bg-black/90 backdrop-blur-2xl z-[90] pointer-events-auto border-b border-white/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {OTHER_MODELS.map((model, idx) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1, duration: 0.5 }}
                  className="group cursor-pointer relative overflow-hidden flex flex-col items-center border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-full h-40 overflow-hidden">
                    <img src={model.img} alt={model.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  </div>
                  <div className="p-6 text-center w-full">
                    <h4 className={`${syncopate.className} text-white font-bold tracking-widest text-lg`}>{model.name}</h4>
                    <p className={`${montserrat.className} text-[#ff3333] text-xs uppercase tracking-[0.3em] mt-2`}>{model.type}</p>
                  </div>
                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,51,51,0.15)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-Screen Menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[90] pointer-events-auto flex items-center justify-center"
          >
            <div className="flex flex-col gap-6 items-center">
              {MENU_LINKS.map((link, idx) => (
                <MagneticButton key={link} strength={10}>
                  <div className="cursor-pointer group overflow-hidden px-4 py-2">
                    <ScrambleText
                      text={link}
                      className={`${syncopate.className} text-2xl md:text-6xl text-white/50 group-hover:text-white font-bold tracking-[0.1em] transition-colors inline-block`}
                      hoverMode={true}
                    />
                  </div>
                </MagneticButton>
              ))}
            </div>
            {/* Ambient Background Glow for Menu */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-[#ff3333]/10 rounded-full blur-[100px] pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
