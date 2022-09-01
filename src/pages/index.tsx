import type { NextPage } from "next";
import Link from "next/link";
import { IssueTable } from "../components/issue/IssueTable";

const Home: NextPage = () => {
  return (
    <main>
      <div className="flex flex-col gap-2">
        <div className="flex justify-end">
          <Link href="/issue/new">
            <a className="btn btn-primary">Create Issue</a>
          </Link>
        </div>
        <IssueTable />
      </div>
    </main>
  );
};

export default Home;
