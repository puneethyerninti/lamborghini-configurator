"use client";
import React from "react";
import { useAppStore } from "@/store/useAppStore";

const COLORS = [
  { name: "Bianco Isis", hex: "#ffffff" },
  { name: "Rosso Mars", hex: "#a10a0a" },
  { name: "Verde Mantis", hex: "#15b026" },
  { name: "Viola Pasifae", hex: "#4b1385" },
  { name: "Giallo Orion", hex: "#d8c400" },
  { name: "Blu Nila", hex: "#0b2585" },
  { name: "Arancio Argos", hex: "#e04e0b" },
  { name: "Grigio Estoque", hex: "#4a4a4a" },
  { name: "Nero Nemesis", hex: "#111111" },
  { name: "Oro Elios", hex: "#b59b4c" }
];

export function ConfiguratorUI() {
  const { carColor, setCarColor } = useAppStore();

  return (
    <div className="flex flex-col gap-6 pointer-events-auto items-end max-h-[60vh] pr-4" style={{ overflowY: 'auto', scrollbarWidth: 'none' }}>
      <div className="text-right mb-4">
        <h3 className="text-[10px] font-sans tracking-[0.3em] text-white/50 mb-2 uppercase">The Atelier</h3>
        <h2 className="text-5xl font-serif text-white">Bespoke Exterior</h2>
      </div>
      
      <div className="flex flex-col gap-5">
        {COLORS.map((color) => (
          <button
            key={color.hex}
            onClick={() => setCarColor(color.hex)}
            className="group flex items-center justify-end gap-6"
          >
            <span className={`text-xs font-sans tracking-widest uppercase transition-colors ${
              carColor === color.hex ? "text-white font-bold" : "text-white/40 group-hover:text-white/80"
            }`}>
              {color.name}
            </span>
            <div className={`w-8 h-8 rounded-full border transition-all ${
              carColor === color.hex ? "border-white p-1" : "border-transparent p-0 group-hover:border-white/50"
            }`}>
              <div className="w-full h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{ backgroundColor: color.hex }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
