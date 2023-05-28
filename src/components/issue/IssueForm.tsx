"use client";

import { Issue } from "@prisma/client";
import { useRouter } from "next/navigation";
import { shallowDiff } from "../../utils/object-shallow-diff";
import { inferProcedureInput, trpc } from "../../utils/trpc";
import { ErrorAlert } from "../ErrorAlert";
import { SubmitButton } from "../form/SubmitButton";
import { IssueStatusField } from "../form/fields/IssueStatusField";
import { TextField } from "../form/fields/TextField";
import { MutationForm } from "../form/form-utils/MutationForm";
import { useTypeForm } from "../form/form-utils/useTypeForm";

export interface IssueFormProps {
  id?: number;
}

export function IssueForm({ id }: IssueFormProps) {
  const { data: issue, error } = trpc.issue.findOne.useQuery(
    { id: id ?? NaN },
    { enabled: id !== undefined }
  );

  const router = useRouter();

  function onSuccess(data: Issue) {
    router.push(`/issue/${data.id}`);
  }

  const formProps = { onSuccess };

  return (
    <div className="w-full max-w-[600px]">
      <ErrorAlert error={error} />
      {id ? (
        issue && <IssueUpdateForm data={issue} {...formProps} />
      ) : (
        <IssueCreateForm {...formProps} />
      )}
    </div>
  );
}

interface IssueCreateFormProps {
  onSuccess: (data: Issue) => void | Promise<unknown>;
}

function IssueCreateForm({ onSuccess }: IssueCreateFormProps) {
  const form = useTypeForm<inferProcedureInput<"issue.create">>({
    defaultValues: { status: "NEW" },
  });

  const mutation = trpc.issue.create.useMutation();

  return (
    <MutationForm<"issue.create">
      form={form}
      mutation={mutation}
      onSuccess={async ({ data }) => onSuccess(data)}
    >
      <IssueFormFields form={form} />
    </MutationForm>
  );
}

interface IssueUpdateFormProps {
  data: Issue;
  onSuccess: (data: Issue) => void | Promise<unknown>;
}

function IssueUpdateForm({ data: issue, onSuccess }: IssueUpdateFormProps) {
  const {
    id: issueId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createdAt,
    ...defaultValues
  } = issue;

  const form = useTypeForm<inferProcedureInput<"issue.addEvent">>({
    defaultValues,
  });

  const mutation = trpc.issue.addEvent.useMutation();

  const ctx = trpc.useContext();

  return (
    <MutationForm<"issue.addEvent">
      form={form}
      mutation={mutation}
      onSuccess={async ({ data }) => {
        await ctx.issue.findOne.invalidate({ id: data.issue.id });
        await onSuccess(data.issue);
      }}
      preSubmitTransform={(data) => ({
        // Only submit changed values:
        ...shallowDiff(defaultValues, data),
        issueId,
      })}
    >
      <IssueFormFields form={form} />
    </MutationForm>
  );
}

export interface IssueFormFieldsProps {
  form: Pick<
    ReturnType<typeof useTypeForm<inferProcedureInput<"issue.create">>>,
    "formState" | "field"
  >;
}

/** Form fields which are common between the Create and Edit forms. */
export function IssueFormFields({ form }: IssueFormFieldsProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <TextField field={form.field("title")} className="grow" />
        <IssueStatusField field={form.field("status")} />
      </div>
      <TextField field={form.field("description")} textarea />
      <div className="flex justify-end">
        <SubmitButton formCtx={form} />
      </div>
    </div>
  );
}
