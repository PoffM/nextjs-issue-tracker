import { IssueEvent } from "@prisma/client";
import { flatMap } from "lodash";
import { useRouter } from "next/router";
import { StatusDropdown } from "../../components/StatusDropdown";
import { trpc } from "../../utils/trpc";

export default function IssuePage() {
  const { query } = useRouter();
  const id = Number(query.id);

  const { data: issue } = trpc.useQuery(["issue.get", { id }]);
  const { data: events } = trpc.useInfiniteQuery([
    "issue.listEvents",
    { issueId: id },
  ]);

  return (
    <main>
      {issue && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{issue.title}</h1>
            <StatusDropdown issue={issue} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="font-bold">Description</label>
              <button className="btn">Edit</button>
            </div>
            <div>{issue.description}</div>
          </div>
          {events && (
            <div className="flex flex-col gap-4">
              {flatMap(events.pages).map((event) => (
                <div key={event.id}>
                  <IssueEventListItem event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

interface IssueEventListItemProps {
  event: IssueEvent;
}

function IssueEventListItem({ event }: IssueEventListItemProps) {
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
          <div className="p-2">{event.comment}</div>
        </div>
      )}
    </>
  );
}
