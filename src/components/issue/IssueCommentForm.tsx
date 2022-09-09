import { Issue } from "@prisma/client";
import { useSession } from "next-auth/react";
import { inferMutationInput, trpc } from "../../utils/trpc";
import { IssueStatusField } from "../form/fields/IssueStatusField";
import { TextField } from "../form/fields/TextField";
import { MutationForm } from "../form/MutationForm";
import { SubmitButton } from "../form/SubmitButton";
import { useTypeForm } from "../form/useTypeForm";
import { LoginButton } from "../LoginButton";

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
  };
  const form = useTypeForm({ defaultValues });

  const session = useSession();

  return session.status === "authenticated" ? (
    <MutationForm<"issue.addEvent">
      form={form}
      mutation={mutation}
      preSubmitTransform={(input) => ({
        ...input,
        // Omit the comment if it's blank:
        comment: input.comment?.trim() || undefined,
      })}
      onSuccess={() => form.reset()}
    >
      <TextField field={form.field("comment")} label="Add a Comment" textarea />
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
        <IssueStatusField
          field={form.field("status")}
          label="New Status"
          currentStatus={issue.status}
        />
        <SubmitButton formCtx={form} />
      </div>
      {/* Invisible spacer div to make room for the status dropdown if it's at the bottom of the page */}
      <div className="relative">
        <div className="absolute h-[250px] w-[1px]"></div>
      </div>
    </MutationForm>
  ) : (
    <div>
      <LoginButton>Login to add a comment</LoginButton>
    </div>
  );
}
