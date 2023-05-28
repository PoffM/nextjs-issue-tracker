import { useDarkMode, useIsomorphicLayoutEffect } from "usehooks-ts";

/**
 * Applies the color mode from localstorage to the document element.
 * Needed for Tailwind and DaisyUI.
 */
export function ColorModeApplier() {
  const { isDarkMode } = useDarkMode(true);

  const colorMode = isDarkMode ? "dark" : "light";

  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(colorMode);
    document.documentElement.setAttribute("data-theme", colorMode);
  }, [colorMode]);

  return null;
}
