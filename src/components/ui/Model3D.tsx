"use client";

import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Center, CameraControls, ContactShadows, MeshReflectorMaterial, Trail, Text3D, MeshTransmissionMaterial } from "@react-three/drei";
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
// Cursor Light Painting
// ═══════════════════════════════════════════════════════════════════
function CursorLightPainting() {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const carColor = useAppStore((s) => s.carColor);
  const targetPos = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!meshRef.current || !lightRef.current) return;
    
    // Map normalized device coordinates (state.pointer) to 3D world space
    // We project the pointer onto a plane roughly where the car sits
    const zDepth = 4; // Distance from camera
    targetPos.current.set(state.pointer.x * (state.viewport.width / 2), state.pointer.y * (state.viewport.height / 2), zDepth);
    
    // Smoothly follow the mouse
    meshRef.current.position.lerp(targetPos.current, 0.1);
    lightRef.current.position.copy(meshRef.current.position);
    
    // Pulse light intensity based on movement
    const speed = meshRef.current.position.distanceTo(targetPos.current);
    lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, speed * 2, 0.1);
  });

  return (
    <Trail width={0.5} color={carColor} length={30} decay={1} local={false} stride={0} interval={1}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color={carColor} transparent opacity={0.5} />
      </mesh>
      <pointLight ref={lightRef} distance={5} color={carColor} intensity={0} />
    </Trail>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Refractive Glass Typography
// ═══════════════════════════════════════════════════════════════════
function RefractiveText() {
  const currentSlide = useAppStore((s) => s.currentSlide);
  const active = currentSlide === 0;
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetScale = active ? 1 : 0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4);
    groupRef.current.position.y = Math.sin(Date.now() / 1000) * 0.1 + 0.8;
  });

  const isMobile = window.innerWidth < 768 || window.innerWidth < window.innerHeight;
  const textSize = isMobile ? 2 : 4;

  return (
    <group ref={groupRef} position={[0, 0.8, -2]}>
      <Center>
        <Text3D
          font="/helvetiker_bold.typeface.json"
          size={textSize}
          height={0.5}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.1}
          bevelSize={0.05}
          bevelOffset={0}
          bevelSegments={3}
        >
          SVJ
          <MeshTransmissionMaterial
            backside={false}
            samples={2}
            resolution={256}
            thickness={2}
            chromaticAberration={0.025}
            anisotropy={0}
            distortion={0.1}
            distortionScale={0.1}
            temporalDistortion={0.0}
            clearcoat={1}
            attenuationDistance={0.5}
            attenuationColor="#ffffff"
            color="#ffffff"
          />
        </Text3D>
      </Center>
    </group>
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
      const isXRay = currentSlide === 6;
      _targetColor.set(isXRay ? '#00d4ff' : carColor); // Cyan wireframe for X-Ray
      materials['Body'].color.lerp(_targetColor, lerpSpeed);
      
      // Toggle Wireframe and Opacity
      materials['Body'].wireframe = isXRay;
      materials['Body'].transparent = true;
      materials['Body'].opacity = THREE.MathUtils.lerp(
        materials['Body'].opacity, 
        isXRay ? 0.3 : 1.0, 
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
        <color attach="background" args={["#000000"]} />
        {typeof window !== 'undefined' && window.innerWidth > 768 && (
          <EffectComposer autoClear={false}>
            <Bloom luminanceThreshold={4.0} mipmapBlur intensity={0.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}

        <CinematicLighting />

        <Suspense fallback={null}>
          <CursorLightPainting />
          <RefractiveText />
          <CarModel />
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
