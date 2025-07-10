import { SortOrder, type URLFilter, URLSortField } from '@/shared/types/api';
import { create } from 'zustand';

interface URLState {
  filters: URLFilter;
  setFilters: (filters: Partial<URLFilter>) => void;
  resetFilters: () => void;
  selectedURLs: number[];
  toggleSelection: (id: number) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;
  // UI State
  isAddingURL: boolean;
  setIsAddingURL: (isAdding: boolean) => void;
}

const defaultFilters: URLFilter = {
  page: 1,
  page_size: 10,
  sort_by: URLSortField.CREATED_AT,
  sort_order: SortOrder.DESC,
};

export const useURLStore = create<URLState>((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
  resetFilters: () => {
    set({ filters: defaultFilters });
  },
  selectedURLs: [],
  toggleSelection: (id) => {
    set((state) => ({
      selectedURLs: state.selectedURLs.includes(id)
        ? state.selectedURLs.filter((urlId) => urlId !== id)
        : [...state.selectedURLs, id],
    }));
  },
  selectAll: (ids) => {
    set({ selectedURLs: ids });
  },
  clearSelection: () => {
    set({ selectedURLs: [] });
  },
  isAddingURL: false,
  setIsAddingURL: (isAdding) => {
    set({ isAddingURL: isAdding });
  },
}));