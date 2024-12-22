import { create } from "zustand";
import { APPS } from "@/lib/consts";
import { CheckWebP } from "../../wailsjs/go/main/App";

type AppType = (typeof APPS)[keyof typeof APPS];

interface AppState {
  selectedApp: AppType;
  setSelectedApp: (app: AppType) => void;
  png2webp: {
    isWebPInstalled: boolean;
    targetFolder: string;
    setWebPInstalled: (installed: boolean) => void;
    checkWebPInstallation: () => Promise<void>;
    setTargetFolder: (folder: string) => void;
  };
}

export const useAppStore = create<AppState>((set) => ({
  selectedApp: APPS.PNG2WEBP,
  setSelectedApp: (app) => set({ selectedApp: app }),
  png2webp: {
    isWebPInstalled: false,
    targetFolder: "",
    setTargetFolder: (folder: string) =>
      set((state) => ({
        png2webp: { ...state.png2webp, targetFolder: folder },
      })),
    setWebPInstalled: (installed) =>
      set((state) => ({
        png2webp: { ...state.png2webp, isWebPInstalled: installed },
      })),
    checkWebPInstallation: async () => {
      const installed = await CheckWebP();
      set((state) => ({
        png2webp: { ...state.png2webp, isWebPInstalled: installed },
      }));
    },
  },
}));
