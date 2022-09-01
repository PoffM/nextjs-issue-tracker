import { TRPCClientError } from "@trpc/client";
import { toPairs } from "lodash";
import { ReactNode, useState } from "react";
import { Path, UseFormReturn } from "react-hook-form";
import { VscError } from "react-icons/vsc";
import { UseMutationResult } from "react-query";
import type { AppRouter } from "../../server/routers/appRouter";
import {
  inferMutationInput,
  inferMutationOutput,
  trpc,
} from "../../utils/trpc";

type MutationKey = keyof AppRouter["_def"]["mutations"];

export interface MutationFormProps<
  TPath extends MutationKey,
  TMutationInput extends inferMutationInput<TPath> = inferMutationInput<TPath>,
  TMutationOutput extends inferMutationOutput<TPath> = inferMutationOutput<TPath>
> {
  form: UseFormReturn<TMutationInput>;
  mutation: UseMutationResult<
    TMutationOutput,
    ReturnType<typeof trpc.useMutation>["error"],
    TMutationInput
  >;
  onSuccess?: OnSuccessFn<TPath, TMutationInput, TMutationOutput>;
  preSubmitTransform?: (formValues: TMutationInput) => TMutationInput;
  children?: ReactNode;
}

export type OnSuccessFn<
  TPath extends MutationKey,
  TMutationInput = inferMutationInput<TPath>,
  TMutationOutput = inferMutationOutput<TPath>,
  TFormShape = TMutationInput
> = (args: {
  form: UseFormReturn<TFormShape>;
  data: TMutationOutput;
}) => Promise<unknown> | void;

/**
 * Renders a form that:
 * * Submits the data with a TRPC mutation.
 * * Provides form and field error messages from the back-end.
 */
export function MutationForm<
  TPath extends MutationKey,
  TInput extends inferMutationInput<TPath> = inferMutationInput<TPath>,
  TOutput extends inferMutationOutput<TPath> = inferMutationOutput<TPath>
>({
  children,
  form,
  mutation,
  onSuccess,
  preSubmitTransform,
}: MutationFormProps<TPath, TInput, TOutput>) {
  // Top-level form error message:
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (formValues) => {
    const input = preSubmitTransform?.(formValues) ?? formValues;

    setFormError(null);
    try {
      const data = await mutation.mutateAsync(input, {
        onError: (error) => {
          if (!error) return;

          const zodError = error.data?.zodError;
          if (zodError) {
            for (const [field, messages] of toPairs(zodError.fieldErrors)) {
              const message = messages?.join(", ");
              if (message) {
                form.setError(field as Path<TInput>, { message });
              }
            }
            const formErrorMessage = zodError.formErrors?.join(", ");
            if (formErrorMessage) {
              setFormError(formErrorMessage);
            }
          } else {
            setFormError(error.message);
          }
        },
      });
      await onSuccess?.({ data, form });
    } catch (error) {
      // TRPC errors are already handled in the "onError" callback;
      // Handle non-trpc errors here:
      if (error instanceof Error && !(error instanceof TRPCClientError)) {
        setFormError(error.message);
      }
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)}>
      {formError && (
        <div className="alert alert-error shadow-lg">
          <div>
            <VscError />
            <span>{formError}</span>
          </div>
        </div>
      )}
      {children}
    </form>
  );
}
