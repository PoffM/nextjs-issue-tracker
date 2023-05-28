import { getServerSession } from "next-auth";
import Head from "next/head";
import { redirect } from "next/navigation";
import { PageProps } from "../../../../.next/types/app/page";
import { ErrorAlert } from "../../../components/ErrorAlert";
import { prisma } from "../../../server/context";
import { IssueForm } from "../../../components/issue/IssueForm";

export default async function IssueEditPage({ searchParams }: PageProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const id = Number(searchParams.id);

  // Require the user to be signed in:
  const session = await getServerSession();

  if (!session?.user) {
    redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent(`/issue/edit/${id}`)}`
    );
  }

  const issue = await prisma.issue.findUnique({ where: { id } });

  return (
    <main className="flex justify-center">
      {issue ? (
        <>
          <Head>
            <title>{issue.title}</title>
          </Head>
          <IssueForm id={id} />
        </>
      ) : (
        <ErrorAlert error={{ message: "Issue not found." }} />
      )}
    </main>
  );
}
