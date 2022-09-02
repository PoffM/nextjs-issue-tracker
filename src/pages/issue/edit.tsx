import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { IssueUpdateForm } from "../../components/issue/IssueForm";
import { trpc } from "../../utils/trpc";

const IssueEditPage: NextPage = () => {
  const router = useRouter();
  const id = Number(router.query.id);

  const { data: issue } = trpc.useQuery(["issue.findOne", { id }]);

  return (
    <main className="flex justify-center">
      {issue && (
        <>
          <Head>
            <title>{issue.title}</title>
          </Head>
          <IssueUpdateForm
            data={issue}
            onSuccess={() => router.push(`/issue/${id}`)}
          />
        </>
      )}
    </main>
  );
};

export default IssueEditPage;
