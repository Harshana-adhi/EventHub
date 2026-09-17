import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const light = {
  background: "#f4f4f5",
  surface: "#ffffff",
  surfaceAlt: "#fafafa",
  text: "#111111",
  textSecondary: "#666666",
  border: "#dddddd",
  placeholder: "#9a9a9a",
  primary: "#4630eb",
  primarySoft: "#efecfd",
  primaryText: "#4630eb",
  danger: "#cc0000",
  dangerSoft: "#fde2e2",
  success: "#0a7d2c",
  overlay: "#eeeeee",
};

const dark = {
  background: "#121212",
  surface: "#1e1e1e",
  surfaceAlt: "#262626",
  text: "#f2f2f2",
  textSecondary: "#a3a3a3",
  border: "#3a3a3a",
  placeholder: "#8a8a8a",
  primary: "#7c6cf0",
  primarySoft: "#2a2350",
  primaryText: "#b3a4fa",
  danger: "#ff6b6b",
  dangerSoft: "#3a1f1f",
  success: "#4ade80",
  overlay: "#2a2a2a",
};

export type ThemeColors = typeof light;
export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "themeMode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") setModeState(saved);
      })
      .catch(() => {});
  }, []);

  function setMode(newMode: ThemeMode) {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {});
  }

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const colors = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ colors, mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("Theme hooks must be used within ThemeProvider");
  return ctx;
}

export function useThemeColors(): ThemeColors {
  return useThemeContext().colors;
}

export function useThemeMode() {
  const { mode, isDark, setMode } = useThemeContext();
  return { mode, isDark, setMode };
}
