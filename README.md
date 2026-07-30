# Lamborghini Aventador SVJ – Spatial UI Experience

![Lamborghini Spatial UI](https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg)

An ultra-premium, highly performant WebGL 3D configurator and interactive showcase for the Lamborghini Aventador SVJ. Built with Next.js, React Three Fiber, and Framer Motion, this project demonstrates the bleeding edge of web-based spatial UI design, combining cinematic aesthetics with flawless 60fps performance.

## 🌟 Key Features

- **Massive Spatial Typography:** Hardware-accelerated, zero-DOM-cost typographic watermarks and gradients.
- **Cinematic 3D Environment:** A custom-built lighting pipeline featuring Champagne spotlighting and an infinite dark gallery void.
- **Zero-Stutter Scroll Architecture:** Fully decoupled React rendering. The scroll state bypasses the React reconciler and injects directly into the WebGL render loop, ensuring absolute zero bounding-box recalculation lag.
- **Interactive 3D Configurator:** Real-time paint and material customization for a 50MB AAA-quality 3D asset.
- **Micro-Interactions:** Custom frosted glassmorphism elements, precise timing springs, and editorial layouts.

## 🛠️ Technology Stack

- **Framework:** Next.js 14
- **3D Graphics Engine:** Three.js & React Three Fiber
- **Animation Engine:** Framer Motion
- **Styling:** Tailwind CSS
- **State Management:** Zustand

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏎️ Performance Optimizations

This repository implements several advanced WebGL optimization techniques:
1. **Shader Pruning Bypass:** Prevented Three.js from recompiling shaders mid-scroll by clamping minimum light intensities to `0.001` instead of `0`.
2. **Baked Shadows:** `ContactShadows` are locked to `frames={1}`, completely eliminating per-frame shadow map generation costs.
3. **Reactive Decoupling:** The 3D `<Model />` component subscribes to Zustand state non-reactively via `.getState()` inside the `useFrame` loop, preventing `@react-three/drei`'s `<Center>` from executing massive CPU-bound bounding box calculations during scroll events.

---
*Developed as a masterclass in WebGL performance and luxury Spatial UI design.*
