import { create } from "zustand";
import { APPS } from "@/lib/consts";

type AppType = (typeof APPS)[keyof typeof APPS];

interface AppState {
  selectedApp: AppType;
  setSelectedApp: (app: AppType) => void;
  png2webp: {
    targetFolder: string;
    setWebPInstalled: (installed: boolean) => void;
    setTargetFolder: (folder: string) => void;
  };
}

export const useAppStore = create<AppState>((set) => ({
  selectedApp: APPS.PNG2WEBP,
  setSelectedApp: (app) => set({ selectedApp: app }),
  png2webp: {
    targetFolder: "",
    setTargetFolder: (folder: string) =>
      set((state) => ({
        png2webp: { ...state.png2webp, targetFolder: folder },
      })),
    setWebPInstalled: (installed) =>
      set((state) => ({
        png2webp: { ...state.png2webp, isWebPInstalled: installed },
      })),
  },
}));
