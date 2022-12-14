import useLocalStorage from "@rehooks/local-storage";

export function useColorMode() {
  const initialColorMode = globalThis.matchMedia
    ? globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : "dark";

  const [colorMode, setColorMode] = useLocalStorage(
    "color-mode",
    initialColorMode
  );

  function toggleColorMode() {
    setColorMode(colorMode === "dark" ? "light" : "dark");
  }

  return { colorMode, setColorMode, toggleColorMode };
}
