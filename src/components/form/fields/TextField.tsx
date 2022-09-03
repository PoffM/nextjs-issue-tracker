import clsx from "clsx";
import { ChangeEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { FieldProps, FieldWrapper } from "./FieldWrapper";

export interface TextFieldProps extends FieldProps<string> {
  textarea?: boolean;
}

export function TextField({ textarea, ...fieldWrapperProps }: TextFieldProps) {
  return (
    <FieldWrapper {...fieldWrapperProps}>
      {({ fieldProps: { onChange, ...fieldProps }, fieldState: { error } }) => {
        const inputProps = {
          ...fieldProps,
          onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange(e.target.value),
          className: clsx(
            "w-full",
            textarea ? "textarea textarea-bordered" : "input input-bordered",
            error && "input-error"
          ),
        };

        return textarea ? (
          <TextareaAutosize minRows={3} {...inputProps} />
        ) : (
          <input type="text" {...inputProps} />
        );
      }}
    </FieldWrapper>
  );
}
