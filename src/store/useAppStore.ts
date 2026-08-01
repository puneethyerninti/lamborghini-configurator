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
  
  // Modes
  isInteriorMode: boolean;
  isEngineRevved: boolean;
  engineRevLevel: number;
  
  // Actions
  setSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setCarColor: (color: string) => void;
  setWheelStyle: (style: 0 | 1 | 2) => void;
  setInteriorTheme: (theme: 'nero' | 'bianco' | 'arancio') => void;
  setPackageTier: (tier: 'standard' | 'magnolia' | 'svj63') => void;
  toggleInteriorMode: () => void;
  revEngine: () => void;
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
  
  isInteriorMode: false,
  isEngineRevved: false,
  engineRevLevel: 0,
  
  setSlide: (index) => set({ 
    currentSlide: index, 
    chapter: getChapter(index),
    isInteriorMode: false 
  }),
  
  nextSlide: () => set((state) => {
    const next = Math.min(state.currentSlide + 1, state.totalSlides - 1);
    return { 
      currentSlide: next,
      chapter: getChapter(next),
      isInteriorMode: false 
    };
  }),
  
  prevSlide: () => set((state) => {
    const prev = Math.max(state.currentSlide - 1, 0);
    return { 
      currentSlide: prev,
      chapter: getChapter(prev),
      isInteriorMode: false 
    };
  }),
  
  setCarColor: (color) => set({ carColor: color }),
  setWheelStyle: (style) => set({ wheelStyle: style }),
  setInteriorTheme: (theme) => set({ interiorTheme: theme }),
  setPackageTier: (tier) => set({ packageTier: tier }),
  
  toggleInteriorMode: () => set((state) => ({ isInteriorMode: !state.isInteriorMode })),
  
  revEngine: () => {
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
  }
}));
