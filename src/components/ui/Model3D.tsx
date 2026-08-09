"use client";

import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, Center, Environment, Text3D, useGLTF, Sparkles, PositionalAudio } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
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
const _dawnColor = new THREE.Color(0xffb77a);
const _noonColor = new THREE.Color(0xffffff);
const _duskColor = new THREE.Color(0x3a5a9c);

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
        const t = state.clock.elapsedTime;
        if (t < 3) {
          // Ignition wake-up sequence
          const sweepX = THREE.MathUtils.lerp(-15, 10, t / 3);
          _targetLightPos.set(sweepX, 8, 4);
          lightRef.current.position.lerp(_targetLightPos, lerpSpeed * 2);

          // Pulse intensity
          const pulse = Math.sin(t * Math.PI * 4); // Fast pulsing
          lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 5 + pulse * 3, lerpSpeed);
        } else {
          // Settle
          _targetLightPos.set(0, 8, 4);
          lightRef.current.position.lerp(_targetLightPos, lerpSpeed);
          lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 5, lerpSpeed);
        }
        lightRef.current.angle = THREE.MathUtils.lerp(lightRef.current.angle, 0.6, lerpSpeed);
      } else {
        const t = state.clock.elapsedTime;
        _orbitLightPos.set(Math.sin(t * 0.5) * 15, 10, Math.cos(t * 0.3) * 10);
        lightRef.current.position.lerp(_orbitLightPos, lerpSpeed);
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 3, lerpSpeed);
        lightRef.current.angle = THREE.MathUtils.lerp(lightRef.current.angle, 0.4, lerpSpeed);
      }

      // Day-Night Cycle color interpolation
      const chapter = useAppStore.getState().chapter;
      if (chapter === 0) { // Dawn
        lightRef.current.color.lerp(_dawnColor, lerpSpeed);
      } else if (chapter === 2) { // Dusk / Night track
        lightRef.current.color.lerp(_duskColor, lerpSpeed);
      } else { // Noon / Studio
        lightRef.current.color.lerp(_noonColor, lerpSpeed);
      }
    }
  });

  const environment = useAppStore((s) => s.environment);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.05} />
      <Environment preset={environment as any} resolution={512} />
      <spotLight ref={lightRef} position={[0, 8, 4]} angle={0.6} penumbra={1} intensity={5} color="#fff5e6" />
      <spotLight ref={fillLight1} position={[-10, 5, 10]} angle={0.5} penumbra={0.8} intensity={0.001} color="#ffffff" />
      <spotLight ref={fillLight2} position={[0, 10, 0]} angle={0.8} penumbra={1} intensity={0.001} color="#ff0000" />

      {/* Showroom Floor — lightweight, no FBO mirror render */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#111111"
          roughness={0.15}
          metalness={0.85}
          envMapIntensity={0.4}
        />
      </mesh>
    </>
  );
}

// CursorLightPainting removed — Trail geometry regeneration every frame was ~8% of frame budget

// ═══════════════════════════════════════════════════════════════════
// Refractive Glass Typography
// ═══════════════════════════════════════════════════════════════════
// Pre-allocated vector for TextNode scale lerp — zero GC pressure
const _scaleVec = new THREE.Vector3();

function TextNode({ text, active, position, rotation = [0, 0, 0], size, children }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetScale = active ? 1 : 0;
    _scaleVec.set(targetScale, targetScale, targetScale);
    
    // Fast snap to 0 if inactive and very small to save rendering
    if (!active && groupRef.current.scale.x < 0.01) {
      groupRef.current.scale.set(0, 0, 0);
      groupRef.current.visible = false;
      return;
    }
    
    groupRef.current.visible = true;
    groupRef.current.scale.lerp(_scaleVec, delta * 4);
    
    // Add subtle floating motion
    if (active) {
       groupRef.current.position.y = position[1] + Math.sin(Date.now() / 1000) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <Center>
        <Text3D
          font="/helvetiker_bold.typeface.json"
          size={size}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={3}
        >
          {text}
          {children}
        </Text3D>
      </Center>
    </group>
  );
}

