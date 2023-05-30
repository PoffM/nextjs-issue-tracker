import { ColumnHelper, createColumnHelper } from "@tanstack/react-table";
import { ListItemType, ListQueryName } from "./useTrpcQueryTable";

/**
 * Helper for creating table columns for a TRPC list query.
 * Adds type safety and makes columns non-sortable by default.
 */
export function createTrpcTableColumnHelper<
  TPath extends ListQueryName
>(): ColumnHelper<ListItemType<TPath>> {
  const defaultColumnHelper = createColumnHelper<ListItemType<TPath>>();

  return {
    ...defaultColumnHelper,
    /** Override default config when creating accessors. */
    accessor: (accessor, column) =>
      defaultColumnHelper.accessor(accessor, {
        // Make columns non-sortable by default.
        enableSorting: false,
        ...column,
      }),
  };
}
