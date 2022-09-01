import { Issue, IssueStatus } from "@prisma/client";
import { inferMutationInput, trpc } from "../../utils/trpc";
import { IssueStatusField } from "../form/fields/IssueStatusField";
import { TextField } from "../form/fields/TextField";
import { MutationForm } from "../form/MutationForm";
import { SubmitButton } from "../form/SubmitButton";
import { useTypeForm } from "../form/useTypeForm";

interface IssueCommentFormProps {
  issue: Issue;
  onSuccess?: () => void;
}

/** Form for adding IssueEvents (comments / status changes etc to an Issue) */
export function IssueCommentForm({ issue, onSuccess }: IssueCommentFormProps) {
  const ctx = trpc.useContext();
  const mutation = trpc.useMutation(["issue.addEvent"], {
    onSuccess: () => {
      void ctx.invalidateQueries(["issue.findOne", { id: issue.id }]);
      onSuccess?.();
    },
  });

  const defaultValues: inferMutationInput<"issue.addEvent"> = {
    issueId: issue.id,
    comment: "",
    status: issue.status,
  };
  const form = useTypeForm({ defaultValues });

  return (
    <MutationForm<"issue.addEvent">
      form={form}
      mutation={mutation}
      preSubmitTransform={(input) => ({
        ...input,
        // Omit the status if it's unchanged:
        status:
          issue.status === input.status
            ? undefined
            : (input.status as IssueStatus),
        // Omit the comment if it's blank:
        comment: input.comment?.trim() || undefined,
      })}
      onSuccess={({ data }) =>
        form.reset({ ...defaultValues, status: data.issue.status })
      }
    >
      <TextField
        field={form.field("comment")}
        label="Add a Comment"
        textarea={true}
      />
      <div className="flex justify-end gap-2">
        <IssueStatusField field={form.field("status")} />
        <SubmitButton formCtx={form} />
      </div>
    </MutationForm>
  );
}
