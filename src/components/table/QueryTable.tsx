import { flexRender } from "@tanstack/react-table";
import clsx from "clsx";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import { useQueryTable } from "./useQueryTable";

export interface QueryTableProps<
  TData,
  TOrderField extends string = never,
  TFilter = never
> {
  table: ReturnType<typeof useQueryTable<TData, TOrderField, TFilter>>;
}

export function QueryTable<
  TData,
  TOrderField extends string = never,
  TFilter = never
>({
  table: { error, isPreviousData, tableRef, ...table },
}: QueryTableProps<TData, TOrderField, TFilter>) {
  return (
    <div className="space-y-2">
      {error && <div className="alert alert-error">{error.message}</div>}
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
                  <th
                    key={header.id}
                    // Undo daisyUI's "position: sticky" for the first header:
                    className={clsx(
                      "[position:static!important]",
                      header.column.columnDef.meta?.className
                    )}
                    style={{ width: header.getSize() }}
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
            {table.getPageCount()}
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
