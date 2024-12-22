import { create } from "zustand";

export interface FileInfo {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  lastModified: number;
}

interface FileStore {
  files: FileInfo[];
  addFile: (file: File) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],

  addFile: async (file: File) => {
    const fileInfo: FileInfo = {
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };

    set((state) => ({
      files: [...state.files, fileInfo],
    }));
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
