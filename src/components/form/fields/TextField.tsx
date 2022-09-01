import clsx from "clsx";
import { startCase } from "lodash";
import { ChangeEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { FieldProps } from "../useTypeForm";

export interface TextFieldProps extends FieldProps<string> {
  className?: string;
  label?: string;
  textarea?: boolean;
}

export function TextField({
  field,
  className,
  label,
  textarea,
}: TextFieldProps) {
  const {
    fieldState: { error },
    fieldProps: { onChange, ...fieldProps },
  } = field.useController();

  const labelText = label ?? startCase(fieldProps.name);

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

  return (
    <div className={clsx("form-control", className)}>
      <label>
        <div className="label">
          <span className={clsx("label-text font-bold", error && "text-error")}>
            {labelText}
          </span>
        </div>
        {textarea ? (
          <TextareaAutosize minRows={3} {...inputProps} />
        ) : (
          <input type="text" {...inputProps} />
        )}
        {error && (
          <div className="label">
            <span className="label-text-alt text-error">{error.message}</span>
          </div>
        )}
      </label>
    </div>
  );
}
