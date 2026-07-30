"use client";

import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Center, CameraControls, ContactShadows, Sparkles, Grid } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";
import { WindTunnel } from "@/components/ui/WindTunnel";

const MODEL_PATH = "/lamborghini_aventador.glb";
const PREMIUM_FONT = "https://fonts.gstatic.com/s/syncopate/v12/pe0sMIuPIYBCpEV5eFdK.woff";

// 3D Typography removed in favor of 2D Graphic Design Architecture

function CinematicLighting() {
  const currentSlide = useAppStore((s) => s.currentSlide);
  const lightRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    if (lightRef.current && currentSlide !== 0) {
      const t = state.clock.elapsedTime;
      lightRef.current.position.x = Math.sin(t * 0.5) * 15;
      lightRef.current.position.z = Math.cos(t * 0.3) * 10;
    }
  });

  return (
    <>
      <ambientLight intensity={currentSlide === 0 ? 0.05 : 0.15} />
      {/* LOCKED ENVIRONMENT: Prevents massive WebGL stutter on scroll! */}
      <Environment preset="studio" />

      {/* Dramatic Hero Spotlight - Warm Champagne Gallery Lighting */}
      <spotLight
        ref={lightRef}
        position={currentSlide === 0 ? [0, 8, 4] : [10, 10, -10]}
        angle={currentSlide === 0 ? 0.6 : 0.4}
        penumbra={1}
        intensity={currentSlide === 0 ? 80 : 20}
        color={currentSlide === 0 ? "#fff5e6" : "#ffffff"}
        castShadow
      />

      {/* PERMANENTLY MOUNTED LIGHTS: Never unmount lights or set to exactly 0, as it forces WebGL to recompile all shaders! */}
      <spotLight position={[-10, 5, 10]} angle={0.5} penumbra={0.8} intensity={currentSlide !== 0 ? 5 : 0.001} color="#ffffff" />
      <spotLight position={[0, 10, 0]} angle={0.8} penumbra={1} intensity={currentSlide !== 0 ? 2 : 0.001} color="#ff0000" />
    </>
  );
}

function Model() {
  const { scene } = useGLTF(MODEL_PATH);
  const carColor = useAppStore((s) => s.carColor);
  const isInteriorMode = useAppStore((s) => s.isInteriorMode);
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(new THREE.Quaternion());
  const currentRotation = useRef(new THREE.Quaternion());

  useEffect(() => {
    let applied = false;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const name = mat.name.toLowerCase();

          if (name.includes("paint") || name.includes("body") || name.includes("shell") || name.includes("carpaint") || name.includes("col")) {
            mat.color.set(carColor);
            mat.roughness = 0.15;
            mat.metalness = 0.85;
            applied = true;
          }
        }
      }
    });

    if (!applied) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            const name = mat.name.toLowerCase();
            if (!name.includes("glass") && !name.includes("window") && !name.includes("tire") && !name.includes("rubber") && !name.includes("black") && !name.includes("dark")) {
              mat.color.set(carColor);
              mat.roughness = 0.15;
              mat.metalness = 0.85;
            }
          }
        }
      });
    }
  }, [scene, carColor]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // READ STATE NON-REACTIVELY: This prevents the massive <Center> bounding box recalculation stutter!
    const currentSlide = useAppStore.getState().currentSlide;

    if (isInteriorMode) {
      targetRotation.current.identity();
      currentRotation.current.slerp(targetRotation.current, delta * 4);
      groupRef.current.quaternion.copy(currentRotation.current);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 4);
      return;
    }

    let targetY = 0;
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');

    switch (currentSlide) {
      case 0:
        // Slow continuous breathing for hero section
        targetY = Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
        break;
      case 2:
      case 3:
      case 6:
        targetY = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
        break;
      default:
        targetY = 0;
        break;
    }

    targetRotation.current.setFromEuler(euler);
    currentRotation.current.slerp(targetRotation.current, delta * 3);
    groupRef.current.quaternion.copy(currentRotation.current);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 3);
  });

  return (
    <group ref={groupRef} dispose={null}>
      <Center top position={[0, 0, 0]}>
        <primitive object={scene} scale={1.2} />
      </Center>
    </group>
  );
}

function HeroEnvironment() {
  const currentSlide = useAppStore((s) => s.currentSlide);
  const isInteriorMode = useAppStore((s) => s.isInteriorMode);

  // PERMANENTLY MOUNTED: Never unmount heavy geometry. Hide it instead.
  // The gallery is now a pure, pristine dark void. No distracting grids or sparkles.
  return (
    <group position={[0, -0.01, 0]} visible={currentSlide === 0 && !isInteriorMode}>
    </group>
  );
}

function SceneCamera() {
  const controlsRef = useRef<any>(null);
  const currentSlide = useAppStore((s) => s.currentSlide);
  const isInteriorMode = useAppStore((s) => s.isInteriorMode);
  const isEngineRevved = useAppStore((s) => s.isEngineRevved);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    // Continuous slow orbit for Hero slide
    if (currentSlide === 0 && !isInteriorMode) {
      controlsRef.current.azimuthAngle -= delta * 0.05;
    }

    if (isEngineRevved) {
      const shakeX = (Math.random() - 0.5) * 0.05;
      const shakeY = (Math.random() - 0.5) * 0.05;
      controlsRef.current.camera.position.x += shakeX;
      controlsRef.current.camera.position.y += shakeY;
    }
  });

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (isInteriorMode) {
      controls.setLookAt(0.35, 0.8, -0.2, 0.35, 0.8, -2, true);
      return;
    }

    switch (currentSlide) {
      case 0:
        // Slow continuous orbit starting from wide cinematic angle
        controls.setLookAt(-5, 2, 7, 0, 0.5, 0, true);
        break;
      case 1:
        controls.setLookAt(-8, 2, 0, 0, 0.5, 0, true);
        break;
      case 2:
        controls.setLookAt(0, 0.2, 9, 0, 0.5, 0, true);
        break;
      case 3:
        controls.setLookAt(6, 4, -6, 0, 0.5, 0, true);
        break;
      case 4:
        controls.setLookAt(2, 8, 4, 0, 0.5, 0, true);
        break;
      case 5:
        controls.setLookAt(-5, 1, -2, 0, 0.5, 0, true);
        break;
      case 6:
        controls.setLookAt(-4, 0.5, 4, 0, 0.5, 0, true);
        break;
      case 7:
        controls.setLookAt(7, 1.5, -4, 0, 0.5, 0, true);
        break;
    }
  }, [currentSlide, isInteriorMode]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={isInteriorMode ? 0.01 : 3}
      maxDistance={15}
      maxPolarAngle={Math.PI / 2 - 0.02}
      dollySpeed={0.5}
      smoothTime={0.5}
    />
  );
}

export function Model3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0.4, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, toneMappingExposure: 1.0, powerPreference: "high-performance" }}>
        <color attach="background" args={['#020202']} />

        <CinematicLighting />

        <Suspense fallback={null}>
          <HeroEnvironment />
          <Model />
          <WindTunnel />

          {/* Ultra-Fast performance shadow catcher floor (baked to 1 frame!) */}
          <ContactShadows frames={1} resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000000" />
          {/* Floor mesh removed to keep the background infinitely dark and prevent washing out the UI */}
        </Suspense>

        <SceneCamera />
      </Canvas>
    </div>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_PATH);
}
