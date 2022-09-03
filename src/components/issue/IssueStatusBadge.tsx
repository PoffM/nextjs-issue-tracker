import { IssueStatus } from "@prisma/client";
import clsx from "clsx";
import { startCase } from "lodash";

export interface IssueStatusBadgeProps {
  status: IssueStatus;
  size?: "md" | "sm";
}

export function IssueStatusBadge({
  status,
  size = "md",
}: IssueStatusBadgeProps) {
  return (
    <div
      className={clsx(
        "inline-flex w-fit items-center justify-center rounded-2xl px-2 text-white",
        size === "md" && "p-2 px-4",
        status === "NEW" && "bg-green-800",
        status === "IN_PROGRESS" && "bg-blue-600",
        status === "CLOSED" && "bg-gray-600",
        status === "RESOLVED" && "bg-purple-800"
      )}
    >
      {startCase(status)}
    </div>
  );
}
