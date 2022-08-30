import { useRouter } from "next/router";
import { IssueEventList } from "../../components/issue/IssueEventList";
import { trpc } from "../../utils/trpc";

export default function IssuePage() {
  const { query } = useRouter();
  const id = Number(query.id);

  const { data: issue } = trpc.useQuery(["issue.get", { id }]);

  return (
    <main>
      {issue && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{issue.title}</h1>
            <span className="badge badge-lg">
              {issue.status.replace("_", " ")}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="font-bold">Description</label>
              <button className="btn">Edit</button>
            </div>
            <div>{issue.description}</div>
          </div>
          <IssueEventList issue={issue} />
        </div>
      )}
    </main>
  );
}
