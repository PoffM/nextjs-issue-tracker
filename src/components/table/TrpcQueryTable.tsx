import { ColumnDef } from "@tanstack/react-table";
import { AppRouter } from "../../server/routers/appRouter";
import { inferQueryInput, inferQueryOutput, trpc } from "../../utils/trpc";
import { QueryTable } from "./QueryTable";
import { ListQueryInput, ListQueryOutput } from "./useQueryTable";

export type AllQueries = AppRouter["_def"]["queries"];

export type ListQueryName = {
  [TPath in keyof AllQueries]: inferQueryOutput<TPath> extends ListQueryOutput<unknown>
    ? inferQueryInput<TPath> extends ListQueryInput<string, unknown>
      ? TPath
      : never
    : never;
}[keyof AllQueries];

export type ListItemType<TPath extends ListQueryName> =
  inferQueryOutput<TPath>["records"][number];

export type OrderField<TPath extends ListQueryName> =
  inferQueryInput<TPath> extends ListQueryInput<infer TOrderField, unknown>
    ? TOrderField extends string
      ? TOrderField
      : never
    : never;

export type FilterType<TPath extends ListQueryName> =
  inferQueryInput<TPath> extends ListQueryInput<unknown, infer TFilter>
    ? TFilter extends Record<string, unknown>
      ? TFilter
      : never
    : never;

export interface TrpcQueryTableProps<TPath extends ListQueryName> {
  /** TRPC route path */
  path: TPath;

  /**
   * Get the path's query input, given the table component's internally stored pagination and sorting state.
   * You need to provide additional query input argument for the specific route, like filters.
   */
  getQueryInput: (
    listQueryInput: ListQueryInput<OrderField<TPath>>
  ) => inferQueryInput<TPath>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<ListItemType<TPath>, any>[];
  defaultSortField?: OrderField<TPath>;
  filter?: FilterType<TPath>;
}

/** Renders a TRPC list query as a table with type safety and minimal code */
export function TrpcQueryTable<TPath extends ListQueryName>({
  columns,
  getQueryInput,
  path,
  defaultSortField,
  filter,
}: TrpcQueryTableProps<TPath>) {
  const utils = trpc.useContext();
  return (
    <QueryTable<ListItemType<TPath>, OrderField<TPath>>
      columns={columns}
      useQuery={({ listQueryInput, queryOptions }) => {
        const queryInput = getQueryInput(listQueryInput);
        const queryTuple: [TPath, inferQueryInput<TPath>] = [path, queryInput];

        // Not sure why this type check fails, but it shouldn't.
        // The type guard on queryTuple should be good enough.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        return trpc.useQuery(queryTuple as any, {
          ...queryOptions,
          onSuccess() {
            const prefetchNextPageTuple: [TPath, inferQueryInput<TPath>] = [
              path,
              { ...queryInput, skip: queryInput.skip + queryInput.take },
            ];
            // Prefetch the next page to avoid the loading time:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
            void utils.prefetchQuery(prefetchNextPageTuple as any);
          },
        });
      }}
      defaultSortField={defaultSortField}
      filter={filter}
    />
  );
}
