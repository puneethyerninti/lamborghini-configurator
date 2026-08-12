"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { syncopate, montserrat } from "@/fonts";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HoverBorderButton } from "@/components/ui/HoverBorderButton";




const COLORS = [
  { name: "Bianco Isis", hex: "#ffffff", type: "Solid" },
  { name: "Rosso Mars", hex: "#a10a0a", type: "Metallic" },
  { name: "Verde Mantis", hex: "#15b026", type: "Pearl" },
  { name: "Viola Pasifae", hex: "#4b1385", type: "Pearl" },
  { name: "Giallo Orion", hex: "#d8c400", type: "Pearl" },
  { name: "Blu Nila", hex: "#0b2585", type: "Metallic" },
  { name: "Arancio Argos", hex: "#e04e0b", type: "Pearl" },
  { name: "Grigio Estoque", hex: "#4a4a4a", type: "Metallic" },
  { name: "Nero Nemesis", hex: "#111111", type: "Matte" },
  { name: "Oro Elios", hex: "#b59b4c", type: "Metallic" }
];

const WHEELS = [
  { id: 0, name: "Leirion Forged 20/21\"", finish: "Bronze" },
  { id: 1, name: "Nireo Forged 20/21\"", finish: "Titanium" },
  { id: 2, name: "Dianthus Forged 20/21\"", finish: "Gloss Black" },
];

const INTERIORS = [
  { id: 'nero', name: "Nero Cosmus", material: "AlcantaraÂ®", accent: "Rosso" },
  { id: 'bianco', name: "Bianco Polar", material: "Leather", accent: "Nero" },
  { id: 'arancio', name: "Arancio Leonis", material: "AlcantaraÂ®", accent: "Nero" },
];

const PACKAGES = [
  { id: 'standard', name: "Base Specification", price: "Included" },
  { id: 'magnolia', name: "Ad Personam Exterior", price: "+ $14,500" },
  { id: 'svj63', name: "SVJ 63 Edition Livery", price: "+ $35,000" },
];

const ENVIRONMENTS = [
  { id: 'studio', name: "Studio Lighting", desc: "Classic neutral reflections" },
  { id: 'night', name: "Midnight Track", desc: "Aggressive dark ambiance" },
  { id: 'city', name: "Urban Neon", desc: "High contrast colors" },
];

