import { Issue } from "@prisma/client";
import { useInView } from "react-intersection-observer";
import { trpc } from "../../utils/trpc";
import { IssueCommentForm } from "./IssueCommentForm";
import { IssueEventListItem } from "./IssueEventListItem";

export interface IssueEventListProps {
  issue: Issue;
}

export function IssueEventList({ issue }: IssueEventListProps) {
  const {
    data: eventsData,
    hasNextPage,
    fetchNextPage,
    refetch,
    isFetching,
  } = trpc.useInfiniteQuery(["issue.listEvents", { issueId: issue.id }], {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
  });

  function refetchLastPage() {
    void refetch({
      refetchPage(_, index, allPages) {
        // Only refetch the last page because that's where the new comment is:
        return index === allPages.length - 1;
      },
    });
  }

  const [loadButtonRef] = useInView({
    onChange(inView) {
      if (hasNextPage && inView) {
        void fetchNextPage();
      }
    },
  });

  return eventsData ? (
    <div className="flex flex-col gap-4">
      {eventsData.pages
        .map((it) => it.events)
        .flat()
        .map((event) => (
          <IssueEventListItem key={event.id} event={event} />
        ))}
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            className="btn"
            ref={loadButtonRef}
            onClick={() => void fetchNextPage()}
          >
            {isFetching ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
      <IssueCommentForm issue={issue} onSuccess={refetchLastPage} />
    </div>
  ) : null;
}
