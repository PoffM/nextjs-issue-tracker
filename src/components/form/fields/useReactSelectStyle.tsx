import clsx from "clsx";
import { useMemo } from "react";
import { GroupBase, StylesConfig } from "react-select";

interface useReactSelectStyleReturn<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
> {
  className: string;
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
>(className?: string): useReactSelectStyleReturn<Option, IsMulti, Group> {
  return useMemo(() => {
    const colors = {
      borderColor: "hsl(var(--bc) / var(--tw-border-opacity))",
      base100: "hsla(var(--b1) / var(--tw-bg-opacity, 1))",
    };

    return {
      // input-bordered gives the input the same border
      // opacity/color as the other daisyUI inputs
      className: clsx("input-bordered", className),
      styles: {
        control: (base) => ({
          ...base,
          backgroundColor: colors.base100,
          borderColor: colors.borderColor,
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: colors.base100,
        }),
        option: (base, state) => ({
          ...base,
          color: state.isFocused && !state.isSelected ? "black" : base.color,
        }),
        singleValue: (base) => ({ ...base, color: "inherit" }),
        multiValue: (base) => ({ ...base, color: "inherit" }),
        indicatorSeparator: (base) => ({
          ...base,
          backgroundColor: colors.borderColor,
        }),
      },
    };
  }, [className]);
}
