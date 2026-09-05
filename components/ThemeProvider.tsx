"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "sheet" | "board";
const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({ theme: "sheet", setTheme: () => {} });
export const useTheme = () => useContext(Ctx);

/** Inline script keeps the first paint on the right rendition (no flash). */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='sheet'&&t!=='board'){t=matchMedia('(prefers-color-scheme: dark)').matches?'board':'sheet'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("sheet");
  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "board" || t === "sheet") setThemeState(t);
  }, []);
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem("theme", t);
    } catch {}
  }, []);
  const v = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
