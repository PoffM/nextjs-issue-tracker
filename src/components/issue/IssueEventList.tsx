import { Issue } from "@prisma/client";
import { flatMap } from "lodash";
import { useEffect } from "react";
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
  } = trpc.useInfiniteQuery(["issue.listEvents", { issueId: issue.id }], {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
  });

  const [loadButtonRef, loadButtonInView] = useInView();
  useEffect(() => {
    if (hasNextPage && loadButtonInView) {
      void fetchNextPage();
    }
  }, [loadButtonInView, fetchNextPage, hasNextPage]);

  return eventsData ? (
    <div className="flex flex-col gap-4">
      {flatMap(eventsData.pages.map((it) => it.events)).map((event) => (
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
      <IssueCommentForm issue={issue} />
    </div>
  ) : null;
}
