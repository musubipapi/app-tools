import { ConversionStatus } from "@/lib/types";
import { create } from "zustand";

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  data: number[];
  conversionStatus: ConversionStatus;
}

interface FileStore {
  files: FileInfo[];
  addFile: (file: File) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFileConversionStatus: (id: string, status: ConversionStatus) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],

  addFile: async (file: File) => {
    const data = await file.arrayBuffer();
    const uint8Array = new Uint8Array(data);
    const byteArray = Array.from(uint8Array);
    const fileInfo: FileInfo = {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      data: byteArray,
      name: file.name,
      size: file.size,
      type: file.type,
      conversionStatus: ConversionStatus.Pending,
    };

    set((state) => ({
      files: [...state.files, fileInfo],
    }));
  },
  updateFileConversionStatus: (id: string, status: ConversionStatus) => {
    set((state) => {
      const newState = {
        files: state.files.map((file) =>
          file.id === id ? { ...file, conversionStatus: status } : file
        ),
      };
      return newState;
    });
  },

  removeFile: (id: string) => {
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
    }));
  },
  clearFiles: () => {
    set({ files: [] });
  },
}));
