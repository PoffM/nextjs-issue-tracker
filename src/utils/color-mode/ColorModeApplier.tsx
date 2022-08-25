import { useLayoutEffect } from "react";
import { useColorMode } from "./useColorMode";

export function ColorModeApplier() {
  const { colorMode } = useColorMode();

  useLayoutEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(colorMode);
    document.documentElement.setAttribute("data-theme", colorMode);
  }, [colorMode]);

  return null;
}
