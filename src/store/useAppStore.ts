import { create } from 'zustand';

interface AppState {
  currentSlide: number;
  totalSlides: number;
  carColor: string;
  isInteriorMode: boolean;
  isEngineRevved: boolean;
  setSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setCarColor: (color: string) => void;
  toggleInteriorMode: () => void;
  revEngine: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentSlide: 0,
  totalSlides: 8,
  carColor: '#a10a0a', // Rosso Mars
  isInteriorMode: false,
  isEngineRevved: false,
  setSlide: (index) => set({ currentSlide: index, isInteriorMode: false }),
  nextSlide: () => set((state) => ({ 
    currentSlide: Math.min(state.currentSlide + 1, state.totalSlides - 1),
    isInteriorMode: false 
  })),
  prevSlide: () => set((state) => ({ 
    currentSlide: Math.max(state.currentSlide - 1, 0),
    isInteriorMode: false 
  })),
  setCarColor: (color) => set({ carColor: color }),
  toggleInteriorMode: () => set((state) => ({ isInteriorMode: !state.isInteriorMode })),
  revEngine: () => {
    set({ isEngineRevved: true });
    setTimeout(() => set({ isEngineRevved: false }), 800); // 800ms rev duration
  }
}));
