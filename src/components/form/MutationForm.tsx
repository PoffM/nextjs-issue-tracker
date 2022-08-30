import { TRPCClientError } from "@trpc/client";
import { toPairs } from "lodash";
import { ReactNode, useState } from "react";
import { Path, UseFormReturn } from "react-hook-form";
import { UseMutationResult } from "react-query";
import type { AppRouter } from "../../server/routers/appRouter";
import {
  inferMutationInput,
  inferMutationOutput,
  trpc,
} from "../../utils/trpc";
import { VscError } from "react-icons/vsc";

type MutationKey = keyof AppRouter["_def"]["mutations"];

export interface MutationFormProps<
  TPath extends MutationKey,
  TInput = inferMutationInput<TPath>,
  TOutput = inferMutationOutput<TPath>
> {
  form: UseFormReturn<TInput>;
  mutation: UseMutationResult<
    TOutput,
    ReturnType<typeof trpc.useMutation>["error"],
    TInput
  >;
  onSuccess?: OnSuccessFn<TPath, TInput, TOutput>;
  children?: ReactNode;
}

export type OnSuccessFn<
  TPath extends MutationKey,
  TInput = inferMutationInput<TPath>,
  TOutput = inferMutationOutput<TPath>
> = (args: {
  form: UseFormReturn<TInput>;
  data: TOutput;
}) => Promise<unknown> | void;

/**
 * Renders a form that:
 * * Submits the data with a TRPC mutation.
 * * Provides form and field error messages from the back-end.
 */
export function MutationForm<
  TPath extends MutationKey,
  TInput = inferMutationInput<TPath>,
  TOutput = inferMutationOutput<TPath>
>({
  children,
  form,
  mutation,
  onSuccess,
}: MutationFormProps<TPath, TInput, TOutput>) {
  // Top-level form error message:
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (input) => {
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
