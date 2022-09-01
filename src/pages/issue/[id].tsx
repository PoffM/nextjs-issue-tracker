import Link from "next/link";
import { useRouter } from "next/router";
import { IssueEventList } from "../../components/issue/IssueEventList";
import { trpc } from "../../utils/trpc";

export default function IssuePage() {
  const { query } = useRouter();
  const id = Number(query.id);

  const { data: issue } = trpc.useQuery(["issue.get", { id }]);

  return (
    <main className="flex justify-center">
      {issue && (
        <div className="flex w-[600px] flex-col gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{issue.title}</h1>
            <span className="badge badge-lg">
              {issue.status.replace("_", " ")}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="font-bold">Description</label>
            </div>
            <div>{issue.description}</div>
          </div>
          <div>
            <Link href={`/issue/edit?id=${issue.id}`}>
              <a className="btn">Edit</a>
            </Link>
          </div>

          <div className="divider"></div>
          <IssueEventList issue={issue} />
        </div>
      )}
    </main>
  );
}
