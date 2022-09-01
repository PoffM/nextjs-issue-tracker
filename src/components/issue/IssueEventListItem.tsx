import { inferQueryOutput } from "../../utils/trpc";

interface IssueEventListItemProps {
  event: inferQueryOutput<"issue.listEvents">["events"][number];
}

export function IssueEventListItem({ event }: IssueEventListItemProps) {
  const timestamp = (
    <span title={event.createdAt.toTimeString()}>
      {event.createdAt.toDateString()}
    </span>
  );

  const username = event.createdBy.name;

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
        <div className="rounded-md border">
          <div className="border-b p-2">
            {username} changed the description on {timestamp}
          </div>
          <div className="whitespace-pre-line p-2">{event.description}</div>
        </div>
      )}
      {event.status && (
        <div>
          {username} changed the status to {event.status.replaceAll("_", " ")}{" "}
          on {timestamp}
        </div>
      )}
      {event.comment && (
        <div className="rounded-md border">
          <div className="border-b p-2">
            {username} commented on {timestamp}
          </div>
          <div className="whitespace-pre-line p-2">{event.comment}</div>
        </div>
      )}
    </>
  );
}
