import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GlobalState {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const Category = create<GlobalState>()(
  persist(
    (set) => ({
      selectedCategory: "Select Category",
      setSelectedCategory: (category) => set({ selectedCategory: category }),
    }),
    {
      name: "global-storage", // key for localStorage
    }
  )
);
