import { useRouter } from "next/router";
import { useMemo } from "react";
import { z } from "zod";

const zTableState = z.object({
  page: z.number(),
  filter: z.preprocess((val) => JSON.parse(String(val)), z.object({})),
  sorting: z.object({ id: z.string(), desc: z.boolean() }),
});

export function useRouterTableState<TOrderField, TFilter>({
  defaultSortField,
  defaultFilter,
}: {
  defaultSortField?: TOrderField;
  defaultFilter?: TFilter;
} = {}) {
  const { query, push } = useRouter();

  const tableState = useMemo(
    () => ({
      filter: defaultFilter,
      sorting: defaultSortField ? [{ id: defaultSortField, desc: true }] : [],
      ...zTableState.safeParse(query),
    }),
    [query, defaultSortField, defaultFilter]
  );

  return [tableState, () => push({ query: {} })];
}
