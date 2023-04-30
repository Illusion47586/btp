import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ModelState {
  loadedFraction: number;
  name: string;
}

export const useModelStore = create<ModelState>()(
  devtools((set) => ({
    name: "",
    loadedFraction: 0,
  }))
);
