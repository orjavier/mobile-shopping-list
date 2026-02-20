import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

export { Colors as themeColors };

export const useTheme = () => {
  const theme = useColorScheme() ?? "light";
  const isDarkMode = theme === "dark";
  const colors = Colors[theme];

  return {
    theme,
    isDarkMode,
    colors,
    color: Colors,
  };
};
