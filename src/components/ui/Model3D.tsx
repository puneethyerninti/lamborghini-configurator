"use client";

import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Center, CameraControls, ContactShadows, MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";
import { Hotspots } from "./Hotspots";

const MODEL_PATH = "/lamborghini_light.glb";

// ─── Pre-allocated vectors (zero GC pressure) ───
const _targetLightPos = new THREE.Vector3();
const _orbitLightPos = new THREE.Vector3();
const _eulerReset = new THREE.Euler(0, 0, 0, "YXZ");

// ─── Cinematic Camera Presets (14 slides) ───
// pos: [x,y,z], target: [x,y,z], fov: number, duration: number, easeType: string
const CINEMATIC_PRESETS: Record<number, { pos: number[], target: number[], fov: number, dur: number, ease: string }> = {
  // Chapter 1: The Bull
  0: { pos: [4, 1, 6], target: [0, 0.5, 0], fov: 45, dur: 2.0, ease: 'power3.inOut' }, // Hero - dramatic angle
  1: { pos: [-8, 2, -2], target: [0, 0.4, 0], fov: 38, dur: 2.5, ease: 'power2.out' }, // Heritage - sweeping side view
  2: { pos: [0, 0.2, 8], target: [0, 0.5, 0], fov: 40, dur: 2.0, ease: 'power2.inOut' }, // Philosophy - low front

  // Chapter 2: Engineering
  3: { pos: [5, 4, -5], target: [0, 0.6, 0], fov: 50, dur: 1.8, ease: 'back.out(1.2)' }, // LDVA - high rear quarter
  4: { pos: [-6, 1.5, 4], target: [0, 0.5, 0], fov: 45, dur: 1.5, ease: 'power3.inOut' }, // Aero - wind tunnel view
  5: { pos: [0, 2.5, 4], target: [0, 1.2, 0], fov: 30, dur: 3.0, ease: 'power4.out' }, // V12 Heart - tight engine zoom
  6: { pos: [-4, 3, 5], target: [0, 0.5, 0], fov: 45, dur: 2.0, ease: 'power2.inOut' }, // Carbon - top down angle

  // Chapter 3: Performance
  7: { pos: [-6, 0.2, 6], target: [0, 0.4, 0], fov: 35, dur: 1.2, ease: 'power4.inOut' }, // Acceleration - low aggressive
  8: { pos: [7, 0.5, -4], target: [0, 0.5, 0], fov: 45, dur: 1.5, ease: 'power3.out' }, // Top Speed - rear motion
  9: { pos: [0, 6, 0.1], target: [0, 0, 0], fov: 60, dur: 2.5, ease: 'power2.inOut' }, // Nurburgring - strict top down

  // Chapter 4: The Atelier
  10: { pos: [6, 1.5, 6], target: [0, 0.5, 0], fov: 40, dur: 2.0, ease: 'power3.inOut' }, // Configurator
  11: { pos: [-0.35, 0.8, -0.2], target: [0.35, 0.8, -2], fov: 55, dur: 1.5, ease: 'power2.inOut' }, // Interior

  // Chapter 5: Legacy
  12: { pos: [-7, 2, -5], target: [0, 0.5, 0], fov: 40, dur: 3.0, ease: 'power1.inOut' }, // Stats wall
  13: { pos: [0, 1, 8], target: [0, 0.5, 0], fov: 35, dur: 2.0, ease: 'power3.out' }, // Inquiry - clean front
};

