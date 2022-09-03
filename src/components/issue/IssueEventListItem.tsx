import { ReactNode } from "react";
import { datetimeString } from "../../utils/datetimeString";
import { inferQueryOutput } from "../../utils/trpc";

interface IssueEventListItemProps {
  event: inferQueryOutput<"issue.listEvents">["events"][number];
}

export function IssueEventListItem({ event }: IssueEventListItemProps) {
  const timestamp = datetimeString(event.createdAt);

  const username = (
    <span className="text-blue-600 hover:text-blue-800 dark:link-accent">
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
          {username} changed the status to {event.status.replaceAll("_", " ")}{" "}
          on {timestamp}
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
      <div className="border-b border-base-content border-opacity-20 p-2">
        {header}
      </div>
      <div className="whitespace-pre-line p-2">{content}</div>
    </div>
  );
}
