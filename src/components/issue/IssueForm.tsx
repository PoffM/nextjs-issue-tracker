import { Issue } from "@prisma/client";
import { shallowDiff } from "../../utils/object-shallow-diff";
import { inferMutationInput, trpc } from "../../utils/trpc";
import { IssueStatusField } from "../form/fields/IssueStatusField";
import { TextField } from "../form/fields/TextField";
import { MutationForm } from "../form/MutationForm";
import { SubmitButton } from "../form/SubmitButton";
import { useTypeForm } from "../form/useTypeForm";

export interface IssueFormProps {
  id?: number;
  onSuccess?: (data: Issue) => void | Promise<void>;
}

export function IssueForm({ id, onSuccess }: IssueFormProps) {
  const { data: issue } = trpc.useQuery(["issue.findOne", { id: id ?? NaN }], {
    enabled: id !== undefined,
  });

  const formProps = { onSuccess };

  return (
    <div>
      {id ? (
        issue && <IssueUpdateForm data={issue} {...formProps} />
      ) : (
        <IssueCreateForm {...formProps} />
      )}
    </div>
  );
}

interface IssueCreateFormProps {
  onSuccess?: (data: Issue) => void | Promise<unknown>;
}

function IssueCreateForm({ onSuccess }: IssueCreateFormProps) {
  const form = useTypeForm<inferMutationInput<"issue.create">>({
    defaultValues: { status: "NEW" },
  });

  const mutation = trpc.useMutation(["issue.create"]);

  return (
    <MutationForm
      form={form}
      mutation={mutation}
      onSuccess={({ data }) => onSuccess?.(data)}
    >
      <IssueFormFields
        form={
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          form as any
        }
      />
    </MutationForm>
  );
}

interface IssueUpdateFormProps {
  data: Issue;
  onSuccess?: (data: Issue) => void | Promise<unknown>;
}

function IssueUpdateForm({ data: issue, onSuccess }: IssueUpdateFormProps) {
  const {
    id: issueId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createdAt,
    ...defaultValues
  } = issue;

  const form = useTypeForm<IssueFormShape>({
    defaultValues,
  });

  const mutation = trpc.useMutation(["issue.addEvent"]);

  return (
    <MutationForm
      form={form}
      mutation={mutation}
      onSuccess={({ data }) => onSuccess?.(data.issue)}
      preSubmitTransform={(data) => ({
        ...shallowDiff(defaultValues, data),
        issueId,
      })}
    >
      <IssueFormFields form={form} />
    </MutationForm>
  );
}

type IssueFormShape = Pick<
  inferMutationInput<"issue.addEvent">,
  "title" | "status" | "description" | "issueId"
>;

interface IssueFormFieldsProps {
  form: ReturnType<typeof useTypeForm<IssueFormShape>>;
}

function IssueFormFields({ form }: IssueFormFieldsProps) {
  return (
    <div className="flex w-[600px] flex-col gap-2">
      <div className="flex items-end gap-2">
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
