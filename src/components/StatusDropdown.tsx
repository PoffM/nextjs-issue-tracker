import { IssueStatus } from "@prisma/client";
import clsx from "clsx";
import { inferQueryOutput, trpc } from "../utils/trpc";

interface StatusDropdownProps {
  issue: NonNullable<inferQueryOutput<"issue.get">>;
}

/** Dropdown to change the Issue status. Calls the update mutation on click. */
export function StatusDropdown({ issue }: StatusDropdownProps) {
  const trpcCtx = trpc.useContext();
  const mutation = trpc.useMutation(["issue.addEvent"], {
    async onSuccess() {
      await trpcCtx.invalidateQueries(["issue.get", { id: issue.id }]);
      await trpcCtx.invalidateQueries([
        "issue.listEvents",
        { issueId: issue.id },
      ]);
    },
  });

  function labelText(status: IssueStatus) {
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
        {(Object.keys(IssueStatus) as IssueStatus[]).map((option) => (
          <li key={option}>
            <button
              onClick={(e) => {
                mutation.mutate({ issueId: issue.id, status: option });
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
