import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { useDarkMode } from "usehooks-ts";

export function ColorModeToggleButton() {
  const { isDarkMode, toggle } = useDarkMode(true);

  return (
    <button type="button" onClick={toggle} className="btn-outline btn">
      {isDarkMode ? <BsSunFill size="20px" /> : <BsMoonFill size="20px" />}
    </button>
  );
}
