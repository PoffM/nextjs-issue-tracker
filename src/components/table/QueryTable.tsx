import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import Link from "next/link";
import { useRef, useState } from "react";
import { UseQueryResult } from "react-query";
import { trpc } from "../../utils/trpc";

interface ListQueryOutput<TData> {
  records: TData[];
  count: number;
}

interface ListQueryInput {
  take: number;
  skip: number;
  order?: {
    direction: "asc" | "desc";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any;
  };
}

interface QueryPropParams {
  listParams: ListQueryInput;
  queryOptions: {
    keepPreviousData: boolean;
    onSuccess: () => void;
    onSettled: () => void;
    retry: boolean;
  };
}

interface QueryTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  defaultSortField?: string;
  useQuery: (
    params: QueryPropParams
  ) => UseQueryResult<
    ListQueryOutput<TData>,
    ReturnType<typeof trpc.useQuery>["error"]
  >;
  prefetchNextPage?: (
    utils: ReturnType<typeof trpc.useContext>,
    params: ListQueryInput
  ) => void;
}

export function QueryTable<TData>({
  columns,
  useQuery,
  defaultSortField,
  prefetchNextPage,
}: QueryTableProps<TData>) {
  const tableRef = useRef<HTMLTableElement>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const { pageIndex, pageSize } = pagination;
  const pageNumber = pageIndex + 1;

  const [sorting, setSorting] = useState<SortingState>(
    defaultSortField ? [{ id: defaultSortField, desc: true }] : []
  );

  const listParams: ListQueryInput = {
    take: pageSize,
    skip: pageIndex * pageSize,
    order: sorting?.[0] && {
      direction: sorting[0].desc ? "desc" : "asc",
      field: sorting[0].id,
    },
  };
  const utils = trpc.useContext();
  const { data, error, isPreviousData } = useQuery({
    listParams,
    queryOptions: {
      // Keep the previous page's data in the table while the next page is loading:
      keepPreviousData: true,
      onSuccess: () => {
        // Prefetch the next page to avoid the loading time:
        const prefetchParams = {
          ...listParams,
          skip: (pageIndex + 1) * pageSize,
        };
        prefetchNextPage?.(utils, prefetchParams);
      },
      onSettled: () => {
        // Scroll to the top of the table:
        tableRef.current?.scrollIntoView();
      },
      retry: false,
    },
  });

  const { records, count } = data ?? {};

  const pageCount = count && Math.ceil(count / pageSize);

  const table = useReactTable<TData>({
    // Required props:
    data: records ?? [],
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
