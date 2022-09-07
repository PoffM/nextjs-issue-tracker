import { AppRouter } from "../../server/routers/appRouter";
import { inferQueryInput, inferQueryOutput, trpc } from "../../utils/trpc";
import {
  ListQueryInput,
  ListQueryOutput,
  useQueryTable,
  UseQueryTableParams,
} from "./useQueryTable";

export type AllQueries = AppRouter["_def"]["queries"];

/** Gets all routes that match the List Route input and output requirements. */
export type ListQueryName = {
  [TPath in keyof AllQueries]: inferQueryOutput<TPath> extends ListQueryOutput<unknown>
    ? inferQueryInput<TPath> extends ListQueryInput<string, unknown>
      ? TPath
      : never
    : never;
}[keyof AllQueries];

/** Gets the single list item type from a List Route. */
export type ListItemType<TPath extends ListQueryName> =
  inferQueryOutput<TPath>["records"][number];

/** Gets the valid "order" field strings from a List Route. */
export type OrderField<TPath extends ListQueryName> =
  inferQueryInput<TPath> extends ListQueryInput<infer TOrderField, unknown>
    ? TOrderField extends string
      ? TOrderField
      : never
    : never;

/** Gets the "filter" param from a List Route. */
export type FilterType<TPath extends ListQueryName> =
  inferQueryInput<TPath> extends ListQueryInput<unknown, infer TFilter>
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
   */
  getQueryInput: (
    listQueryInput: ListQueryInput<OrderField<TPath>>
  ) => inferQueryInput<TPath>;
}

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
    },
    defaultFilter,
    defaultSortField,
  });
}
