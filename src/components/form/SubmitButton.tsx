import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";
import { useForm } from "react-hook-form";

export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  formCtx: Pick<ReturnType<typeof useForm>, "formState">;
}

export function SubmitButton({ formCtx, ...buttonProps }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      {...buttonProps}
      className={clsx(
        "btn",
        formCtx.formState.isSubmitting && "loading",
        buttonProps.className
      )}
    >
      {buttonProps.children ?? "Submit"}
    </button>
  );
}
