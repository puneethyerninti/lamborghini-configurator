# Automobili Lamborghini | Aventador SVJ Spatial UI

A premium, interactive 3D spatial web experience dedicated to the Lamborghini Aventador SVJ. Built with Next.js, React Three Fiber, and Framer Motion, this project demonstrates a highly optimized, immersive product showcase that runs flawlessly at 60fps across desktop and mobile devices.

## Features

- **Interactive 3D Rendering:** High-fidelity, real-time rendering of the Aventador SVJ using `@react-three/fiber` and `@react-three/drei`.
- **Cinematic Presentation:** Slide-based storytelling with smooth camera transitions and depth-of-field effects that seamlessly move around the exterior and interior of the car.
- **Ad Personam Configurator:** A fully functional 3D car configurator allowing users to customize paint finishes (Matte/Glossy) and interior alcantara colors in real-time.
- **Dynamic Lighting & Reflections:** Utilizing `MeshReflectorMaterial`, environment HDR mapping, and dynamic spotlights that react to user interaction.
- **Mobile Optimized:** Advanced performance scaling ensures crisp native resolution and smooth 60fps framerates on mobile devices without sacrificing core aesthetics. Features automatic LOD (Level of Detail) scaling, anti-aliasing enforcement, and fallback materials.
- **Audio Engine:** Immersive background telemetry audio and interactive sound effects using the Web Audio API.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **3D Graphics:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [Three.js](https://threejs.org/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Fonts:** Next/Font (Syncopate, Playfair Display, Montserrat)

## Project Structure

- `/src/components/ui/Model3D.tsx` - The core WebGL Canvas and rendering pipeline.
- `/src/components/ui/ConfiguratorUI.tsx` - The Ad Personam customization panel.
- `/src/components/ui/AudioEngine.tsx` - Web Audio API integration for immersive sound.
- `/src/app/page.tsx` - Main presentation slides and layout orchestration.
- `/src/store/useAppStore.ts` - Global state management for slides, audio, and configurator data.
- `/public/` - Static assets including 3D models (`.glb`), HDR environments, and audio.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Performance & Optimization

This project employs several advanced optimization techniques:
- **GLTF Compression:** The 3D models are heavily optimized using Draco compression to reduce payload size.
- **Selective Post-Processing:** Expensive effects like Bloom and Vignette are managed dynamically and disabled entirely on mobile devices to preserve frame rates.
- **Mobile Safari Compositing Fixes:** Uses `transform-gpu` and explicit CSS compositing layers to prevent WebGL from obscuring standard HTML DOM elements (a known WebKit bug).
- **Intelligent Asset Loading:** Uses `useGLTF.preload()` to cache the model in memory before it is requested by the scene.

## License
This project is an independent showcase. All Lamborghini trademarks, logos, and model names are the property of Automobili Lamborghini S.p.A.
