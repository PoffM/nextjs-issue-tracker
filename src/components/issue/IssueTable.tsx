import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useRef, useState } from "react";
import { inferQueryOutput, trpc } from "../../utils/trpc";

const columnHelper =
  createColumnHelper<inferQueryOutput<"issue.list">["issues"][number]>();

const columns = [
  columnHelper.accessor("title", {
    cell: (ctx) => (
      <Link href={`/issue/${ctx.row.original.id}`}>
        <a className="link link-accent">{ctx.getValue()}</a>
      </Link>
    ),
  }),
  columnHelper.accessor("status", {
    cell: (ctx) => ctx.getValue().replace("_", " "),
  }),
  columnHelper.accessor("createdAt", {
    cell: (ctx) => ctx.getValue().toISOString().slice(0, 10),
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
    <div className="flex flex-col gap-4">
      <table
        className="table-zebra table-compact table w-full scroll-my-2"
        ref={tableRef}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
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
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center">
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