import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  IdentifiedColumnDef,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useRef, useState } from "react";
import { inferQueryOutput, trpc } from "../../utils/trpc";

type IssueListItem = inferQueryOutput<"issue.list">["issues"][number];

const columnHelper = createColumnHelper<IssueListItem>();

/** Helper function for creating Date columns. */
function dateColumnDef(
  header: string
): IdentifiedColumnDef<IssueListItem, Date> {
  return {
    header,
    cell: (ctx) => (
      <span title={ctx.getValue().toTimeString()}>
        {ctx.getValue().toISOString().slice(0, 10)}
      </span>
    ),
    size: 100,
  };
}

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
    cell: (ctx) => (
      <Link href={`/issue/${ctx.row.original.id}`}>
        <a className="link link-accent">{ctx.getValue()}</a>
      </Link>
    ),
    size: 400,
    maxSize: 400,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (ctx) => ctx.getValue().replace("_", " "),
    size: 100,
  }),
  columnHelper.accessor("createdAt", dateColumnDef("Created At")),
  columnHelper.accessor("updatedAt", dateColumnDef("Last Updated")),
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

  const utils = trpc.useContext();
  const { data } = trpc.useQuery(
    ["issue.list", { take: pageSize, skip: pageIndex * pageSize }],
    {
      async onSuccess() {
        // Prefetch the next page:
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
    },

    // Pagination props:
    pageCount,
    onPaginationChange: setPagination,
    manualPagination: true,

    debugTable: true,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <Link href="/issue/new">
          <a className="btn btn-primary">Create Issue</a>
        </Link>
      </div>
      <div className="flex flex-col items-center gap-4">
        <table
          className="table-zebra table-compact table w-full scroll-my-2"
          ref={tableRef}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
            disabled={pageNumber <= 1}
            onClick={() => table.setPageIndex(0)}
          >
            «
          </button>
          <button
            className="btn"
            disabled={pageNumber <= 1}
            onClick={() => table.setPageIndex((it) => it - 1)}
          >
            {"<"}
          </button>
          <button className="btn">
            Page {pageNumber} of {pageCount}
          </button>
          <button
            className="btn"
            disabled={!pageCount || pageNumber >= pageCount}
            onClick={() => table.setPageIndex((it) => it + 1)}
          >
            {">"}
          </button>
          <button
            className="btn"
            disabled={!pageCount || pageNumber >= pageCount}
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