export function ConfiguratorUI() {
  const {
    carColor, setCarColor,
    wheelStyle, setWheelStyle,
    interiorTheme, setInteriorTheme,
    packageTier, setPackageTier,
    environment, setEnvironment,
    configuratorTab, setConfiguratorTab,
    xrayMode, setXrayMode,
    timeOfDay, setTimeOfDay
  } = useAppStore();

  return (
    <div
      className="flex flex-col gap-4 md:gap-6 pointer-events-auto items-start md:items-end max-h-[40vh] md:max-h-[70vh] pb-12 md:pb-6 w-full max-w-full md:max-w-[350px] bg-black/80 md:bg-black/60 backdrop-blur-2xl border-t md:border p-4 md:p-6 md:rounded-none mt-auto transition-all duration-700"
      style={{
        boxShadow: `0 10px 40px ${carColor}44, inset 0 0 20px ${carColor}11`,
        borderColor: `${carColor}55`
      }}
      onWheel={(e) => e.stopPropagation()}
    >

      <div className="text-right w-full border-b border-[#b59b4c]/30 pb-4 mb-2 flex justify-between items-end">
        <button
          onPointerDown={() => setXrayMode(true)}
          onPointerUp={() => setXrayMode(false)}
          onPointerLeave={() => setXrayMode(false)}
          className={`px-3 py-1 border ${xrayMode ? 'bg-[#00d4ff] text-black border-[#00d4ff]' : 'bg-transparent text-[#00d4ff] border-[#00d4ff]/50'} ${syncopate.className} text-[8px] tracking-widest uppercase transition-colors`}
        >
          X-Ray Scan
        </button>
        <div>
          <h3 className={`${syncopate.className} text-[8px] tracking-[0.4em] text-[#b59b4c] mb-2 uppercase font-bold`}>Ad Personam</h3>
          <h2 className={`${syncopate.className} text-2xl text-white tracking-widest`}>ATELIER</h2>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-4 w-full justify-start md:justify-between mb-4 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] whitespace-nowrap"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {(["exterior", "wheels", "interior", "backdrop", "summary"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setConfiguratorTab(tab)}
            className={`pb-2 text-[9px] uppercase tracking-[0.2em] font-bold transition-all snap-start shrink-0 ${configuratorTab === tab
              ? "text-white border-b border-[#b59b4c]"
              : "text-white/40 border-b border-transparent hover:text-white/80 hover:border-white/20"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div
        className="w-full overflow-y-auto pr-2 flex flex-col gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-8"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >

        {/* Exterior Tab */}
        {configuratorTab === "exterior" && (
          <div className="flex flex-col gap-6 animate-fadein">
            {/* Packages */}
            <div className="flex flex-col gap-2 mb-4">
              <span className={`${montserrat.className} text-[9px] text-[#b59b4c]/70 uppercase tracking-widest mb-1`}>Livery Package</span>
              {PACKAGES.map((pkg) => (
                <MagneticButton key={pkg.id} strength={10} className="w-full">
                  <HoverBorderButton
                    onClick={() => setPackageTier(pkg.id as any)}
                    active={packageTier === pkg.id}
                    color={carColor}
                    className="w-full p-3"
                  >
                    <div className="flex justify-between items-center relative z-10 w-full">
                      <span className={`${syncopate.className} text-[9px] text-white`}>{pkg.name}</span>
                    </div>
                    <span className={`${montserrat.className} text-[8px] text-white/50 mt-1 block relative z-10`}>{pkg.price}</span>
                  </HoverBorderButton>
                </MagneticButton>
              ))}
            </div>

            {/* Colors */}
            <span className={`${montserrat.className} text-[9px] text-[#b59b4c]/70 uppercase tracking-widest mb-1`}>Paintwork</span>
            <div className="grid grid-cols-2 gap-3">
              {COLORS.map((color) => (
                <MagneticButton key={color.hex} strength={15} className="w-full">
                  <HoverBorderButton
                    onClick={() => setCarColor(color.hex)}
                    active={carColor === color.hex}
                    color={color.hex}
                    className="w-full flex flex-col items-center gap-3 p-3"
                  >
                    <div className={`relative z-10 w-10 h-10 rounded-full border transition-all mx-auto ${carColor === color.hex ? "p-1 shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "border-transparent p-0"
                      }`}
                      style={{ borderColor: carColor === color.hex ? color.hex : 'transparent' }}
                    >
                      <div className="w-full h-full rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color.hex }} />
                    </div>
                    <div className="text-center relative z-10 w-full">
                      <span className={`${syncopate.className} text-[8px] uppercase text-white block truncate w-full`}>
                        {color.name}
                      </span>
                      <span className={`${montserrat.className} text-[7px] text-white/40`}>{color.type}</span>
                    </div>
                  </HoverBorderButton>
                </MagneticButton>
              ))}
            </div>
          </div>
        )}

        {/* Wheels Tab */}
        {configuratorTab === "wheels" && (
          <div className="flex flex-col gap-3 animate-fadein">
            <span className={`${montserrat.className} text-[9px] text-[#b59b4c]/70 uppercase tracking-widest mb-2`}>Wheel Design</span>
            {WHEELS.map((wheel) => (
              <HoverBorderButton
                key={wheel.id}
                onClick={() => setWheelStyle(wheel.id as any)}
                active={wheelStyle === wheel.id}
                color={carColor}
                className="p-4"
              >
                <span className={`${syncopate.className} text-[10px] text-white block mb-1`}>{wheel.name}</span>
                <span className={`${montserrat.className} text-[9px] text-white/60 block`}>Finish: {wheel.finish}</span>
              </HoverBorderButton>
            ))}
          </div>
        )}

        {/* Interior Tab */}
        {configuratorTab === "interior" && (
          <div className="flex flex-col gap-3 animate-fadein">
            <span className={`${montserrat.className} text-[9px] text-[#b59b4c]/70 uppercase tracking-widest mb-2`}>Cabin Trim</span>
            {INTERIORS.map((int) => (
              <HoverBorderButton
                key={int.id}
                onClick={() => setInteriorTheme(int.id as any)}
                active={interiorTheme === int.id}
                color={carColor}
                className="p-4"
              >
                <span className={`${syncopate.className} text-[10px] text-white block mb-1`}>{int.name}</span>
                <div className="flex gap-4 mt-2">
                  <span className={`${montserrat.className} text-[8px] text-white/60 block`}>Mat: {int.material}</span>
                  <span className={`${montserrat.className} text-[8px] text-[#b59b4c] block`}>Accent: {int.accent}</span>
                </div>
              </HoverBorderButton>
            ))}

            <button
              onClick={() => useAppStore.getState().toggleInteriorMode()}
              className={`mt-4 border border-[#b59b4c] px-8 py-4 ${syncopate.className} text-[9px] font-bold tracking-[0.3em] uppercase text-[#b59b4c] hover:bg-[#b59b4c] hover:text-black transition-colors w-full`}
            >
              Enter Cockpit View
            </button>
          </div>
        )}

        {/* Backdrop Tab */}
        {configuratorTab === "backdrop" && (
          <div className="flex flex-col gap-3 animate-fadein">
            <span className={`${montserrat.className} text-[9px] text-[#b59b4c]/70 uppercase tracking-widest mb-2`}>Environment</span>
            {ENVIRONMENTS.map((env) => (
              <HoverBorderButton
                key={env.id}
                onClick={() => setEnvironment(env.id as any)}
                active={environment === env.id}
                color={carColor}
                className="p-4"
              >
                <span className={`${syncopate.className} text-[10px] text-white block mb-1`}>{env.name}</span>
                <span className={`${montserrat.className} text-[9px] text-white/60 block`}>{env.desc}</span>
              </HoverBorderButton>
            ))}

            <div className="mt-4 border-t border-white/10 pt-4">
              <span className={`${montserrat.className} text-[9px] text-[#b59b4c]/70 uppercase tracking-widest block mb-4`}>Time of Day</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                className="w-full accent-[#b59b4c]"
              />
              <div className="flex justify-between mt-2">
                <span className={`${montserrat.className} text-[8px] text-white/40 uppercase`}>Midnight</span>
                <span className={`${montserrat.className} text-[8px] text-white/40 uppercase`}>Noon</span>
                <span className={`${montserrat.className} text-[8px] text-white/40 uppercase`}>Sunset</span>
              </div>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {configuratorTab === "summary" && (
          <div className="flex flex-col gap-4 animate-fadein">
            <div className="border border-[#b59b4c]/30 p-4 bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#b59b4c] opacity-50" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#b59b4c] opacity-50" />

              <h4 className={`${syncopate.className} text-[10px] text-[#b59b4c] mb-4 uppercase font-bold tracking-widest`}>Configuration</h4>

              <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                <span className={`${montserrat.className} text-[9px] text-white/50 uppercase`}>Exterior</span>
                <span className={`${montserrat.className} text-[9px] text-white`}>{COLORS.find(c => c.hex === carColor)?.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                <span className={`${montserrat.className} text-[9px] text-white/50 uppercase`}>Wheels</span>
                <span className={`${montserrat.className} text-[9px] text-white`}>{WHEELS.find(w => w.id === wheelStyle)?.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                <span className={`${montserrat.className} text-[9px] text-white/50 uppercase`}>Interior</span>
                <span className={`${montserrat.className} text-[9px] text-white`}>{INTERIORS.find(i => i.id === interiorTheme)?.name}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className={`${syncopate.className} text-[10px] text-white uppercase`}>Est. Total</span>
                <span className={`${syncopate.className} text-[10px] text-[#b59b4c]`}>
                  ${packageTier === 'svj63' ? '552,500' : packageTier === 'magnolia' ? '532,000' : '517,500'}
                </span>
              </div>
            </div>

            <button className={`w-full border border-white py-4 ${syncopate.className} text-[9px] font-bold tracking-[0.2em] uppercase text-black bg-white hover:bg-black hover:text-white transition-colors`}>
              Generate Share Link
            </button>
            <button className={`w-full border border-white/20 py-4 ${syncopate.className} text-[9px] font-bold tracking-[0.2em] uppercase text-white hover:bg-white/10 transition-colors`}>
              Save to PDF
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
