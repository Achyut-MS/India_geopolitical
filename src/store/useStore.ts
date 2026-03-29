// ═══════════════════════════════════════════════════════════
// Bharat Lens — Zustand Store
// ═══════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { AppState } from '../types';

export const useStore = create<AppState>((set) => ({
  selectedState: null,
  selectedDistrict: null,
  zoomLevel: 4.5,
  fullyVisibleStateCount: 0,
  activeColourMode: 'sentiment',
  activeMapStyle: 'political',
  isPanelOpen: false,
  hoveredStateId: null,
  adminBreadcrumb: ['India'],
  cursorPosition: null,
  isLoading: false,

  selectState: (state) =>
    set({
      selectedState: state,
      selectedDistrict: null,
      isPanelOpen: state !== null,
      adminBreadcrumb: state ? ['India', state.name] : ['India'],
    }),

  selectDistrict: (district) =>
    set((prev) => ({
      selectedDistrict: district,
      adminBreadcrumb: district && prev.selectedState
        ? ['India', prev.selectedState.name, district.name]
        : prev.adminBreadcrumb,
    })),

  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),

  setFullyVisibleStateCount: (count) => set({ fullyVisibleStateCount: count }),

  setColourMode: (mode) => set({ activeColourMode: mode }),

  setMapStyle: (style) => set({ activeMapStyle: style }),

  togglePanel: (open) =>
    set((state) => ({
      isPanelOpen: open !== undefined ? open : !state.isPanelOpen,
    })),

  setHoveredState: (id) => set({ hoveredStateId: id }),

  setBreadcrumb: (crumbs) => set({ adminBreadcrumb: crumbs }),

  setCursorPosition: (pos) => set({ cursorPosition: pos }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
