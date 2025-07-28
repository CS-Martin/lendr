import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ViewMode = 'grid' | 'list';

interface CardViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useCardViewModeStore = create<CardViewModeState>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
    }),
    {
      name: 'card-view-mode-cache',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Simple hook to get current view mode
export const useViewMode = () => useCardViewModeStore((state) => state.viewMode);

// Simple hook to set view mode
export const useSetViewMode = () => useCardViewModeStore((state) => state.setViewMode);
