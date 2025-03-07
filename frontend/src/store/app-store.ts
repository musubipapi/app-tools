import { create } from "zustand";
import { APPS } from "@/lib/consts";

type AppType = (typeof APPS)[keyof typeof APPS];

interface AppState {
  selectedApp: AppType;
  setSelectedApp: (app: AppType) => void;
  getPrimaryColor: {
    primaryColor:
      | { rgb: { r: number; g: number; b: number }; hex: string }
      | undefined;
    setPrimaryColor: (
      rgb: { r: number; g: number; b: number },
      hex: string
    ) => void;
    neurons: number;
    epochs: number;
    setNeurons: (neurons: number) => void;
    setEpochs: (epochs: number) => void;
  };
  png2webp: {
    targetFolder: string;
    setWebPInstalled: (installed: boolean) => void;
    setTargetFolder: (folder: string) => void;
  };
}

export const useAppStore = create<AppState>((set) => ({
  selectedApp: APPS.PNG2WEBP,
  setSelectedApp: (app) => set({ selectedApp: app }),
  getPrimaryColor: {
    primaryColor: undefined,
    neurons: 64,
    epochs: 20,
    setPrimaryColor: (rgb, hex) =>
      set((state) => ({
        getPrimaryColor: {
          ...state.getPrimaryColor,
          primaryColor: { rgb, hex },
        },
      })),
    setNeurons: (neurons: number) =>
      set((state) => ({
        getPrimaryColor: {
          ...state.getPrimaryColor,
          neurons,
        },
      })),
    setEpochs: (epochs: number) =>
      set((state) => ({
        getPrimaryColor: {
          ...state.getPrimaryColor,
          epochs,
        },
      })),
  },
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
