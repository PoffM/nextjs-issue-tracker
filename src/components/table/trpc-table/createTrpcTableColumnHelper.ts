import { ColumnHelper, createColumnHelper } from "@tanstack/react-table";
import { ListItemType, ListQueryName } from "./useTrpcQueryTable";

/** Helper for creating table columns for a TRPC list query. */
export function createTrpcTableColumnHelper<
  TPath extends ListQueryName
>(): ColumnHelper<ListItemType<TPath>> {
  const defaultColumnHelper = createColumnHelper<ListItemType<TPath>>();

  return {
    ...defaultColumnHelper,
    /** Override default config when creating accessors. */
    accessor: (accessor, column) =>
      defaultColumnHelper.accessor(accessor, {
        // Make columns are not sortable by default.
        enableSorting: false,
        ...column,
      }),
  };
}
