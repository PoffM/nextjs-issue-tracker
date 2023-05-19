import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorAlert } from "../../components/ErrorAlert";
import { AdminDeleteIssueButton } from "../../components/issue/AdminDeleteIssueButton";
import { IssueEventList } from "../../components/issue/IssueEventList";
import { IssueStatusBadge } from "../../components/issue/IssueStatusBadge";
import { trpc } from "../../utils/trpc";

export default function IssuePage() {
  const { query } = useRouter();
  const id = Number(query.id);

  const { data: issue, error } = trpc.issue.findOne.useQuery({ id });

  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-[600px] flex-col gap-4">
        <ErrorAlert error={error} />
        {issue && (
          <>
            <Head>
              <title>{issue.title}</title>
            </Head>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{issue.title}</h1>
            </div>
            <IssueStatusBadge status={issue.status} />
            <div>
              <div className="flex items-center gap-2">
                <label className="font-bold">Description</label>
              </div>
              <div>{issue.description}</div>
            </div>
            <div className="flex justify-between">
              <Link href={`/issue/edit?id=${issue.id}`} className="btn">
                Edit
              </Link>
              <AdminDeleteIssueButton issueId={issue.id} />
            </div>
            <div className="divider"></div>
            <IssueEventList issue={issue} />
          </>
        )}
      </div>
    </main>
  );
}
