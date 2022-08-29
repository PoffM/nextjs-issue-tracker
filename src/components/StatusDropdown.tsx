import { Status } from "@prisma/client";
import clsx from "clsx";
import { useState } from "react";
import { inferQueryOutput, trpc } from "../utils/trpc";

interface StatusDropdownProps {
  issue: NonNullable<inferQueryOutput<"issue.get">>;
}

/** Dropdown to change the Issue status. Calls the update mutation on click. */
export function StatusDropdown({ issue }: StatusDropdownProps) {
  const trpcCtx = trpc.useContext();
  const mutation = trpc.useMutation(["issue.update"], {
    async onSuccess() {
      await trpcCtx.invalidateQueries(["issue.get", { id: issue.id }]);
    },
  });

  const [open, setOpen] = useState(false);

  function labelText(status: Status) {
    return status.replace("_", " ");
  }

  return (
    <div className={clsx("dropdown", open && "dropdown-open")}>
      <button tabIndex={0} className="btn m-1" onClick={() => setOpen(true)}>
        {labelText(issue.status)}
      </button>
      {open && (
        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box w-52 bg-base-200 p-2 shadow"
        >
          {(Object.keys(Status) as Status[]).map((option) => (
            <li key={option}>
              <button
                onClick={() => {
                  setOpen(false);
                  mutation.mutate({ id: issue.id, status: option });
                }}
              >
                {labelText(option)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
