import { NextPage } from "next";
import { useRouter } from "next/router";
import { IssueForm } from "../../components/issue/IssueForm";

const NewIssuePage: NextPage = () => {
  const router = useRouter();
  return (
    <main className="flex justify-center">
      <IssueForm onSuccess={(data) => void router.push(`/issue/${data.id}`)} />
    </main>
  );
};

export default NewIssuePage;
