"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Variant = {
  id: string;
  lines: number;
  seed: number;
  sequence: number[];
};

type VariantsContextType = {
  variants: Variant[];
  setVariants: (v: Variant[]) => void;
};

const VariantsContext = createContext<VariantsContextType | undefined>(undefined);

export const VariantsProvider = ({ children }: { children: ReactNode }) => {
  const [variants, setVariants] = useState<Variant[]>([]);

  return (
    <VariantsContext.Provider value={{ variants, setVariants }}>
      {children}
    </VariantsContext.Provider>
  );
};

export const useVariants = () => {
  const context = useContext(VariantsContext);
  if (!context) throw new Error("useVariants must be used within VariantsProvider");
  return context;
};