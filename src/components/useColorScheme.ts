import { useThemeStore } from "@/stores/themeStore";
import { useColorScheme as useNativeColorScheme } from "react-native";

export function useColorScheme() {
  const systemColorScheme = useNativeColorScheme();
  const theme = useThemeStore((state) => state.theme);

  if (theme === "system") {
    return systemColorScheme;
  }
  return theme;
}
