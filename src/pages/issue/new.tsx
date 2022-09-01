import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { IssueForm } from "../../components/issue/IssueForm";

const NewIssuePage: NextPage = () => {
  const router = useRouter();

  // Require the user to be singed in:
  const session = useSession({
    required: true,
  });

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
