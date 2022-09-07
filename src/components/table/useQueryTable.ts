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
export interface ListQueryInput<TOrderField = never> {
  take: number;
  skip: number;
  order?: {
    direction: "asc" | "desc";
    field: TOrderField;
  };
}

/** The query should output this data to be renderable in the table. */
export interface ListQueryOutput<TData> {
  records: TData[];
  count: number;
}

/** Table state provided to the list query. */
export interface TableProvidedQueryParams<TOrderField = never> {
  listQueryInput: ListQueryInput<TOrderField>;
  queryOptions: {
    keepPreviousData: boolean;
    onSettled: () => void;
  };
}

/** An error renderable in the table. */
export interface TableError {
  message: string;
}

export interface QueryTableProps<TData, TOrderField = never> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  defaultSortField?: TOrderField;
  /** react-query style hook that gets called internally. */
  useQuery: (
    params: TableProvidedQueryParams<TOrderField>
  ) => UseQueryResult<ListQueryOutput<TData>, TableError>;
}

/**
 * Connects an asynchronous list data query to react-table's useTable hook.
 * Stores pagination and sorting state.
 *
 * The query must accept take/skip pagination input, and must return the current
 * page's data and a total record count.
 */
export function useQueryTable<TData, TOrderField extends string = never>({
  defaultSortField,
  columns,
  useQuery,
}: QueryTableProps<TData, TOrderField>) {
  const tableRef = useRef<HTMLTableElement>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const { pageIndex, pageSize } = pagination;

  const [sorting, setSorting] = useState<SortingState & { id: TOrderField }[]>(
    defaultSortField ? [{ id: defaultSortField, desc: true }] : []
  );

  const listQueryInput: ListQueryInput<TOrderField> = {
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
      // Setting the sort through react-table is technically type-unsafe because
      // the back-end doesn't recognize every string it gets as a sortable field.
      // This should be fine as long as unsortable columns aren't given the "enableSorting" param:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      setSorting(newSort as any);
      // On sort change, also reset to page 1:
      setPagination((it) => ({ ...it, pageIndex: 0 }));
    },

    debugTable: true,
  });

  return { ...table, error, isPreviousData, tableRef };
}