// Simple custom easing functions to replace GSAP
const easings = {
  'power1.inOut': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  'power2.inOut': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // simplified
  'power2.out': (t: number) => t * (2 - t),
  'power3.inOut': (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  'power3.out': (t: number) => (--t) * t * t + 1,
  'power4.inOut': (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  'power4.out': (t: number) => 1 - (--t) * t * t * t,
  'back.out(1.2)': (t: number) => {
    const s = 1.2;
    return --t * t * ((s + 1) * t + s) + 1;
  }
};


// ═══════════════════════════════════════════════════════════════════
// CinematicLighting — fully non-reactive
// ═══════════════════════════════════════════════════════════════════
function CinematicLighting() {
  const lightRef = useRef<THREE.SpotLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const fillLight1 = useRef<THREE.SpotLight>(null);
  const fillLight2 = useRef<THREE.SpotLight>(null);

  useFrame((state, delta) => {
    const currentSlide = useAppStore.getState().currentSlide;
    const lerpSpeed = delta * 2.5;

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        currentSlide === 0 ? 0.05 : 0.15,
        lerpSpeed
      );
    }
    if (fillLight1.current) {
      fillLight1.current.intensity = THREE.MathUtils.lerp(
        fillLight1.current.intensity,
        currentSlide === 0 ? 0.001 : 5,
        lerpSpeed
      );
    }
    if (fillLight2.current) {
      fillLight2.current.intensity = THREE.MathUtils.lerp(
        fillLight2.current.intensity,
        currentSlide === 0 ? 0.001 : 2,
        lerpSpeed
      );
    }
    if (lightRef.current) {
      if (currentSlide === 0) {
        _targetLightPos.set(0, 8, 4);
        lightRef.current.position.lerp(_targetLightPos, lerpSpeed);
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 5, lerpSpeed);
        lightRef.current.angle = THREE.MathUtils.lerp(lightRef.current.angle, 0.6, lerpSpeed);
        lightRef.current.color.setHex(0xfff5e6);
      } else {
        const t = state.clock.elapsedTime;
        _orbitLightPos.set(Math.sin(t * 0.5) * 15, 10, Math.cos(t * 0.3) * 10);
        lightRef.current.position.lerp(_orbitLightPos, lerpSpeed);
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 3, lerpSpeed);
        lightRef.current.angle = THREE.MathUtils.lerp(lightRef.current.angle, 0.4, lerpSpeed);
        lightRef.current.color.setHex(0xffffff);
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.05} />
      {/* Lightweight environment — "apartment" is much smaller than "studio" */}
      <Environment preset="studio" />
      <spotLight ref={lightRef} position={[0, 8, 4]} angle={0.6} penumbra={1} intensity={5} color="#fff5e6" />
      <spotLight ref={fillLight1} position={[-10, 5, 10]} angle={0.5} penumbra={0.8} intensity={0.001} color="#ffffff" />
      <spotLight ref={fillLight2} position={[0, 10, 0]} angle={0.8} penumbra={1} intensity={0.001} color="#ff0000" />
      
      {/* Showroom Floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={0.2}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.5}
          mirror={1}
        />
      </mesh>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Model — aggressively optimizes the GLB geometry at load time
// ═══════════════════════════════════════════════════════════════════
function CarModel() {
  const { scene, materials } = useGLTF(MODEL_PATH) as any;
  const carColor = useAppStore((s) => s.carColor);
  const wheelStyle = useAppStore((s) => s.wheelStyle);
  const packageTier = useAppStore((s) => s.packageTier);
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(new THREE.Quaternion());
  const currentRotation = useRef(new THREE.Quaternion());
  const optimized = useRef(false);

  // One-time geometry optimization on mount
  useEffect(() => {
    if (optimized.current) return;
    optimized.current = true;

    let totalVertices = 0;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Disable frustum culling for the car (it's always on screen)
        mesh.frustumCulled = false;
        
        // Disable matrix auto-update for static meshes (huge perf gain)
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        
        if (mesh.geometry) {
          totalVertices += mesh.geometry.attributes.position?.count || 0;
          
          // Dispose of unused vertex attributes to free GPU memory
          const geo = mesh.geometry;
          if (geo.attributes.uv2) geo.deleteAttribute('uv2');
          if (geo.attributes.color) geo.deleteAttribute('color');
        }

        // Simplify materials — disable expensive features
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) {
            const stdMat = mat as THREE.MeshStandardMaterial;
            // Disable expensive PBR features that aren't visible on a car
            if (stdMat.displacementMap) {
              stdMat.displacementMap = null;
              stdMat.displacementScale = 0;
            }
            if (stdMat.aoMap) {
              stdMat.aoMap = null; // AO is handled by ContactShadows
            }
            // Reduce texture resolution for non-critical maps
            if (stdMat.normalMap && stdMat.normalMap.image) {
              stdMat.normalScale.set(0.5, 0.5); // Soften normals = cheaper
            }
            stdMat.envMapIntensity = 0.8;
            stdMat.needsUpdate = true;
          }
        }
      }
    });

    console.log(`[Model3D] Optimized: ${totalVertices.toLocaleString()} vertices`);
  }, [scene]);

  // Apply car color
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
  }, [scene]);

  // Real-time dynamic material configuration
  const _targetColor = new THREE.Color();
  const _caliperColor = new THREE.Color();
  const _wheelColor = new THREE.Color();
  const _trimColor = new THREE.Color();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const { isInteriorMode, currentSlide } = useAppStore.getState();

    // 1. Smooth Camera/Model Rotation tracking
    if (groupRef.current && (currentSlide === 0 || currentSlide === 12 || currentSlide === 13)) {
      currentRotation.current.slerp(targetRotation.current, delta * 2);
      groupRef.current.quaternion.copy(currentRotation.current);
    }

    // 2. Real-Time Material Injection
    if (!materials) return;

    const lerpSpeed = delta * 5;

    // Body Paint
    if (materials['Body']) {
      _targetColor.set(carColor);
      materials['Body'].color.lerp(_targetColor, lerpSpeed);
    }

    // Brake Calipers (Match body paint, unless SVJ63 where they turn Gold/Yellow)
    if (materials['Brake_2']) {
      _caliperColor.set(packageTier === 'svj63' ? '#ffaa00' : carColor);
      materials['Brake_2'].color.lerp(_caliperColor, lerpSpeed);
    }

    // Wheels (Dark_Metal handles the rims in this GLB)
    if (materials['Dark_Metal']) {
      _wheelColor.set(
        wheelStyle === 0 ? '#111111' :
        wheelStyle === 1 ? '#cccccc' :
        '#8a603c' // Bronze
      );
      materials['Dark_Metal'].color.lerp(_wheelColor, lerpSpeed);
      materials['Dark_Metal'].metalness = THREE.MathUtils.lerp(
        materials['Dark_Metal'].metalness, 
        wheelStyle === 1 ? 0.9 : 0.6, 
        lerpSpeed
      );
    }

    // Accent Trim / Exhaust (SVJ 63 Edition Gold)
    if (materials['Aluminum']) {
      _trimColor.set(packageTier === 'svj63' ? '#cca300' : '#ffffff');
      materials['Aluminum'].color.lerp(_trimColor, lerpSpeed);
    }

    if (isInteriorMode) {
      targetRotation.current.identity();
      currentRotation.current.slerp(targetRotation.current, delta * 4);
      groupRef.current.quaternion.copy(currentRotation.current);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 4);
      return;
    }

    let targetY = 0;
    switch (currentSlide) {
      case 0:
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

    targetRotation.current.setFromEuler(_eulerReset);
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

// ═══════════════════════════════════════════════════════════════════
// WindTunnel — fully non-reactive, reduced line count
// ═══════════════════════════════════════════════════════════════════
function WindTunnel() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const lineCount = 400; // Reduced from 800 to 400
  const lineLength = 3.0;
  const opacityRef = useRef(0);

  const [positions, speeds] = React.useMemo(() => {
    const pos = new Float32Array(lineCount * 2 * 3);
    const spd = new Float32Array(lineCount);
    for (let i = 0; i < lineCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = Math.random() * 5;
      const z = (Math.random() - 0.5) * 40;
      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z + lineLength;
      spd[i] = Math.random() * 0.8 + 0.5;
    }
    return [pos, spd];
  }, [lineCount]);

  useFrame((_state, delta) => {
    if (!linesRef.current) return;
    const active = useAppStore.getState().currentSlide === 2;

    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, active ? 1 : 0, delta * 3);
    const material = linesRef.current.material as THREE.LineBasicMaterial;
    material.opacity = opacityRef.current;

    if (opacityRef.current < 0.01) return;

    const pos = linesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < lineCount; i++) {
      const velocity = speeds[i] * delta * 80;
      pos[i * 6 + 2] += velocity;
      pos[i * 6 + 5] += velocity;
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
      <lineBasicMaterial color="#38bdf8" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} linewidth={1} />
    </lineSegments>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SceneCamera — fully non-reactive
// ═══════════════════════════════════════════════════════════════════
function SceneCamera() {
  const controlsRef = useRef<any>(null);
  const prevSlideRef = useRef(-1);
  const prevInteriorRef = useRef(false);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    const { currentSlide, isInteriorMode, isEngineRevved } = useAppStore.getState();

    if (currentSlide !== prevSlideRef.current || isInteriorMode !== prevInteriorRef.current) {
      prevSlideRef.current = currentSlide;
      prevInteriorRef.current = isInteriorMode;

      const controls = controlsRef.current;
      if (isInteriorMode) {
        controls.setLookAt(0.35, 0.8, -0.2, 0.35, 0.8, -2, true);
      } else {
        const preset = CINEMATIC_PRESETS[currentSlide];
        if (preset) {
          // Responsive check: if aspect ratio is portrait (mobile), pull the camera back 
          // so the car doesn't get clipped on the sides.
          const isMobile = window.innerWidth < window.innerHeight;
          const mobileMult = isMobile ? 1.5 : 1.0;

          controls.smoothTime = preset.dur / 2;
          controls.setLookAt(
            preset.pos[0] * mobileMult, preset.pos[1], preset.pos[2] * mobileMult, 
            preset.target[0], preset.target[1], preset.target[2], 
            true
          );
          controls.camera.fov = preset.fov * (isMobile ? 1.2 : 1.0);
          controls.camera.updateProjectionMatrix();
        }
      }
    }

    if (!useAppStore.getState().isInteriorMode && useAppStore.getState().currentSlide === 0) {
      controlsRef.current.azimuthAngle -= delta * 0.05;
    }

    if (isEngineRevved) {
      controlsRef.current.camera.position.x += (Math.random() - 0.5) * 0.05;
      controlsRef.current.camera.position.y += (Math.random() - 0.5) * 0.05;
    }
  });

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={3}
      maxDistance={15}
      maxPolarAngle={Math.PI / 2 - 0.02}
      dollySpeed={0.5}
      smoothTime={0.8}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// Model3D — high-quality Canvas
// ═══════════════════════════════════════════════════════════════════
export function Model3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.4, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMappingExposure: 1.0,
          powerPreference: "high-performance",
        }}
        frameloop="always"
      >
        <color attach="background" args={["#020202"]} />
        {typeof window !== 'undefined' && window.innerWidth > 768 && (
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={4.0} mipmapBlur intensity={0.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}

        <CinematicLighting />

        <Suspense fallback={null}>
          <CarModel />
          <WindTunnel />
          <Hotspots />
          <ContactShadows frames={1} resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000000" />
        </Suspense>

        <SceneCamera />
      </Canvas>
    </div>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_PATH);
}
