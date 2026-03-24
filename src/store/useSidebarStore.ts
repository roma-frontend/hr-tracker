import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setCollapsed: (val: boolean) => void;
  setMobileOpen: (val: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (val) => set({ collapsed: val }),
      setMobileOpen: (val) => set({ mobileOpen: val }),
    }),
    {
      name: "sidebar-store",
      skipHydration: true,
    }
  )
);

/**
 * Оптимизированные селекторы для sidebar store
 * Используем для предотвращения лишних ре-рендеров
 */
export const useSidebarCollapsed = () => useSidebarStore((state) => state.collapsed, shallow)
export const useSidebarMobileOpen = () => useSidebarStore((state) => state.mobileOpen, shallow)
export const useSidebarToggle = () => useSidebarStore((state) => state.toggle, shallow)
export const useSidebarSetCollapsed = () => useSidebarStore((state) => state.setCollapsed, shallow)
export const useSidebarSetMobileOpen = () => useSidebarStore((state) => state.setMobileOpen, shallow)

/**
 * Оптимизированный хук для использования sidebar store с shallow comparison
 */
export function useSidebarStoreShallow() {
  return useSidebarStore(
    (state) => ({
      collapsed: state.collapsed,
      mobileOpen: state.mobileOpen,
      toggle: state.toggle,
      setCollapsed: state.setCollapsed,
      setMobileOpen: state.setMobileOpen,
    }),
    shallow
  )
}
