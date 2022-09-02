import type { NextPage } from "next";
import { IssueTable } from "../components/issue/IssueTable";

const Home: NextPage = () => {
  return (
    <main>
      <IssueTable />
    </main>
  );
};

export default Home;
