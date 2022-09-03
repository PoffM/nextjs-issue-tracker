import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { useColorMode } from "./useColorMode";

export function ColorModeToggleButton() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <button type="button" onClick={toggleColorMode} className="btn btn-outline">
      {colorMode === "dark" ? (
        <BsSunFill size="20px" />
      ) : (
        <BsMoonFill size="20px" />
      )}
    </button>
  );
}
