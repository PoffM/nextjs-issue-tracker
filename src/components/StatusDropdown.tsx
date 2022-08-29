import { Status } from "@prisma/client";
import clsx from "clsx";
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

  function labelText(status: Status) {
    return status.replace("_", " ");
  }

  return (
    <div className="dropdown">
      <button
        tabIndex={0}
        className={clsx("btn m-1 w-32", mutation.isLoading && "loading")}
      >
        {!mutation.isLoading && labelText(issue.status)}
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box w-52 bg-base-200 p-2 shadow"
      >
        {(Object.keys(Status) as Status[]).map((option) => (
          <li key={option}>
            <button
              onClick={(e) => {
                mutation.mutate({ id: issue.id, status: option });
                (e.target as HTMLButtonElement).blur();
              }}
            >
              {labelText(option)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
