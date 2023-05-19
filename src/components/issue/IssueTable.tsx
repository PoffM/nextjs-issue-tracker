import { startCase } from "lodash";
import Link from "next/link";
import { ImSearch } from "react-icons/im";
import { TextField } from "../form/fields/TextField";
import { useTypeForm } from "../form/form-utils/useTypeForm";
import { createTrpcTableColumnHelper } from "../table/createTrpcTableColumnHelper";
import { dateTimeColumnDef } from "../table/dateTimeColumnDef";
import { QueryTable } from "../table/QueryTable";
import { useTrpcQueryTable } from "../table/useTrpcQueryTable";
import { IssueStatusBadge } from "./IssueStatusBadge";

const columnHelper = createTrpcTableColumnHelper<"issue.list">();

const columns = [
  // On mobile screens: The first column shows the "Issue" header
  // with Issue number and Status in a condensed table cell.
  // On desktop: Expands these fields to multiple columns.
  columnHelper.accessor("id", {
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
            <Link
              href={`/issue/${ctx.row.original.id}`}
              className="link text-blue-600 dark:link-accent hover:text-blue-800"
              title={issue.title}
            >
              {issue.title}
            </Link>
          </span>
          <span className="hidden sm:inline">{issue.id}</span>
        </>
      );
    },
    enableSorting: true,
    meta: { className: "sm:w-[8rem]" },
  }),
  columnHelper.accessor("createdAt", {
    ...dateTimeColumnDef("Created On"),
    enableSorting: true,
    meta: { className: "hidden lg:table-cell lg:w-[14rem]" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (ctx) => <IssueStatusBadge status={ctx.getValue()} size="sm" />,
    meta: { className: "hidden sm:table-cell sm:w-[8rem]" },
  }),
  columnHelper.accessor("title", {
    header: "Title",
    cell: (ctx) => (
      <Link
        href={`/issue/${ctx.row.original.id}`}
        className="link text-blue-600 dark:link-accent hover:text-blue-800"
        title={ctx.getValue()}
      >
        {ctx.getValue()}
      </Link>
    ),
    meta: { className: "hidden sm:table-cell grow" },
  }),
  columnHelper.accessor("updatedAt", {
    ...dateTimeColumnDef("Last Updated"),
    enableSorting: true,
    meta: { className: "hidden lg:table-cell lg:w-[15rem]" },
  }),
];

/** Lists the issues from the database. */
export function IssueTable() {
  const tableState = useTrpcQueryTable({
    path: "issue.list",
    columns,
    defaultSortField: "id",
    defaultFilter: { status: "OPEN" },
    getQueryInput: (queryInput) => queryInput,
  });

  const searchForm = useTypeForm({ defaultValues: { search: "" } });

  const submitSearch = searchForm.handleSubmit((data) => {
    tableState.setFilter((filter) => ({
      ...filter,
      search: data.search.trim() || undefined,
    }));
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-4 sm:flex-row-reverse sm:justify-between">
        <div className="flex justify-between self-end">
          <Link href="/issue/new" className="btn-primary btn">
            Create Issue
          </Link>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-4">
            {(["OPEN", "CLOSED"] as const).map((statusOption) => (
              <label
                key={statusOption}
                className="flex cursor-pointer items-center gap-1"
              >
                <input
                  type="radio"
                  className="radio-accent radio"
                  checked={tableState.filter?.status === statusOption}
                  onChange={() =>
                    tableState.setFilter((it) => ({
                      ...it,
                      status: statusOption,
                    }))
                  }
                />
                {startCase(statusOption)}
              </label>
            ))}
          </div>
          <TextField
            field={searchForm.field("search")}
            className="sm:max-w-[300px]"
            dir="row"
            inputElement={(inputProps) => (
              <div className="input-group">
                <input
                  {...inputProps}
                  className="input-bordered input grow"
                  type="search"
                  // When the user presses enter or the input's clear (x) button, submit the search:
                  // @ts-expect-error "onsearch" is not in the type definition but works at runtime.
                  ref={(ref) => void (ref && (ref.onsearch = submitSearch))}
                />
                <button className="btn" onClick={() => void submitSearch()}>
                  <ImSearch size="18px" />
                </button>
              </div>
            )}
          />
        </div>
      </div>
      <QueryTable tableState={tableState} />
    </div>
  );
}