function DynamicTypography() {
  const currentSlide = useAppStore((s) => s.currentSlide);
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.innerWidth < window.innerHeight);
  const baseSize = isMobile ? 1.5 : 3;

  return (
    <>
      {/* Slide 0: Hero - Refractive Glass */}
      <TextNode 
        text="SVJ" 
        active={currentSlide === 0} 
        position={[0, 2.2, -4]} 
        size={baseSize * 1.3}
      >
        <meshPhysicalMaterial
          transmission={0.9} thickness={1.5} roughness={0.05} clearcoat={1} clearcoatRoughness={0.1} ior={1.5} color="#ffffff" transparent opacity={0.9} envMapIntensity={1.5}
        />
      </TextNode>

      {/* Slide 4: Aerodynamics - Frosted Glass */}
      <TextNode 
        text="AERO" 
        active={currentSlide === 4} 
        position={[5, 1.5, -4]} 
        rotation={[0, -Math.PI / 4, 0]}
        size={baseSize * 0.25}
      >
        <meshPhysicalMaterial
          transmission={0.5} thickness={0.5} roughness={0.2} color="#ffffff" transparent opacity={0.8}
        />
      </TextNode>

      {/* Slide 5: V12 Heart - Brushed Aluminum */}
      <TextNode 
        text="V12" 
        active={currentSlide === 5} 
        position={[0, 2.5, -5]} 
        size={baseSize * 0.3}
      >
        <meshStandardMaterial metalness={1} roughness={0.2} color="#cccccc" />
      </TextNode>

      {/* Slide 6: Carbon Exploded View - Dark Matte */}
      <TextNode 
        text="CARBON" 
        active={currentSlide === 6} 
        position={[5, 1.5, -4]} 
        rotation={[0, -Math.PI / 4, 0]}
        size={baseSize * 0.25}
      >
        <meshStandardMaterial metalness={0.4} roughness={0.8} color="#111111" />
      </TextNode>

      {/* Slide 8: Top Speed - Glowing Oro Elios (Gold) */}
      <TextNode 
        text="MAX VELOCITY" 
        active={currentSlide === 8} 
        position={[-6, 1.5, 5]} 
        rotation={[0, Math.PI * 0.75, 0]}
        size={baseSize * 0.2}
      >
        <meshStandardMaterial metalness={1} roughness={0.2} color="#b59b4c" emissive="#b59b4c" emissiveIntensity={0.5} />
      </TextNode>
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

    scene.traverse((child: THREE.Object3D) => {
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

    // Setup Original Positions & Explosion Vectors
    scene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.userData.originalPos = mesh.position.clone();

        // Calculate explosion direction based on mesh center
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        mesh.geometry.boundingBox?.getCenter(center);

        // Normalize the vector pushing it outwards
        const explodeDir = center.clone().normalize().multiplyScalar(1.2);

        // Make body panels float up, wheels push sideways
        if (mesh.material && (mesh.material as THREE.Material).name.toLowerCase().includes('body')) {
          explodeDir.y += 0.8;
        }

        mesh.userData.explodeDir = explodeDir;
      }
    });

    console.log(`[Model3D] Optimized: ${totalVertices.toLocaleString()} vertices`);
  }, [scene]);

  // Apply car color
  useEffect(() => {
    let applied = false;
    scene.traverse((child: THREE.Object3D) => {
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
      scene.traverse((child: THREE.Object3D) => {
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
  const _tempVec = new THREE.Vector3();

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

    // Body Paint & X-Ray Mode
    if (materials['Body']) {
      const { xrayMode } = useAppStore.getState();
      const isXRay = currentSlide === 6 || xrayMode;
      _targetColor.set(isXRay ? '#00d4ff' : carColor); // Cyan wireframe for X-Ray
      materials['Body'].color.lerp(_targetColor, lerpSpeed);

      // Toggle Wireframe and Opacity
      materials['Body'].wireframe = isXRay;
      materials['Body'].transparent = true;
      materials['Body'].opacity = THREE.MathUtils.lerp(
        materials['Body'].opacity,
        isXRay ? 0.4 : 1.0,
        lerpSpeed
      );
    }

    // Brake Calipers (Match body paint, unless SVJ63 where they turn Gold/Yellow)
    if (materials['Brake_2']) {
      _caliperColor.set(packageTier === 'svj63' ? '#ffaa00' : carColor);
      materials['Brake_2'].color.lerp(_caliperColor, lerpSpeed);
    }

    // Wheels (Dark_Metal handles the rims in this GLB)
    if (materials['Dark_Metal']) {
      _wheelColor.set(
        wheelStyle === 0 ? '#8a603c' : // Bronze
          wheelStyle === 1 ? '#cccccc' : // Titanium
            '#111111' // Gloss Black
      );
      materials['Dark_Metal'].color.lerp(_wheelColor, lerpSpeed);
      materials['Dark_Metal'].metalness = THREE.MathUtils.lerp(
        materials['Dark_Metal'].metalness,
        wheelStyle === 1 ? 0.9 : 0.6,
        lerpSpeed
      );
    }

    // Window Glass (Tint lighter if in interior mode or interior theme is bright)
    if (materials['Window_Glass']) {
      materials['Window_Glass'].transparent = true;
      materials['Window_Glass'].opacity = THREE.MathUtils.lerp(
        materials['Window_Glass'].opacity,
        isInteriorMode ? 0.2 : 0.8,
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

    // Exploded View Assembly (Slide 6)
    const isExploded = currentSlide === 6;
    const targetExplosionAmount = isExploded ? 1 : 0;

    // Only animate if we're on Slide 6 or actively returning from it
    // Optimization: Only traverse if the first child is far from origin or we are exploded
    let shouldAnimate = isExploded;
    if (!shouldAnimate) {
      const firstChild = scene.children[0];
      if (firstChild && firstChild.userData.originalPos) {
        shouldAnimate = firstChild.position.distanceTo(firstChild.userData.originalPos) > 0.01;
      }
    }

    if (shouldAnimate) {
      scene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.userData.originalPos && mesh.userData.explodeDir) {
            // Avoid .clone() allocations in the render loop to prevent GC freezing
            _tempVec.copy(mesh.userData.explodeDir).multiplyScalar(targetExplosionAmount).add(mesh.userData.originalPos);
            mesh.position.lerp(_tempVec, lerpSpeed);
            mesh.updateMatrix();
          }
        }
      });
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
// SceneCamera — fully non-reactive
// ═══════════════════════════════════════════════════════════════════
function SceneCamera() {
  const controlsRef = useRef<any>(null);
  const prevSlideRef = useRef(-1);
  const prevInteriorRef = useRef(false);
  const prevTabRef = useRef("");

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    const { currentSlide, isInteriorMode, isEngineRevved, engineRevLevel, configuratorTab } = useAppStore.getState();

    if (currentSlide !== prevSlideRef.current || isInteriorMode !== prevInteriorRef.current || (currentSlide === 10 && configuratorTab !== prevTabRef.current)) {
      prevSlideRef.current = currentSlide;
      prevInteriorRef.current = isInteriorMode;
      prevTabRef.current = configuratorTab;

      const controls = controlsRef.current;
      if (isInteriorMode) {
        controls.setLookAt(0.35, 0.8, -0.2, 0.35, 0.8, -2, true);
      } else {
        let preset = CINEMATIC_PRESETS[currentSlide];
        
        // Configurator Tab Overrides
        if (currentSlide === 10) {
          if (configuratorTab === "wheels") {
            preset = { pos: [2.5, 0.4, -2.5], target: [1, 0.3, -1.5], fov: 40, dur: 1.5, ease: "" };
          } else if (configuratorTab === "interior") {
            preset = { pos: [-3.5, 1.2, 1.5], target: [-0.35, 0.8, -0.5], fov: 45, dur: 1.5, ease: "" };
          } else if (configuratorTab === "backdrop") {
            preset = { pos: [0, 0.5, 8], target: [0, 0.5, 0], fov: 45, dur: 1.5, ease: "" };
          } else if (configuratorTab === "summary") {
            preset = { pos: [-5, 2, 5], target: [0, 0.5, 0], fov: 40, dur: 1.5, ease: "" };
          }
        }
        if (preset) {
          // Responsive check: if aspect ratio is portrait (mobile), pull the camera back 
          // so the car doesn't get clipped on the sides.
          const isMobile = window.innerWidth < window.innerHeight;
          const mobileMult = isMobile ? 2.0 : 1.0;

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
      const shakeAmt = 0.05 * engineRevLevel;
      controlsRef.current.camera.position.x += (Math.random() - 0.5) * shakeAmt;
      controlsRef.current.camera.position.y += (Math.random() - 0.5) * shakeAmt;
      controlsRef.current.camera.position.z += (Math.random() - 0.5) * shakeAmt;
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
// Dynamic Features (Environment & Interior Lighting)
// ═══════════════════════════════════════════════════════════════════
function DynamicEnvironment() {
  const environment = useAppStore((s) => s.environment) as 'studio' | 'night' | 'city';
  const currentSlide = useAppStore((s) => s.currentSlide);
  const timeOfDay = useAppStore((s) => s.timeOfDay);
  const active = currentSlide === 10 || currentSlide === 11; // Only show background in Atelier & Interior
  
  // Calculate environment intensity based on timeOfDay (0 = Midnight, 0.5 = High Noon, 1 = Sunset)
  // At midnight, it should be very dim. At high noon, bright. At sunset, medium.
  const envIntensity = timeOfDay < 0.3 ? 0.2 + timeOfDay : timeOfDay < 0.7 ? 1.0 : 1.5 - timeOfDay;

  return (
    <Environment 
      preset={environment} 
      background={active} 
      backgroundBlurriness={0.5} 
      environmentIntensity={envIntensity}
    />
  );
}

function InteriorLight() {
  const interiorTheme = useAppStore((s) => s.interiorTheme);
  const isInteriorMode = useAppStore((s) => s.isInteriorMode);
  
  // Nero = Red accent (#b59b4c as Gold for V2), Bianco = White/Blue (#ffffff), Arancio = Orange (#ff6600)
  const color = interiorTheme === 'nero' ? '#b59b4c' : interiorTheme === 'bianco' ? '#ffffff' : '#ff6600';
  
  // Make it brighter if in interior mode
  const intensity = isInteriorMode ? 2.5 : 1.0;
  
  return (
    <pointLight 
      position={[0, 0.5, -0.1]} // inside the cabin
      color={color}
      intensity={intensity}
      distance={3}
      decay={2}
    />
  );
}

function InteractiveSpotlight() {
  const lightRef = useRef<THREE.SpotLight>(null);
  const currentSlide = useAppStore((s) => s.currentSlide);
  
  useFrame((state, delta) => {
    if (!lightRef.current) return;
    if (currentSlide === 10) { // Atelier Configurator
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 20, delta * 3);
      // Follow mouse
      const targetX = state.pointer.x * 4;
      const targetZ = -state.pointer.y * 3;
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, delta * 5);
      lightRef.current.position.z = THREE.MathUtils.lerp(lightRef.current.position.z, targetZ, delta * 5);
    } else {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, delta * 3);
    }
  });

  return (
    <spotLight 
      ref={lightRef}
      position={[0, 6, 0]}
      angle={0.4}
      penumbra={0.6}
      intensity={0}
      color="#ffffff"
    />
  );
}

function CinematicEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={3.0} mipmapBlur intensity={0.4} />
    </EffectComposer>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Configurator Active Addons
// ═══════════════════════════════════════════════════════════════════
function ConfiguratorAddons() {
  const configuratorTab = useAppStore((s) => s.configuratorTab);
  const currentSlide = useAppStore((s) => s.currentSlide);
  
  if (currentSlide !== 10) return null;
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// Model3D — high-quality Canvas
// ═══════════════════════════════════════════════════════════════════
export function Model3D() {
  const [mounted, setMounted] = useState(false);
  const isAudioEnabled = useAppStore((s) => s.isAudioEnabled);

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
        <color attach="background" args={["#000000"]} />
        {typeof window !== 'undefined' && window.innerWidth > 768 && (
          <CinematicEffects />
        )}

        <CinematicLighting />

        <Suspense fallback={null}>
          <DynamicTypography />
          <CarModel />
          <Hotspots />
          {/* Lightweight shadow plane — replaces expensive ContactShadows ray-marching */}
          <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[4, 32]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.4} depthWrite={false} />
          </mesh>
          <DynamicEnvironment />
          <InteriorLight />
          <InteractiveSpotlight />
          <ConfiguratorAddons />
          <Sparkles count={150} scale={12} size={1.5} speed={0.2} opacity={0.15} color="#ffffff" noise={1} />
          {isAudioEnabled && (
            <PositionalAudio
              url="/785503__litesaturation__energy-metal-short.wav"
              position={[0, 0.5, -2]} // Mounted near engine bay
              loop
              autoplay
            />
          )}
        </Suspense>

        <SceneCamera />
      </Canvas>
    </div>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_PATH);
}
