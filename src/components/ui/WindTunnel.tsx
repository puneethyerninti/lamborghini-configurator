"use client";
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from "@/store/useAppStore";

export function WindTunnel() {
  const currentSlide = useAppStore((s) => s.currentSlide);
  const active = currentSlide === 2;
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const lineCount = 800;
  const lineLength = 3.0; // The length of the aerodynamic streak
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(lineCount * 2 * 3);
    const spd = new Float32Array(lineCount);
    
    for (let i = 0; i < lineCount; i++) {
      // Spread across the aerodynamic wind tunnel volume
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() * 5);
      const z = (Math.random() - 0.5) * 40;
      
      // Start vertex
      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;
      
      // End vertex (trailing behind to form a line)
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z + lineLength;
      
      spd[i] = Math.random() * 0.8 + 0.5; // Kinetic speed
    }
    
    return [pos, spd];
  }, [lineCount]);

  const opacityRef = useRef(0);

  useFrame((state, delta) => {
    if (!linesRef.current) return;
    
    // Smooth cinematic fade
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, active ? 1 : 0, delta * 3);
    const material = linesRef.current.material as THREE.LineBasicMaterial;
    material.opacity = opacityRef.current;
    
    if (opacityRef.current < 0.01) return; // Optimization

    const pos = linesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < lineCount; i++) {
      // Wind blowing backwards over the car
      const velocity = speeds[i] * delta * 80;
      
      pos[i * 6 + 2] += velocity;
      pos[i * 6 + 5] += velocity;
      
      // Reset to front of tunnel
      if (pos[i * 6 + 2] > 20) {
        pos[i * 6 + 2] = -20;
        pos[i * 6 + 5] = -20 + lineLength;
      }
    }
    
    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={lineCount * 2} />
      </bufferGeometry>
      {/* High-tech clinical blue aerodynamic laser streaks */}
      <lineBasicMaterial 
        color="#38bdf8" 
        transparent 
        opacity={0} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
        linewidth={1}
      />
    </lineSegments>
  );
}
