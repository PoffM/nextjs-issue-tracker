// import { Prisma } from "@prisma/client";
import { createColumnHelper, IdentifiedColumnDef } from "@tanstack/react-table";
import { startCase } from "lodash";
import Link from "next/link";
import { useState } from "react";
import { datetimeString } from "../../utils/datetimeString";
import { inferQueryInput, inferQueryOutput, trpc } from "../../utils/trpc";
import { Defined } from "../../utils/types";
import { QueryTable } from "../table/QueryTable";
import { IssueStatusBadge } from "./IssueStatusBadge";

type IssueListItem = inferQueryOutput<"issue.list">["records"][number];

const columnHelper = createColumnHelper<IssueListItem>();

/** Override default config when creating accessors. */
const accessor: typeof columnHelper.accessor = (accessor, column) =>
  columnHelper.accessor(accessor, {
    enableSorting: false,
    ...column,
  });

/** Helper function for creating Date columns. */
function dateTimeColumnDef(
  header: string
): IdentifiedColumnDef<IssueListItem, Date> {
  return {
    header,
    cell: (ctx) => datetimeString(ctx.getValue()),
    size: 50,
  };
}

const columns = [
  // On mobile screens: The first column shows the "Issue" header
  // with
  // Condensed column for mobile screens only:
  accessor("id", {
    header: () => (
      <span>
        <span className="hidden sm:table-cell">Number</span>
        <span className="sm:hidden">Issue</span>
      </span>
    ),
    cell: (ctx) => {
      const issue = ctx.row.original;
      return (
        <>
          <span className="inline sm:hidden">
            <div className="mb-1 flex items-center gap-1">
              #{issue.id} <IssueStatusBadge status={issue.status} size="sm" />
            </div>
            <Link href={`/issue/${ctx.row.original.id}`}>
              <a
                className="link text-blue-600 hover:text-blue-800 dark:link-accent"
                title={issue.title}
              >
                {issue.title}
              </a>
            </Link>
          </span>
          <span className="hidden sm:inline">{issue.id}</span>
        </>
      );
    },
    size: 50,
    maxSize: 50,
    enableSorting: true,
  }),
  accessor("createdAt", {
    ...dateTimeColumnDef("Created On"),
    enableSorting: true,
    size: 50,
    meta: { className: "hidden lg:table-cell" },
  }),
  accessor("status", {
    header: "Status",
    cell: (ctx) => <IssueStatusBadge status={ctx.getValue()} size="sm" />,
    size: 120,
    meta: { className: "hidden sm:table-cell" },
  }),
  accessor("title", {
    header: "Title",
    cell: (ctx) => (
      <Link href={`/issue/${ctx.row.original.id}`}>
        <a
          className="link text-blue-600 hover:text-blue-800 dark:link-accent"
          title={ctx.getValue()}
        >
          {ctx.getValue()}
        </a>
      </Link>
    ),
    size: 400,
    maxSize: 400,
    meta: { className: "hidden sm:table-cell" },
  }),
  accessor("updatedAt", {
    ...dateTimeColumnDef("Last Updated"),
    enableSorting: true,
    size: 50,
    meta: { className: "hidden lg:table-cell" },
  }),
];

/** Lists the issues from the database. */
export function IssueTable() {
  const [statusFilter, setStatusFilter] =
    useState<Defined<inferQueryInput<"issue.list">["filter"]>["status"]>(
      "OPEN"
    );

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <div>
          <label className="font-bold">Filter Issues</label>
          <div className="flex items-center gap-4">
            {(["OPEN", "CLOSED"] as const).map((statusOption) => (
              <label
                key={statusOption}
                className="flex cursor-pointer items-center gap-1"
              >
                <input
                  type="radio"
                  className="radio radio-accent"
                  checked={statusFilter === statusOption}
                  onChange={() => setStatusFilter(statusOption)}
                />
                {startCase(statusOption)}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <Link href="/issue/new">
            <a className="btn btn-primary">Create Issue</a>
          </Link>
        </div>
      </div>
      <QueryTable
        columns={columns}
        useQuery={({ queryInput, queryOptions }) =>
          trpc.useQuery(
            ["issue.list", { ...queryInput, filter: { status: statusFilter } }],
            queryOptions
          )
        }
        prefetchNextPage={(utils, params) =>
          void utils.prefetchQuery(["issue.list", params])
        }
        defaultSortField="id"
      />
    </div>
  );
}
