"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Syncopate, Montserrat } from "next/font/google";

const syncopate = Syncopate({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["300", "400"], subsets: ["latin"] });

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
  { id: 'nero', name: "Nero Cosmus", material: "Alcantara®", accent: "Rosso" },
  { id: 'bianco', name: "Bianco Polar", material: "Leather", accent: "Nero" },
  { id: 'arancio', name: "Arancio Leonis", material: "Alcantara®", accent: "Nero" },
];

const PACKAGES = [
  { id: 'standard', name: "Base Specification", price: "Included" },
  { id: 'magnolia', name: "Ad Personam Exterior", price: "+ $14,500" },
  { id: 'svj63', name: "SVJ 63 Edition Livery", price: "+ $35,000" },
];

export function ConfiguratorUI() {
  const { 
    carColor, setCarColor, 
    wheelStyle, setWheelStyle,
    interiorTheme, setInteriorTheme,
    packageTier, setPackageTier
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<"exterior" | "wheels" | "interior">("exterior");

  return (
    <div className="flex flex-col gap-6 pointer-events-auto items-end max-h-[50vh] md:max-h-[70vh] w-full max-w-full md:max-w-[350px] bg-black/80 md:bg-black/40 backdrop-blur-xl border-t md:border border-white/10 p-6 md:rounded-none mt-auto">
      
      {/* Header */}
      <div className="text-right w-full border-b border-white/10 pb-4 mb-2">
        <h3 className={`${syncopate.className} text-[8px] tracking-[0.4em] text-[#ff3333] mb-2 uppercase font-bold`}>Ad Personam</h3>
        <h2 className={`${syncopate.className} text-2xl text-white tracking-widest`}>ATELIER</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 w-full justify-between mb-4">
        {(["exterior", "wheels", "interior"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-[9px] uppercase tracking-[0.2em] font-bold transition-all ${
              activeTab === tab 
                ? "text-white border-b border-white" 
                : "text-white/40 border-b border-transparent hover:text-white/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Scrollable Content */}
      <div className="w-full overflow-y-auto pr-2 flex flex-col gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Exterior Tab */}
        {activeTab === "exterior" && (
          <div className="flex flex-col gap-6 animate-fadein">
            {/* Packages */}
            <div className="flex flex-col gap-2 mb-4">
              <span className={`${montserrat.className} text-[9px] text-white/50 uppercase tracking-widest mb-1`}>Livery Package</span>
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setPackageTier(pkg.id as any)}
                  className={`text-left p-3 border transition-all ${
                    packageTier === pkg.id 
                      ? "border-white bg-white/10" 
                      : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`${syncopate.className} text-[9px] text-white`}>{pkg.name}</span>
                  </div>
                  <span className={`${montserrat.className} text-[8px] text-white/50 mt-1 block`}>{pkg.price}</span>
                </button>
              ))}
            </div>

            {/* Colors */}
            <span className={`${montserrat.className} text-[9px] text-white/50 uppercase tracking-widest mb-1`}>Paintwork</span>
            <div className="grid grid-cols-2 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setCarColor(color.hex)}
                  className="group flex flex-col items-center gap-3 p-3 border border-white/5 hover:bg-white/5 transition-all"
                >
                  <div className={`w-10 h-10 rounded-full border transition-all ${
                    carColor === color.hex ? "border-white p-1" : "border-transparent p-0"
                  }`}>
                    <div className="w-full h-full rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color.hex }} />
                  </div>
                  <div className="text-center">
                    <span className={`${syncopate.className} text-[8px] uppercase text-white block truncate w-full max-w-[100px]`}>
                      {color.name}
                    </span>
                    <span className={`${montserrat.className} text-[7px] text-white/40`}>{color.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wheels Tab */}
        {activeTab === "wheels" && (
          <div className="flex flex-col gap-3 animate-fadein">
             <span className={`${montserrat.className} text-[9px] text-white/50 uppercase tracking-widest mb-2`}>Wheel Design</span>
             {WHEELS.map((wheel) => (
                <button
                  key={wheel.id}
                  onClick={() => setWheelStyle(wheel.id as any)}
                  className={`text-left p-4 border transition-all ${
                    wheelStyle === wheel.id 
                      ? "border-[#ff3333] bg-[#ff3333]/10" 
                      : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <span className={`${syncopate.className} text-[10px] text-white block mb-1`}>{wheel.name}</span>
                  <span className={`${montserrat.className} text-[9px] text-white/60 block`}>Finish: {wheel.finish}</span>
                </button>
              ))}
          </div>
        )}

        {/* Interior Tab */}
        {activeTab === "interior" && (
          <div className="flex flex-col gap-3 animate-fadein">
             <span className={`${montserrat.className} text-[9px] text-white/50 uppercase tracking-widest mb-2`}>Cabin Trim</span>
             {INTERIORS.map((int) => (
                <button
                  key={int.id}
                  onClick={() => setInteriorTheme(int.id as any)}
                  className={`text-left p-4 border transition-all ${
                    interiorTheme === int.id 
                      ? "border-white bg-white/10" 
                      : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <span className={`${syncopate.className} text-[10px] text-white block mb-1`}>{int.name}</span>
                  <div className="flex gap-4 mt-2">
                    <span className={`${montserrat.className} text-[8px] text-white/60 block`}>Mat: {int.material}</span>
                    <span className={`${montserrat.className} text-[8px] text-[#ff3333] block`}>Accent: {int.accent}</span>
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => useAppStore.getState().toggleInteriorMode()}
                className={`mt-4 border border-white/20 px-8 py-4 ${syncopate.className} text-[9px] font-bold tracking-[0.3em] uppercase text-white hover:bg-white hover:text-black transition-colors w-full`}
              >
                Enter Cockpit View
              </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
