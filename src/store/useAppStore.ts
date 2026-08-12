import { create } from 'zustand';

interface AppState {
  currentSlide: number;
  totalSlides: number;
  chapter: number;

  // Customization
  carColor: string;
  wheelStyle: 0 | 1 | 2;
  interiorTheme: 'nero' | 'bianco' | 'arancio';
  packageTier: 'standard' | 'magnolia' | 'svj63';
  environment: 'studio' | 'night' | 'city';

  // Modes
  isAudioEnabled: boolean;
  isInteriorMode: boolean;
  isEngineRevved: boolean;
  engineRevLevel: number;
  isTransitioning: boolean;
  xrayMode: boolean;
  isThermalMode: boolean;
  isPolarized: boolean;
  timeOfDay: number;
  configuratorTab: "exterior" | "wheels" | "interior" | "backdrop" | "summary";

  // Actions
  setSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setCarColor: (color: string) => void;
  setWheelStyle: (style: 0 | 1 | 2) => void;
  setInteriorTheme: (theme: 'nero' | 'bianco' | 'arancio') => void;
  setPackageTier: (tier: 'standard' | 'magnolia' | 'svj63') => void;
  setEnvironment: (env: 'studio' | 'night' | 'city') => void;
  toggleAudio: () => void;
  toggleInteriorMode: () => void;
  toggleThermalMode: () => void;
  togglePolarized: () => void;
  revEngine: () => void;
  setXrayMode: (active: boolean) => void;
  setTimeOfDay: (time: number) => void;
  setConfiguratorTab: (tab: "exterior" | "wheels" | "interior" | "backdrop" | "summary") => void;
}

const getChapter = (slideIndex: number) => {
  if (slideIndex <= 2) return 0; // The Bull
  if (slideIndex <= 6) return 1; // Engineering
  if (slideIndex <= 9) return 2; // Performance
  if (slideIndex <= 11) return 3; // Atelier
  return 4; // Invitation
};

export const useAppStore = create<AppState>((set) => ({
  currentSlide: 0,
  totalSlides: 14,
  chapter: 0,

  carColor: '#a10a0a', // Rosso Mars
  wheelStyle: 0,
  interiorTheme: 'nero',
  packageTier: 'standard',
  environment: 'studio',

  isAudioEnabled: false,
  isInteriorMode: false,
  isEngineRevved: false,
  engineRevLevel: 0,
  isTransitioning: false,
  xrayMode: false,
  isThermalMode: false,
  isPolarized: false,
  timeOfDay: 0.5,
  configuratorTab: "exterior",

  setSlide: (index) => {
    set({ isTransitioning: true });
    setTimeout(() => set({ isTransitioning: false }), 800);
    set({
      currentSlide: index,
      chapter: getChapter(index),
      isInteriorMode: false
    });
  },

  setEnvironment: (env) => set({ environment: env }),
  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),

  nextSlide: () => set((state) => {
    const next = Math.min(state.currentSlide + 1, state.totalSlides - 1);
    if (next !== state.currentSlide) {
      setTimeout(() => set({ isTransitioning: false }), 800);
      return {
        currentSlide: next,
        chapter: getChapter(next),
        isInteriorMode: false,
        isTransitioning: true
      };
    }
    return state;
  }),

  prevSlide: () => set((state) => {
    const prev = Math.max(state.currentSlide - 1, 0);
    if (prev !== state.currentSlide) {
      setTimeout(() => set({ isTransitioning: false }), 800);
      return {
        currentSlide: prev,
        chapter: getChapter(prev),
        isInteriorMode: false,
        isTransitioning: true
      };
    }
    return state;
  }),

  setCarColor: (color) => set({ carColor: color }),
  setWheelStyle: (style) => set({ wheelStyle: style }),
  setInteriorTheme: (theme) => set({ interiorTheme: theme }),
  setPackageTier: (tier) => set({ packageTier: tier }),

  toggleInteriorMode: () => set((state) => ({ isInteriorMode: !state.isInteriorMode })),
  toggleThermalMode: () => set((state) => ({ isThermalMode: !state.isThermalMode })),
  togglePolarized: () => set((state) => ({ isPolarized: !state.isPolarized })),

  revEngine: () => {
    // Haptic feedback for mobile devices (Android)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 40, 30, 100, 50, 200]);
    }
    set({ isEngineRevved: true, engineRevLevel: 1 });
    // Animate the rev level down
    let level = 1;
    const interval = setInterval(() => {
      level -= 0.1;
      if (level <= 0) {
        clearInterval(interval);
        set({ isEngineRevved: false, engineRevLevel: 0 });
      } else {
        set({ engineRevLevel: level });
      }
    }, 50);
  },

  setXrayMode: (active) => set({ xrayMode: active }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  setConfiguratorTab: (tab) => set({ configuratorTab: tab }),
}));
