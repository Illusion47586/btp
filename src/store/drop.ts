import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface DropState {
  fileList: File[];
  inDropZone: boolean;
  setInDropZone: (isInDropZone: boolean) => void;
  addFilesToList: (files: File[]) => void;
  clearFiles: () => void;
}

export const useDropStore = create<DropState>()(
  devtools((set) => ({
    fileList: [],
    inDropZone: false,
    setInDropZone: (isInDropZone) => set({ inDropZone: isInDropZone }),
    addFilesToList: (files) =>
      set(({ fileList, inDropZone }) => ({
        inDropZone,
        fileList: fileList.concat(files),
      })),
    clearFiles: () => set({ inDropZone: false, fileList: [] }),
  }))
);
