import clsx from "clsx";
import { startCase } from "lodash";
import { ReactNode } from "react";
import { FieldController, FieldHandle } from "../useTypeForm";

export interface FieldProps<T> {
  className?: string;
  label?: string;
  field: FieldHandle<T>;
}

export interface FieldWrapperProps<T> extends FieldProps<T> {
  children: (controller: FieldController<T>) => ReactNode;
}

export function FieldWrapper<T>({
  className,
  children,
  field,
  label = startCase(field.name),
}: FieldWrapperProps<T>) {
  const controller = field.useController();
  const {
    fieldState: { error },
  } = controller;

  return (
    <div className={clsx("form-control", className)}>
      <label>
        <div className="label">
          <span className={clsx("label-text font-bold", error && "text-error")}>
            {label}
          </span>
        </div>
        {children(controller)}
        {error && (
          <div className="label">
            <span className="label-text-alt text-error">{error.message}</span>
          </div>
        )}
      </label>
    </div>
  );
}
