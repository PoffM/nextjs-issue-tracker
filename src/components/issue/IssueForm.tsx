import { Issue } from "@prisma/client";
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
  const { data: issue } = trpc.useQuery(["issue.get", { id: id ?? NaN }], {
    enabled: id !== undefined,
  });

  const formProps = { onSuccess };

  return (
    <div>
      {id ? (
        issue && <IssueFormInternal defaultValues={issue} {...formProps} />
      ) : (
        <IssueFormInternal {...formProps} />
      )}
    </div>
  );
}

interface IssueFormInternalProps {
  defaultValues?: Issue;
  onSuccess?: (data: Issue) => void | Promise<void>;
}

function IssueFormInternal({
  defaultValues,
  onSuccess,
}: IssueFormInternalProps) {
  const form = useTypeForm<inferMutationInput<"issue.save">>({
    defaultValues,
  });

  const mutation = trpc.useMutation(["issue.save"]);

  return (
    <MutationForm
      form={form}
      mutation={mutation}
      onSuccess={({ data }) => onSuccess?.(data)}
    >
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
    </MutationForm>
  );
}
