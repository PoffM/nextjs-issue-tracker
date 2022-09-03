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
    <div>
      {username} created this issue on {timestamp}
    </div>
  ) : (
    <>
      {event.title && (
        <div>
          {username} changed the title to {`"${event.title}"`} on {timestamp}
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
      {event.status && (
        <div>
          {username} changed the status to {event.status.replaceAll("_", " ")}{" "}
          on {timestamp}
        </div>
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
