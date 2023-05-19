import { useLayoutEffect } from "react";
import { useDarkMode } from "usehooks-ts";

/**
 * Layout effect that only runs in the browser.
 * Avoids the warning log from Next.js.
 */
const useBrowserLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : () => undefined;

/**
 * Applies the color mode from localstorage to the document element.
 * Needed for Tailwind and DaisyUI.
 */
export function ColorModeApplier() {
  const { isDarkMode } = useDarkMode(true);

  const colorMode = isDarkMode ? "dark" : "light";

  useBrowserLayoutEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(colorMode);
    document.documentElement.setAttribute("data-theme", colorMode);
  }, [colorMode]);

  return null;
}
