"use client";

import React, { useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAppStore } from "@/store/useAppStore";
import { syncopate, montserrat } from "@/fonts";
import * as THREE from "three";




const HOTSPOTS = [
  { id: "engine", pos: [0, 1.2, 1.8] as [number, number, number], title: "V12 Powertrain", desc: "770 CV naturally aspirated engine." },
  { id: "aero", pos: [0, 0.4, -2.5] as [number, number, number], title: "ALA 2.0", desc: "Active aero-vectoring splitter." },
  { id: "wheel", pos: [1.1, 0.4, -1.8] as [number, number, number], title: "Forged Rims", desc: "Lightweight center-lock wheels." },
];

export function Hotspots() {
  const currentSlide = useAppStore((s) => s.currentSlide);
  const active = currentSlide === 11; // Active only on Specs wall
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(0);

  useFrame((_, delta) => {
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, active ? 1 : 0, delta * 3);
    if (groupRef.current) {
      groupRef.current.visible = opacityRef.current > 0.05;
    }
  });

  if (!active && opacityRef.current < 0.05) return null;

  return (
    <group ref={groupRef}>
      {HOTSPOTS.map((spot) => (
        <group key={spot.id} position={spot.pos}>
          {/* Glowing pulse ring */}
          <mesh>
            <circleGeometry args={[0.08, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.04, 32]} />
            <meshBasicMaterial color="#ff3333" />
          </mesh>
          
          <Html distanceFactor={10} zIndexRange={[100, 0]}>
            <div 
              className="flex flex-col gap-1 -translate-x-1/2 translate-y-4 pointer-events-none transition-opacity duration-300"
              style={{ opacity: opacityRef.current }}
            >
              <div className="w-[1px] h-8 bg-[#ff3333] ml-auto mr-auto mb-2 opacity-50" />
              <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 w-48 rounded-sm">
                <span className={`${syncopate.className} text-[8px] font-bold tracking-widest text-[#ff3333] uppercase block mb-1`}>
                  {spot.title}
                </span>
                <span className={`${montserrat.className} text-[10px] text-white/70 block leading-tight`}>
                  {spot.desc}
                </span>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
