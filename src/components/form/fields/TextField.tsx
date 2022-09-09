import clsx from "clsx";
import { ComponentProps, ReactNode } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { FieldProps, FieldWrapper } from "./FieldWrapper";

export interface TextFieldProps extends FieldProps<string> {
  textarea?: boolean;
  /** Custom input element. */
  inputElement?: (props: ComponentProps<"input">) => ReactNode;
}

interface TextChangeEvent {
  target: { value?: string };
}

export function TextField({
  textarea,
  inputElement,
  ...fieldWrapperProps
}: TextFieldProps) {
  return (
    <FieldWrapper {...fieldWrapperProps}>
      {({ fieldProps: { onChange, ...fieldProps }, fieldState: { error } }) => {
        const inputProps = {
          ...fieldProps,
          onChange: (e: TextChangeEvent) => onChange(e.target.value),
          className: clsx(
            "w-full",
            textarea ? "textarea textarea-bordered" : "input input-bordered",
            error && "input-error"
          ),
        };

        return (
          inputElement?.(inputProps) ??
          (textarea ? (
            <TextareaAutosize minRows={3} {...inputProps} />
          ) : (
            <input type="text" {...inputProps} />
          ))
        );
      }}
    </FieldWrapper>
  );
}
