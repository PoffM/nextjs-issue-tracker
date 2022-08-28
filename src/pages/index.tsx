import type { NextPage } from "next";
import { IssueTable } from "../components/IssueTable";

const Home: NextPage = () => {
  return (
    <main>
      <div className="flex flex-col gap-4">
        <IssueTable />
      </div>
    </main>
  );
};

export default Home;
