import { IssueEvent } from "@prisma/client";

interface IssueEventListItemProps {
  event: IssueEvent;
}
export function IssueEventListItem({ event }: IssueEventListItemProps) {
  const timestamp = (
    <span title={event.createdAt.toTimeString()}>
      {event.createdAt.toDateString()}
    </span>
  );

  return (
    <>
      {event.title && (
        <div className="">
          (Username) changed the title to {`"${event.title}"`} on {timestamp}
        </div>
      )}
      {event.description && (
        <div className="rounded-md border">
          <div className="border-b p-2">
            (Username) changed the description on {timestamp}
          </div>
          <div className="whitespace-pre-line p-2">{event.description}</div>
        </div>
      )}
      {event.status && (
        <div className="">
          (Username) changed the status to {event.status.replaceAll("_", " ")}{" "}
          on {timestamp}
        </div>
      )}
      {event.comment && (
        <div className="rounded-md border">
          <div className="border-b p-2">
            (Username) commented on {timestamp}
          </div>
          <div className="whitespace-pre-line p-2">{event.comment}</div>
        </div>
      )}
    </>
  );
}
