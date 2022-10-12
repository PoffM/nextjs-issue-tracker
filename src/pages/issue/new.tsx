import { NextPage } from "next";
import { useRouter } from "next/router";
import { IssueForm } from "../../components/issue/IssueForm";
import { useRequireSession } from "../../utils/useRequireSession";

const NewIssuePage: NextPage = () => {
  const router = useRouter();

  // Require the user to be signed in:
  const session = useRequireSession();

  return (
    <main className="flex justify-center">
      {session.status === "authenticated" && (
        <IssueForm
          onSuccess={(data) => void router.push(`/issue/${data.id}`)}
        />
      )}
    </main>
  );
};

export default NewIssuePage;
