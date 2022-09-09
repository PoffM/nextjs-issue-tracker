import { createColumnHelper } from "@tanstack/react-table";
import { startCase } from "lodash";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ImSearch } from "react-icons/im";
import { TextField } from "../form/fields/TextField";
import { useTypeForm } from "../form/useTypeForm";
import { dateTimeColumnDef } from "../table/dateTimeColumnDef";
import { QueryTable } from "../table/QueryTable";
import { ListItemType, useTrpcQueryTable } from "../table/useTrpcQueryTable";
import { IssueStatusBadge } from "./IssueStatusBadge";

type IssueListItem = ListItemType<"issue.list">;

const columnHelper = createColumnHelper<IssueListItem>();

/** Override default config when creating accessors. */
const accessor: typeof columnHelper.accessor = (accessor, column) =>
  columnHelper.accessor(accessor, {
    enableSorting: false,
    ...column,
  });

const columns = [
  // On mobile screens: The first column shows the "Issue" header
  // with Issue number and Status in a condensed table cell.
  // On desktop: Expands these fields to multiple columns.
  accessor("id", {
    header: () => (
      <span>
        <span className="hidden sm:table-cell">Number</span>
        <span className="sm:hidden">Issue</span>
      </span>
    ),
    cell: (ctx) => {
      const issue = ctx.row.original;
      return (
        <>
          <span className="inline sm:hidden">
            <div className="mb-1 flex items-center gap-1">
              #{issue.id} <IssueStatusBadge status={issue.status} size="sm" />
            </div>
            <Link href={`/issue/${ctx.row.original.id}`}>
              <a
                className="link text-blue-600 hover:text-blue-800 dark:link-accent"
                title={issue.title}
              >
                {issue.title}
              </a>
            </Link>
          </span>
          <span className="hidden sm:inline">{issue.id}</span>
        </>
      );
    },
    size: 50,
    maxSize: 50,
    enableSorting: true,
  }),
  accessor("createdAt", {
    ...dateTimeColumnDef("Created On"),
    enableSorting: true,
    size: 50,
    meta: { className: "hidden lg:table-cell" },
  }),
  accessor("status", {
    header: "Status",
    cell: (ctx) => <IssueStatusBadge status={ctx.getValue()} size="sm" />,
    size: 120,
    meta: { className: "hidden sm:table-cell" },
  }),
  accessor("title", {
    header: "Title",
    cell: (ctx) => (
      <Link href={`/issue/${ctx.row.original.id}`}>
        <a
          className="link text-blue-600 hover:text-blue-800 dark:link-accent"
          title={ctx.getValue()}
        >
          {ctx.getValue()}
        </a>
      </Link>
    ),
    size: 400,
    maxSize: 400,
    meta: { className: "hidden sm:table-cell" },
  }),
  accessor("updatedAt", {
    ...dateTimeColumnDef("Last Updated"),
    enableSorting: true,
    size: 50,
    meta: { className: "hidden lg:table-cell" },
  }),
];

/** Lists the issues from the database. */
export function IssueTable() {
  const table = useTrpcQueryTable({
    path: "issue.list",
    columns,
    defaultSortField: "id",
    defaultFilter: { status: "OPEN" },
    getQueryInput: (queryInput) => queryInput,
  });

  const searchForm = useTypeForm({ defaultValues: { search: "" } });

  const submitSearch = searchForm.handleSubmit((data) => {
    table.setFilter((filter) => ({
      ...filter,
      search: data.search.trim() || undefined,
    }));
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  // One the search input, when the user presses enter or presses
  // the clear (x) button, submit the search:
  useEffect(() => {
    const input = searchInputRef.current;
    const submitCallback = () => void submitSearch();
    input?.addEventListener("search", submitCallback);
    return () => input?.removeEventListener("search", submitCallback);
  }, [submitSearch]);

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex gap-8">
            <div className="flex items-center gap-4">
              {(["OPEN", "CLOSED"] as const).map((statusOption) => (
                <label
                  key={statusOption}
                  className="flex cursor-pointer items-center gap-1"
                >
                  <input
                    type="radio"
                    className="radio radio-accent"
                    checked={table.filter?.status === statusOption}
                    onChange={() =>
                      table.setFilter((it) => ({ ...it, status: statusOption }))
                    }
                  />
                  {startCase(statusOption)}
                </label>
              ))}
            </div>
            <TextField
              field={searchForm.field("search")}
              className="w-[300px]"
              dir="row"
              inputElement={(inputProps) => (
                <div className="input-group">
                  <input
                    {...inputProps}
                    className="input input-bordered"
                    type="search"
                    ref={searchInputRef}
                  />
                  <button className="btn">
                    <ImSearch size="18px" />
                  </button>
                </div>
              )}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Link href="/issue/new">
            <a className="btn btn-primary">Create Issue</a>
          </Link>
        </div>
      </div>
      <QueryTable table={table} />
    </div>
  );
}
