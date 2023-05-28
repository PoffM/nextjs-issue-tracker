import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { IssueForm } from "../../../components/issue/IssueForm";

export default async function NewIssuePage() {
  // Require the user to be signed in:
  const session = await getServerSession();

  if (!session?.user) {
    redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent("/issue/new")}`
    );
  }

  return (
    <main className="flex justify-center">
      <IssueForm />
    </main>
  );
}
