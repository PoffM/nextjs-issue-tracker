import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  RowData,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useRef, useState } from "react";
import { UseQueryResult } from "react-query";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

/** Input for a take/skip-based paginated query endpoint. */
export interface ListQueryInput {
  take: number;
  skip: number;
  order?: {
    direction: "asc" | "desc";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any;
  };
}

/** The query should output this data to be renderable in the table. */
export interface ListQueryOutput<TData> {
  records: TData[];
  count: number;
}

/** Table state provided to the list query. */
export interface TableProvidedQueryParams {
  listQueryInput: ListQueryInput;
  queryOptions: {
    keepPreviousData: boolean;
    onSettled: () => void;
  };
}

/** An error renderable in the table. */
export interface TableError {
  message: string;
}

export interface QueryTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  defaultSortField?: string;
  /** react-query style hook that gets called internally. */
  useQuery: (
    params: TableProvidedQueryParams
  ) => UseQueryResult<ListQueryOutput<TData>, TableError>;
}

/**
 * Connects an asynchronous list data query to react-table's useTable hook.
 * Stores pagination and sorting state.
 *
 * The query must accept take/skip pagination input, and must return the current
 * page's data and a total record count.
 */
export function useQueryTable<TData>({
  defaultSortField,
  columns,
  useQuery,
}: QueryTableProps<TData>) {
  const tableRef = useRef<HTMLTableElement>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const { pageIndex, pageSize } = pagination;

  const [sorting, setSorting] = useState<SortingState>(
    defaultSortField ? [{ id: defaultSortField, desc: true }] : []
  );

  const listQueryInput: ListQueryInput = {
    take: pageSize,
    skip: pageIndex * pageSize,
    order: sorting?.[0] && {
      direction: sorting[0].desc ? "desc" : "asc",
      field: sorting[0].id,
    },
  };

  const { data, error, isPreviousData } = useQuery({
    listQueryInput,
    queryOptions: {
      // Keep the previous page's data in the table while the next page is loading:
      keepPreviousData: true,
      onSettled: () => {
        // Scroll to the top of the table:
        tableRef.current?.scrollIntoView();
      },
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

  return { ...table, error, isPreviousData, tableRef };
}
