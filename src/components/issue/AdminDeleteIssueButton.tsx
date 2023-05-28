"use client";

import clsx from "clsx";
import FocusTrap from "focus-trap-react";
import { useRouter } from "next/navigation";
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

  const { data: currentUser } = trpc.me.useQuery();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const mutation = trpc.issue.delete.useMutation({
    onSuccess() {
      setModalIsOpen(false);
      void router.push("/");
    },
  });

  return (
    <div>
      {currentUser?.roles.includes("ADMIN") && (
        <button
          className="btn-link btn text-red-500"
          onClick={() => setModalIsOpen(true)}
        >
          Delete Issue
        </button>
      )}
      <div
        className={clsx(
          "modal",
          modalIsOpen && "modal-open",

          // Required for FocusTrap to work inside daisy-ui's modal class,
          // because it requires a visible and focusable child element.
          // The user won't see the "visible" closed modal anyway because it has 0 opacity.
          "visible"
        )}
      >
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
