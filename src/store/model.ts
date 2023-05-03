import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ModelState {
  loadedFraction: number;
  name: string;
  state: "selecting" | "analyzing" | "done";
  changeStateTo: (state: "selecting" | "analyzing" | "done") => void;
}

export const useModelStore = create<ModelState>()(
  devtools((set) => ({
    name: "",
    loadedFraction: 0,
    state: "selecting",
    changeStateTo: (state) => set({ state }),
  }))
);
