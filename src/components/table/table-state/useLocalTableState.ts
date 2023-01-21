import { useState } from "react";
import { QueryTableState } from "../useQueryTable";

export function useLocalTableState<TOrderField, TFilter>({
  defaultSortField,
  defaultFilter,
}: {
  defaultSortField?: TOrderField;
  defaultFilter?: TFilter;
} = {}) {
  return useState<QueryTableState<TOrderField, TFilter>>({
    pagination: {
      pageIndex: 0,
      pageSize: 25,
    },
    filter: defaultFilter,
    sorting: defaultSortField ? [{ id: defaultSortField, desc: true }] : [],
  });
}
