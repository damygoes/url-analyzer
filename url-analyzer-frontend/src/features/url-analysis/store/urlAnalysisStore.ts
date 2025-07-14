import { create } from 'zustand';

interface URLAnalysisStoreState {
  analyzingIDs: number[];
  setAnalyzingIDs: (ids: number[]) => void;
  addAnalyzingIDs: (ids: number[]) => void;
  removeAnalyzingIDs: (ids: number[]) => void;
}

export const useURLAnalysisStore = create<URLAnalysisStoreState>(
  (set, get) => ({
    analyzingIDs: [],
    setAnalyzingIDs: (ids) => set({ analyzingIDs: ids }),
    addAnalyzingIDs: (ids) =>
      set({
        analyzingIDs: [...new Set([...get().analyzingIDs, ...ids])],
      }),
    removeAnalyzingIDs: (ids) =>
      set({
        analyzingIDs: get().analyzingIDs.filter((id) => !ids.includes(id)),
      }),
  })
);
