import { IdentifiedColumnDef } from "@tanstack/react-table";
import { datetimeString } from "../../utils/datetimeString";

/** Helper function for creating Date columns. */
export function dateTimeColumnDef<TData>(
  header: string
): IdentifiedColumnDef<TData, Date> {
  return {
    header,
    cell: (ctx) => datetimeString(ctx.getValue()),
    size: 50,
  };
}
