import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";
import { useForm } from "react-hook-form";

export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  formCtx: Pick<ReturnType<typeof useForm>, "formState">;
}

export function SubmitButton({ formCtx, ...buttonProps }: SubmitButtonProps) {
  const isLoading = formCtx.formState.isSubmitting;
  return (
    <button
      type="submit"
      {...buttonProps}
      className={clsx(
        "btn btn-accent min-w-[120px]",
        isLoading && "loading",
        buttonProps.className
      )}
    >
      {isLoading ? "" : buttonProps.children ?? "Submit"}
    </button>
  );
}
