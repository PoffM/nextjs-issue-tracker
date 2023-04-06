import { flexRender } from "@tanstack/react-table";
import clsx from "clsx";
import { clamp } from "lodash";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { ErrorAlert } from "../ErrorAlert";
import { useQueryTable } from "./useQueryTable";

export interface QueryTableProps<
  TData,
  TOrderField extends string = never,
  TFilter = never
> {
  tableState: ReturnType<typeof useQueryTable<TData, TOrderField, TFilter>>;
}

/** Renders the data returned from the useQueryTable hook. */
export function QueryTable<
  TData,
  TOrderField extends string = never,
  TFilter = never
>({
  tableState: {
    query: { data, error, isPreviousData, isLoading },
    tableRef,
    ...table
  },
}: QueryTableProps<TData, TOrderField, TFilter>) {
  return (
    <div className="space-y-2">
      <ErrorAlert error={error} />
      <div className="relative flex flex-col items-center gap-4">
        {/* Show a loading dimmer while loading. */}
        {(isPreviousData || isLoading) && (
          <div className="absolute z-20 h-full w-full bg-base-100 bg-opacity-50">
            <div className="flex h-full w-full items-center justify-center">
              <ImSpinner2 className="animate-spin" size="30px" />
            </div>
          </div>
        )}
        <table
          className="table-zebra table-compact flex table w-full table-fixed scroll-my-2"
          ref={tableRef}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    // Undo daisyUI's "position: sticky" for the first header:
                    className={clsx(
                      "[position:static!important]",
                      header.column.columnDef.meta?.className
                    )}
                  >
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
                    className={clsx(
                      "overflow-hidden text-ellipsis whitespace-nowrap",
                      cell.column.columnDef.meta?.className
                    )}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data?.count === 0 && <div>No results</div>}
        <div className="btn-group">
          <button
            className="btn"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
          >
            <FaAngleDoubleLeft size="20px" />
          </button>
          <button
            className="btn"
            disabled={!table.getCanPreviousPage()}
            onClick={table.previousPage}
          >
            <FaAngleLeft size="20px" />
          </button>
          <button className="btn">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {clamp(table.getPageCount(), 1, Infinity)}
          </button>
          <button
            className="btn"
            disabled={!table.getCanNextPage()}
            onClick={table.nextPage}
          >
            <FaAngleRight size="20px" />
          </button>
          <button
            className="btn"
            disabled={!table.getCanNextPage()}
            onClick={
              table.getPageCount()
                ? () => table.setPageIndex(table.getPageCount() - 1)
                : undefined
            }
          >
            <FaAngleDoubleRight size="20px" />
          </button>
        </div>
      </div>
    </div>
  );
}
