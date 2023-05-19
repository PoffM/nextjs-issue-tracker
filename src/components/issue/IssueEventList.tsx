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
  } = trpc.issue.listEvents.useInfiniteQuery(
    { issueId: issue.id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  function refetchLastPage() {
    void refetch({
      refetchPage(_, index, allPages) {
        // Only refetch the last page because that's where the new comment is:
        return index === allPages.length - 1;
      },
    });
  }

  // Fetch the next page when the "Load More" button comes in view.
  const [loadButtonRef] = useInView({
    onChange(inView) {
      if (hasNextPage && inView) {
        void fetchNextPage();
      }
    },
  });

  const events = eventsData?.pages.map((it) => it.events).flat();

  return events ? (
    <div className="flex flex-col gap-4">
      {events.map((event, idx) => (
        <div key={event.id}>
          <div>
            <IssueEventListItem event={event} />
          </div>
          {idx !== events.length - 1 && (
            <div className="relative">
              <div
                className="absolute h-4 w-[2px] bg-base-content bg-opacity-20"
                style={{ translate: "20px" }}
              />
            </div>
          )}
        </div>
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
      <IssueCommentForm
        issue={issue}
        onSuccess={refetchLastPage}
        // Re-initialize the form whenever the issue is updated:
        key={issue.updatedAt.toString()}
      />
    </div>
  ) : null;
}
