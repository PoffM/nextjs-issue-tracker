import { startCase } from "lodash";
import { ReactNode } from "react";
import { datetimeString } from "../../utils/datetimeString";
import { inferProcedureOutput } from "../../utils/trpc";

interface IssueEventListItemProps {
  event: inferProcedureOutput<"issue.listEvents">["events"][number];
}

export function IssueEventListItem({ event }: IssueEventListItemProps) {
  const timestamp = datetimeString(event.createdAt);

  const username = (
    <span className="text-blue-600 dark:link-accent hover:text-blue-800">
      {event.createdBy.name}
    </span>
  );

  return event.type === "INITIAL" ? (
    <IssueEventCard
      header={
        <>
          {username} created this issue on {timestamp}
        </>
      }
      content={
        <div className="space-y-2">
          {event.title && (
            <div>
              <label className="font-bold">Title: </label>
              {event.title}
            </div>
          )}
          {event.status && (
            <div>
              <label className="font-bold">Status: </label>
              {startCase(event.status)}
            </div>
          )}
          {event.description && (
            <div>
              <label className="font-bold">Description:</label>
              <div>{event.description}</div>
            </div>
          )}
        </div>
      }
    />
  ) : (
    <>
      {event.title && (
        <div>
          {username} changed the title to {`"${event.title}"`} on {timestamp}
        </div>
      )}
      {event.status && (
        <div>
          {username} changed the status to {startCase(event.status)} on{" "}
          {timestamp}
        </div>
      )}
      {event.description && (
        <IssueEventCard
          header={
            <>
              {username} changed the description on {timestamp}
            </>
          }
          content={event.description}
        />
      )}
      {event.comment && (
        <IssueEventCard
          header={
            <>
              {username} commented on {timestamp}
            </>
          }
          content={event.comment}
        />
      )}
    </>
  );
}

interface IssueEventCardProps {
  header: ReactNode;
  content: ReactNode;
}

function IssueEventCard({ header, content }: IssueEventCardProps) {
  return (
    <div className="rounded-md border border-base-content border-opacity-20">
      <div className="rounded-t-md border-b border-base-content border-opacity-20 bg-base-200 p-2">
        {header}
      </div>
      <div className="whitespace-pre-line rounded-b-md p-2">{content}</div>
    </div>
  );
}
