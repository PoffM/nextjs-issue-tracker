import { flatMap } from "lodash";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { trpc } from "../../utils/trpc";
import { IssueEventListItem } from "./IssueEventListItem";

interface IssueEventListProps {
  issueId: number;
}
export function IssueEventList({ issueId }: IssueEventListProps) {
  const {
    data: events,
    hasNextPage,
    fetchNextPage,
  } = trpc.useInfiniteQuery(["issue.listEvents", { issueId }], {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
  });

  const [loadButtonRef, loadButtonInView] = useInView();
  useEffect(() => {
    if (hasNextPage && loadButtonInView) {
      void fetchNextPage();
    }
  }, [loadButtonInView, fetchNextPage, hasNextPage]);

  return events ? (
    <div className="flex flex-col gap-4">
      {flatMap(events.pages.map((it) => it.events)).map((event) => (
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
            Load More
          </button>
        </div>
      )}
    </div>
  ) : null;
}
