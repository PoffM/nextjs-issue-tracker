import { useRouter } from "next/router";
import { StatusDropdown } from "../../components/StatusDropdown";
import { trpc } from "../../utils/trpc";

export default function IssuePage() {
  const { query } = useRouter();
  const id = Number(query.id);

  const { data: issue } = trpc.useQuery(["issue.get", { id }]);

  return (
    <main>
      {issue && (
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{issue.title}</h1>
            <StatusDropdown issue={issue} />
          </div>
        </div>
      )}
    </main>
  );
}
