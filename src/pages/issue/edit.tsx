import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ErrorAlert } from "../../components/ErrorAlert";
import { IssueForm } from "../../components/issue/IssueForm";
import { trpc } from "../../utils/trpc";
import { useRequireSession } from "../../utils/useRequireSession";

const IssueEditPage: NextPage = () => {
  const router = useRouter();
  const id = Number(router.query.id);

  // Require the user to be signed in:
  const session = useRequireSession();

  const { data: issue, refetch, error } = trpc.issue.findOne.useQuery({ id });

  return (
    <main className="flex justify-center">
      <ErrorAlert error={error} />
      {session.status === "authenticated" && issue && (
        <>
          <Head>
            <title>{issue.title}</title>
          </Head>
          <IssueForm
            id={id}
            onSuccess={async () => {
              // Do a refetch to make sure the up-to-date data is shown on the next page.
              await refetch();
              void router.push(`/issue/${id}`);
            }}
          />
        </>
      )}
    </main>
  );
};

export default IssueEditPage;
