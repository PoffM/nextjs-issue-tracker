import { IssueEvent } from "@prisma/client";

interface IssueEventListItemProps {
  event: IssueEvent;
}
export function IssueEventListItem({ event }: IssueEventListItemProps) {
  return (
    <>
      {event.status && (
        <div className="">
          (Username) changed the status to {event.status.replaceAll("_", " ")}
        </div>
      )}
      {event.comment && (
        <div className="rounded-md border">
          <div className="border-b p-2">
            (Username) commented on{" "}
            <span title={event.createdAt.toTimeString()}>
              {event.createdAt.toDateString()}
            </span>
          </div>
          <div className="whitespace-pre-line p-2">{event.comment}</div>
        </div>
      )}
    </>
  );
}
