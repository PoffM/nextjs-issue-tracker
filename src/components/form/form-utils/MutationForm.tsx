import { ErrorMessage } from "@hookform/error-message";
import { UseMutationResult } from "@tanstack/react-query";
import { TRPCClientError, TRPCClientErrorLike } from "@trpc/client";
import { toPairs } from "lodash";
import { ReactNode } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import type { AppRouter } from "../../../server/routers/appRouter";
import {
  inferProcedureInput,
  inferProcedureOutput,
  RouteKey,
} from "../../../utils/trpc";
import { ErrorAlert } from "../../ErrorAlert";

export interface MutationFormProps<TPath extends RouteKey> {
  form: UseFormReturn<inferProcedureInput<TPath> & FieldValues>;
  mutation: UseMutationResult<
    inferProcedureOutput<TPath>,
    TRPCClientErrorLike<AppRouter>,
    inferProcedureInput<TPath>
  >;
  onSuccess?: OnSuccessFn<TPath>;
  preSubmitTransform?: (
    formValues: inferProcedureInput<TPath>
  ) => inferProcedureInput<TPath>;
  children?: ReactNode;
}

export type OnSuccessFn<TPath extends RouteKey> = (args: {
  form: UseFormReturn<inferProcedureInput<TPath> & FieldValues>;
  data: inferProcedureOutput<TPath>;
}) => Promise<unknown> | void;

/**
 * Renders a form that:
 * * Submits the data with a TRPC mutation.
 * * Provides form and field error messages from the back-end.
 */
export function MutationForm<TPath extends RouteKey>({
  children,
  form,
  mutation,
  onSuccess,
  preSubmitTransform,
}: MutationFormProps<TPath>) {
  const onSubmit = form.handleSubmit(async (formValues) => {
    const input = preSubmitTransform?.(formValues) ?? formValues;

    try {
      const data = await mutation.mutateAsync(input, {
        onError: (error) => {
          if (!error) return;

          const zodError = error.data?.zodError;
          if (zodError) {
            for (const [field, messages] of toPairs(zodError.fieldErrors)) {
              const message = messages?.join(", ");
              if (message) {
                // @ts-expect-error Unknown error keys shouldn't happen:
                form.setError(field, {
                  message,
                });
              }
            }
            const formErrorMessage = zodError.formErrors?.join(", ");
            if (formErrorMessage) {
              form.setError("root", { message: formErrorMessage });
            }
          } else {
            form.setError("root", { message: error.message });
          }
        },
      });
      await onSuccess?.({ data, form });
    } catch (error) {
      // TRPC errors are already handled in the "onError" callback;
      // Handle non-trpc errors here:
      if (error instanceof Error && !(error instanceof TRPCClientError)) {
        form.setError("root", { message: error.message });
      }
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)}>
      <ErrorMessage<FieldValues>
        errors={form.formState.errors}
        name="root"
        render={(error) => <ErrorAlert error={error} />}
      />
      {children}
    </form>
  );
}
