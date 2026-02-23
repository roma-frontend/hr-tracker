import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    { name: "sidebar-store" }
  )
);
