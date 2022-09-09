import clsx from "clsx";
import { startCase } from "lodash";
import { ReactNode } from "react";
import { FieldController, FieldHandle } from "../useTypeForm";

export interface FieldProps<T> {
  className?: string;
  label?: string;
  field: FieldHandle<T>;
  /** Layout direction. Default is column. */
  dir?: "row" | "column";
}

export interface FieldWrapperProps<T> extends FieldProps<T> {
  children: (controller: FieldController<T>) => ReactNode;
}

export function FieldWrapper<T>({
  className,
  children,
  field,
  label = startCase(field.name),
  dir,
}: FieldWrapperProps<T>) {
  const controller = field.useController();
  const {
    fieldState: { error },
  } = controller;

  return (
    <div className={clsx("form-control", className)}>
      <label className={clsx(dir === "row" && "flex flex-row gap-1")}>
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
