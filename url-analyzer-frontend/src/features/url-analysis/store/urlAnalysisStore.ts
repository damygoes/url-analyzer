import { create } from 'zustand';

interface URLAnalysisStoreState {
  analyzingIDs: number[];
  setAnalyzingIDs: (ids: number[]) => void;
}

export const useURLAnalysisStore = create<URLAnalysisStoreState>((set) => ({
  analyzingIDs: [],
  setAnalyzingIDs: (ids) => set({ analyzingIDs: ids }),
}));
