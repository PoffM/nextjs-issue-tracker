// import { Prisma } from "@prisma/client";
import { createColumnHelper, IdentifiedColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { datetimeString } from "../../utils/datetimeString";
import { inferQueryOutput, trpc } from "../../utils/trpc";
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
  accessor("id", {
    header: "Number",
    size: 50,
    enableSorting: true,
  }),
  accessor("createdAt", {
    ...dateTimeColumnDef("Created On"),
    enableSorting: true,
    size: 50,
  }),
  accessor("status", {
    header: "Status",
    cell: (ctx) => <IssueStatusBadge status={ctx.getValue()} size="sm" />,
    size: 120,
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
  }),
  accessor("updatedAt", {
    ...dateTimeColumnDef("Last Updated"),
    enableSorting: true,
    size: 50,
  }),
];

export function IssueTable() {
  return (
    <QueryTable
      columns={columns}
      useQuery={({ listParams, queryOptions }) =>
        trpc.useQuery(["issue.list", listParams], queryOptions)
      }
      prefetchNextPage={(utils, params) =>
        void utils.prefetchQuery(["issue.list", params])
      }
      defaultSortField="id"
    />
  );
}
