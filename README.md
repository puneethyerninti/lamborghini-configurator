<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/en/d/df/Lamborghini_Logo.svg" alt="Lamborghini Logo" width="100" />
  <br/>
  <h1>Automobili Lamborghini | Aventador SVJ</h1>
  <p><strong>A Cinematic 3D Spatial Web Experience & Ad Personam Configurator</strong></p>

  [![Live Demo](https://img.shields.io/badge/LIVE_DEMO-lamborghini--svj.vercel.app-gold?style=for-the-badge&logo=vercel)](https://lamborghini-svj.vercel.app)
  [![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
  [![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
  [![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-black?style=for-the-badge&logo=react)](https://docs.pmnd.rs/react-three-fiber)
  [![Zustand](https://img.shields.io/badge/Zustand-443e38?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
</div>

<br/>

> **"We don't build cars. We build dreams that happen to have four wheels and an engine."**
> 
> *This project is a highly optimized, interactive 3D spatial web application dedicated to the uncompromising legacy of the Lamborghini Aventador SVJ. It merges automotive luxury with cutting-edge front-end engineering to deliver a photorealistic, 60FPS cinematic experience directly in the browser.*

---

## 🏎️ The Vision

The goal of this project is to transcend traditional automotive landing pages. Instead of static images and simple scrolling text, this application places the user inside a **real-time 3D environment**. By leveraging WebGL and modern React architectures, we bring the visceral presence of the Aventador SVJ to both desktop and mobile screens—without sacrificing performance or aesthetics.

---

## 🎬 The Cinematic Experience (UI/UX)

The user interface is designed to feel like a high-end automotive documentary, heavily inspired by modern spatial computing interfaces. 

### Slide-Based Storytelling
The core navigation operates on a highly choreographed slide system powered by **Framer Motion**. As the user scrolls (or swipes), the 3D camera seamlessly interpolates around the vehicle. 
- **Chapter 1: The Bull** - Introduces the heritage and philosophy.
- **Chapter 2: Engineering** - Highlights ALA 2.0 (Aerodynamics) and the LDVA 2.0 telemetry systems.
- **Chapter 3: The Track** - Dives into the V12 engine acoustics and the Nürburgring lap record.
- **Chapter 4: The Atelier** - Enters the interactive Ad Personam Configurator.

### Micro-Interactions & Polish
Every interaction has weight.
- **Custom Magnetic Cursors**: The cursor dynamically snaps to interactive elements, mimicking physical buttons.
- **Scramble & Split Text**: Headings reveal themselves through complex staggering and cryptographic scrambling animations, evoking a highly technical, telemetry-focused HUD.
- **Parallax Layers**: Background typography and HUD elements respond to mouse coordinates, creating a profound sense of depth (`MouseParallaxProvider`).

---

## 📐 Rendering Architecture

At the heart of the application is a highly optimized WebGL pipeline orchestrated through `@react-three/fiber` and `@react-three/drei`.

### The 3D Pipeline
The Aventador SVJ model (`.glb`) is loaded asynchronously and compressed using Draco to drastically reduce the initial payload. The `Model3D.tsx` component acts as the director, managing the camera, lighting, and environmental reflections.

### Lighting & Reflections
- **Dynamic Showroom Floor**: Using a custom `MeshReflectorMaterial`, the floor calculates real-time depth-based reflections and blur, grounding the car in a physical space.
- **HDR Environment Mapping**: The metallic and glossy surfaces of the car are driven by a high-dynamic-range image (HDRI) that simulates a professional studio lighting setup.
- **Interactive Spotlights**: During the configurator phase, spotlights track the user's cursor across the vehicle's geometry in real-time.

### Cinematic Post-Processing
On desktop devices, the application utilizes `EffectComposer` to apply advanced post-processing passes:
- **Bloom**: Creates physical light bleeding on the headlights and highly reflective edges.
- **Vignette & Hue Adjustment**: Mimics a physical camera lens, drawing focus to the center of the frame and cooling the overall color temperature to match Lamborghini's aggressive branding.

---

## 🎨 Ad Personam Configurator

The application features a fully functional **Ad Personam** customization suite, allowing users to tailor the SVJ to their exact specifications.

### Real-Time Material Manipulation
When the user selects a new paint finish (e.g., *Rosso Mars* or *Verde Mantis*) or toggles between Matte and Glossy finishes, the application traverses the GLTF scene graph and instantly mutates the underlying `THREE.MeshStandardMaterial` properties. 
- **Body Paint**: Adjusts `color`, `roughness`, and `metalness`.
- **Calipers**: Dynamically isolates the brake caliper meshes for independent coloring.
- **Interior Alcantara**: When the camera moves inside the cockpit, users can customize the steering wheel and seat stitching.

### State Orchestration
The configurator is powered by **Zustand**. A centralized `useAppStore` holds the entire configuration state. Because Zustand operates outside the React render cycle, the HTML DOM interface (`ConfiguratorUI.tsx`) can update the WebGL Canvas instantly without causing heavy, full-page re-renders.

---

## 🔊 Acoustic Engineering (Web Audio API)

Sound is a critical component of the Lamborghini experience. 
- **Spatial Audio**: Using Three.js `PositionalAudio`, the raw V12 engine sounds are physically anchored to the rear engine bay of the 3D model. As the camera moves around the car, the audio pans dynamically in 3D space.
- **Telemetry UI Sounds**: The custom `AudioEngine` handles background cinematic music and sharp, metallic hover effects for buttons, making the interface feel tactile.

---

## ⚡ Mobile Optimization (The 60FPS Challenge)

Delivering a photorealistic WebGL experience on mobile hardware is notoriously difficult. This project achieves a rock-solid **60FPS on mobile** through aggressive optimization techniques:

1. **Dynamic DPR Scaling**: Device Pixel Ratio (DPR) is clamped strictly to `Math.min(window.devicePixelRatio, 2)` on mobile. This ensures crisp edges while preventing thermal throttling on ultra-high-resolution displays.
2. **Selective Post-Processing**: The heavy `EffectComposer` (Bloom passes) is completely disabled on mobile devices.
3. **Optimized Reflections**: The dual-render `MeshReflectorMaterial` is swapped for a highly performant `meshBasicMaterial` when `isMobile` is detected, instantly recovering massive amounts of GPU overhead.
4. **Hardware Compositing (iOS Safari Fix)**: A major bug in mobile Safari causes HTML text to incorrectly render *behind* the WebGL canvas. We solved this by applying `transform-gpu` (`translate3d(0,0,0)`) to the HTML containers, forcing the browser's compositor to explicitly layer the UI on a separate hardware plane above the 3D context.

---

## 🗂️ Directory Structure

- `src/app/page.tsx` - The main orchestrator. Handles slide logic, DOM layering, and layout.
- `src/components/ui/Model3D.tsx` - The WebGL Context. Houses the `<Canvas>`, Lights, Cameras, and the `CarModel`.
- `src/components/ui/ConfiguratorUI.tsx` - The HTML overlay for the Ad Personam customization panel.
- `src/components/ui/AudioEngine.tsx` - The global Web Audio API manager.
- `src/store/useAppStore.ts` - Centralized Zustand store for slide tracking, audio state, and configurator selections.
- `public/` - Houses the compressed `.glb` 3D models, HDR environments, and `.wav` audio files.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/puneethyerninti/lamborghini-configurator.git
   cd lamborghini-configurator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

4. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📜 License

*This project is an independent front-end engineering showcase and is not officially affiliated with Automobili Lamborghini S.p.A. All Lamborghini trademarks, logos, and specific model names are the sole property of Automobili Lamborghini S.p.A. 3D models and brand assets are used strictly for educational and demonstrative purposes.*
