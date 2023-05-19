import { useMemo } from "react";
import { GroupBase, StylesConfig } from "react-select";
import { useColorMode } from "../../color-mode/useColorMode";

interface useReactSelectStyleReturn<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
> {
  styles: StylesConfig<Option, IsMulti, Group>;
}

/**
 * Returns the react-select styles prop to make sure react-select
 * looks good in a DaisyUI app.
 */
export function useReactSelectStyle<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(): useReactSelectStyleReturn<Option, IsMulti, Group> {
  const { colorMode } = useColorMode();

  return useMemo(() => {
    const colors = {
      borderColor: "hsl(var(--bc) / var(--tw-border-opacity))",
      base100: "hsla(var(--b1) / var(--tw-bg-opacity, 1))",
      // For the hovered menu option:
      // Light color in light mode / dark color in dark mode:
      hoveredOptionBgColor: `hsl(216, 100%, ${
        colorMode === "dark" ? "20%" : "94%"
      })`,
    };

    return {
      // input-bordered gives the input the same border
      // opacity/color as the other daisyUI inputs:
      className: "input-bordered",
      styles: {
        control: (base) => ({
          ...base,
          backgroundColor: colors.base100,
          borderColor: colors.borderColor,
          height: "3rem",
          borderRadius: "var(--rounded-btn, 0.5rem)",
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: colors.base100,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor:
            state.isFocused && !state.isSelected
              ? colors.hoveredOptionBgColor
              : base.backgroundColor,
        }),
        singleValue: (base) => ({ ...base, color: "inherit" }),
        multiValue: (base) => ({ ...base, color: "inherit" }),
        indicatorSeparator: (base) => ({
          ...base,
          backgroundColor: colors.borderColor,
        }),
        input: (base) => ({ ...base, color: "inherit" }),
      },
    };
  }, [colorMode]);
}
