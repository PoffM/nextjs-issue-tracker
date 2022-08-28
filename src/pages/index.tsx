import { Issue } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import type { NextPage } from "next";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const columnHelper = createColumnHelper<Issue>();
const columns = [columnHelper.accessor("title", {})];

const Home: NextPage = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const { pageIndex, pageSize } = pagination;
  const pageNumber = pageIndex + 1;

  const { data } = trpc.useQuery([
    "issue.list",
    { take: pageSize, skip: pageIndex * pageSize },
  ]);
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
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,

    debugTable: true,
  });

  return (
    <main>
      <div className="flex flex-col gap-4">
        <table className="table table-zebra table-compact w-full">
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
    </main>
  );
};

export default Home;
