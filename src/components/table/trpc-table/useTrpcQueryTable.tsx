import { get } from "lodash";
import { PathValue } from "react-hook-form";
import {
  inferProcedureInput,
  inferProcedureOutput,
  RouteKey,
  trpc,
} from "../../../utils/trpc";
import {
  ListQueryInput,
  ListQueryOutput,
  useQueryTable,
  UseQueryTableParams,
} from "../useQueryTable";

/** String key of a route that matches the List Route input and output requirements. e.g. "issue.list" */
export type ListQueryName = {
  [TPath in RouteKey]: inferProcedureOutput<TPath> extends ListQueryOutput<unknown>
    ? inferProcedureInput<TPath> extends ListQueryInput<string, unknown>
      ? TPath
      : never
    : never;
}[RouteKey];

/** Gets the single list item type from a List Route. */
export type ListItemType<TPath extends ListQueryName> =
  inferProcedureOutput<TPath>["records"][number];

/** Gets the valid "order" field strings from a List Route. */
export type OrderField<TPath extends ListQueryName> =
  inferProcedureInput<TPath> extends ListQueryInput<infer TOrderField, unknown>
    ? TOrderField extends string
      ? TOrderField
      : never
    : never;

/** Gets the "filter" param from a List Route. */
export type FilterType<TPath extends ListQueryName> =
  inferProcedureInput<TPath> extends ListQueryInput<unknown, infer TFilter>
    ? TFilter extends Record<string, unknown>
      ? TFilter
      : never
    : never;

export interface UseTrpcQueryTableParams<TPath extends ListQueryName>
  extends Omit<
    UseQueryTableParams<
      ListItemType<TPath>,
      OrderField<TPath>,
      FilterType<TPath>
    >,
    "useQuery"
  > {
  /** TRPC route path */
  path: TPath;

  /**
   * Get the path's query input, given the table hook's internally stored
   * pagination+sorting+filter state.
   *
   * Required because the actual route's input can extend the base ListQueryInput.
   */
  getQueryInput: (
    listQueryInput: ListQueryInput<OrderField<TPath>>
  ) => inferProcedureInput<TPath>;
}

/**
 * Connects a TRPC list query to react-table's useTable hook.
 * Stores pagination, sort and filter state.
 *
 * The query's input must implement ListQueryInput, and
 * the query's output must implement ListQueryOutput.
 */
export function useTrpcQueryTable<TPath extends ListQueryName>({
  columns,
  path,
  getQueryInput,
  defaultSortField,
  defaultFilter,
}: UseTrpcQueryTableParams<TPath>): ReturnType<
  typeof useQueryTable<
    ListItemType<TPath>,
    OrderField<TPath>,
    FilterType<TPath>
  >
> {
  const utils = trpc.useContext();
  return useQueryTable({
    columns,
    useQuery: ({ listQueryInput, queryOptions }) => {
      const queryInput = getQueryInput(listQueryInput);

      const reactProcedure = get(trpc, path) as PathValue<typeof trpc, TPath>;

      return reactProcedure.useQuery(queryInput, {
        ...queryOptions,
        onSuccess() {
          // Prefetch the next page to avoid the loading time:
          const query = get(utils, path) as PathValue<
            Omit<typeof utils, "ssrContext">,
            TPath
          >;
          void query.prefetch({
            ...queryInput,
            skip: queryInput.skip + queryInput.take,
          });
        },
      });
    },
    defaultFilter,
    defaultSortField,
  });
}
