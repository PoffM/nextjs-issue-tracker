// import { Prisma } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  IdentifiedColumnDef,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import Link from "next/link";
import { useRef, useState } from "react";
import { datetimeString } from "../../utils/datetimeString";
import { inferQueryInput, inferQueryOutput, trpc } from "../../utils/trpc";
import { Defined } from "../../utils/types";
import { IssueStatusBadge } from "./IssueStatusBadge";

type IssueListItem = inferQueryOutput<"issue.list">["issues"][number];

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

/** Lists the issues from the database. */
export function IssueTable() {
  const tableRef = useRef<HTMLTableElement>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const { pageIndex, pageSize } = pagination;
  const pageNumber = pageIndex + 1;

  const defaultSortField: Defined<
    inferQueryInput<"issue.list">["order"]
  >["field"] = "id";

  const [sorting, setSorting] = useState<SortingState>([
    { id: defaultSortField, desc: true },
  ]);

  const utils = trpc.useContext();
  const { data, error, isPreviousData } = trpc.useQuery(
    [
      "issue.list",
      {
        take: pageSize,
        skip: pageIndex * pageSize,
        order: sorting[0] && {
          direction: sorting[0].desc ? "desc" : "asc",

          // Do a cast here, the back-end will runtime validate it anyway:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          field: sorting[0].id as any,
        },
      },
    ],
    {
      // Keep the previous page's data in the table while the next page is loading:
      keepPreviousData: true,
      async onSuccess() {
        // Prefetch the next page to avoid the loading time:
        await utils.prefetchQuery([
          "issue.list",
          { take: pageSize, skip: (pageIndex + 1) * pageSize },
        ]);
      },
      onSettled() {
        // Scroll to the top of the table:
        tableRef.current?.scrollIntoView();
      },
    }
  );
  const { issues, count } = data ?? {};

  const pageCount = count && Math.ceil(count / pageSize);

  const table = useReactTable({
    // Required props:
    data: issues ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),

    state: {
      pagination,
      sorting,
    },

    // Pagination props:
    pageCount,
    onPaginationChange: setPagination,
    manualPagination: true,

    // Sorting props:
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    onSortingChange: (newSort) => {
      setSorting(newSort);
      // On sort change, also reset to page 1:
      setPagination((it) => ({ ...it, pageIndex: 0 }));
    },

    debugTable: true,
  });

  const prevButtonDisabled = pageNumber <= 1;
  const nextButtonDisabled = !pageCount || pageNumber >= pageCount;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <div>
          {error && <div className="alert alert-error">{error.message}</div>}
        </div>
        <Link href="/issue/new">
          <a className="btn btn-primary">Create Issue</a>
        </Link>
      </div>
      <div className="relative flex flex-col items-center gap-4">
        {/* Show a loading dimmer while loading. */}
        {isPreviousData && (
          <div className="absolute z-20 h-full w-full bg-base-100 bg-opacity-50"></div>
        )}
        <table
          className="table-zebra table-compact table w-full scroll-my-2"
          ref={tableRef}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={clsx(
                          header.column.getCanSort() &&
                            "flex cursor-pointer select-none gap-2"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <div className="w-[10px]">
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[String(header.column.getIsSorted())] ?? null}
                        </div>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                    key={cell.id}
                    style={{
                      width: cell.column.columnDef.size,
                      maxWidth: cell.column.columnDef.maxSize,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="btn-group">
          <button
            className="btn"
            disabled={prevButtonDisabled}
            onClick={() => table.setPageIndex(0)}
          >
            «
          </button>
          <button
            className="btn"
            disabled={prevButtonDisabled}
            onClick={() => table.setPageIndex((it) => it - 1)}
          >
            {"<"}
          </button>
          <button className="btn">
            Page {pageNumber} of {pageCount}
          </button>
          <button
            className="btn"
            disabled={nextButtonDisabled}
            onClick={() => table.setPageIndex((it) => it + 1)}
          >
            {">"}
          </button>
          <button
            className="btn"
            disabled={nextButtonDisabled}
            onClick={
              pageCount ? () => table.setPageIndex(pageCount - 1) : undefined
            }
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
