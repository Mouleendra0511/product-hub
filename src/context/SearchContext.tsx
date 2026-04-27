import { createContext, useContext, useState, ReactNode } from "react";

interface SearchCtx {
  keyword: string;
  setKeyword: (v: string) => void;
}

const Ctx = createContext<SearchCtx | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [keyword, setKeyword] = useState("");
  return <Ctx.Provider value={{ keyword, setKeyword }}>{children}</Ctx.Provider>;
}

export function useSearch(): SearchCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}