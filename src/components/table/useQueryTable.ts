import { UseQueryResult } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  RowData,
  useReactTable,
} from "@tanstack/react-table";
import { useRef, useState } from "react";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

/** Input for a take/skip-based paginated query endpoint. */
export interface ListQueryInput<TOrderField = never, TFilter = never> {
  take: number;
  skip: number;
  order?: {
    direction: "asc" | "desc";
    field: TOrderField;
  };
  filter?: TFilter;
}

/** The query should output this data to be renderable in the table. */
export interface ListQueryOutput<TData> {
  records: TData[];
  count: number;
}

/** Table state provided to the list query. */
export interface TableProvidedQueryParams<
  TOrderField = never,
  TFilter = never
> {
  listQueryInput: ListQueryInput<TOrderField, TFilter>;
  queryOptions: {
    keepPreviousData: boolean;
  };
}

/** An error renderable in the table. */
export interface TableError {
  message: string;
}

export interface UseQueryTableParams<
  TData,
  TOrderField = never,
  TFilter = never
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  defaultSortField?: TOrderField;
  defaultFilter?: TFilter;
  /** react-query style hook that gets called internally. */
  useQuery: (
    params: TableProvidedQueryParams<TOrderField, TFilter>
  ) => UseQueryResult<ListQueryOutput<TData> | undefined, TableError>;
}

/**
 * Connects an asynchronous list data query to react-table's useTable hook.
 * Stores pagination, sort and filter state.
 *
 * The query must accept take/skip pagination input, and must return the current
 * page's data and a total record count.
 */
export function useQueryTable<
  TData,
  TOrderField extends string = never,
  TFilter = never
>({
  defaultSortField,
  defaultFilter,
  columns,
  useQuery,
}: UseQueryTableParams<TData, TOrderField, TFilter>) {
  const tableRef = useRef<HTMLTableElement>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const { pageIndex, pageSize } = pagination;

  const [filter, _setFilter] = useState(defaultFilter);

  const setFilter: typeof _setFilter = (updater) => {
    _setFilter(updater);
    // When the filter changes, reset to page 1:
    setPagination((it) => ({ ...it, pageIndex: 0 }));
    scrollToTopOfTable();
  };

  const [sorting, setSorting] = useState<{ id: TOrderField; desc: boolean }[]>(
    defaultSortField ? [{ id: defaultSortField, desc: true }] : []
  );

  function scrollToTopOfTable() {
    tableRef.current?.scrollIntoView({ inline: "start" });
  }

  const listQueryInput: ListQueryInput<TOrderField, TFilter> = {
    take: pageSize,
    skip: pageIndex * pageSize,
    order: sorting?.[0] && {
      direction: sorting[0].desc ? "desc" : "asc",
      field: sorting[0].id,
    },
    filter,
  };

  const query = useQuery({
    listQueryInput,
    queryOptions: {
      // Keep the previous page's data in the table while the next page is loading:
      keepPreviousData: true,
    },
  });

  const { records, count } = query.data ?? {};

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
    onPaginationChange: (updater) => {
      setPagination(updater);
      scrollToTopOfTable();
    },
    manualPagination: true,

    // Sorting props:
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    onSortingChange: (newSort) => {
      // @ts-expect-error Setting the sort through react-table is technically type-unsafe because
      // the back-end doesn't recognize every string it gets as a sortable field.
      // This should be fine as long as unsortable columns aren't given the "enableSorting" param:
      setSorting(newSort);
      // On sort change, also reset to page 1:
      setPagination((it) => ({ ...it, pageIndex: 0 }));
      scrollToTopOfTable();
    },

    debugTable: true,
  });

  return { ...table, query, tableRef, filter, setFilter };
}
