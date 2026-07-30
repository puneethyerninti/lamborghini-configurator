import { create } from 'zustand';

interface ConfigState {
  carColor: string;
  setCarColor: (color: string) => void;
}

export const useConfiguratorStore = create<ConfigState>((set) => ({
  carColor: '#ffffff', // default white
  setCarColor: (color) => set({ carColor: color })
}));
