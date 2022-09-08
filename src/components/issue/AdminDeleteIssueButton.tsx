import clsx from "clsx";
import FocusTrap from "focus-trap-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { ErrorAlert } from "../ErrorAlert";

export interface AdminDeleteIssueButtonProps {
  issueId: number;
}
/** Opens an "Are you sure" modal to delete an issue. Only shown to admins. */
export function AdminDeleteIssueButton({
  issueId,
}: AdminDeleteIssueButtonProps) {
  const router = useRouter();
  const { data: currentUser } = trpc.useQuery(["me"]);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const mutation = trpc.useMutation(["issue.delete"], {
    onSuccess() {
      setModalIsOpen(false);
      void router.push("/");
    },
  });

  return (
    <div>
      {currentUser?.roles.includes("ADMIN") && (
        <button
          className="btn btn-link text-red-500"
          onClick={() => setModalIsOpen(true)}
        >
          Delete Issue
        </button>
      )}
      <div className={clsx("modal", modalIsOpen && "modal-open")}>
        {modalIsOpen && (
          <FocusTrap>
            <div className="animate-fadeIn modal-box relative flex flex-col items-center gap-4">
              <h2>Are you sure you want to delete this Issue?</h2>
              <ErrorAlert error={mutation.error} />
              <div className="flex w-[300px] gap-4">
                <button
                  className="btn flex-1"
                  onClick={() => setModalIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={clsx(
                    "btn flex-1 bg-red-800 hover:bg-red-900",
                    mutation.isLoading && "loading"
                  )}
                  onClick={() => mutation.mutate({ id: issueId })}
                >
                  Yes, delete it
                </button>
              </div>
            </div>
          </FocusTrap>
        )}
      </div>
    </div>
  );
}
