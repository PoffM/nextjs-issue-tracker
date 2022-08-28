import type { NextPage } from "next";
import { IssueTable } from "../components/IssueTable";

const Home: NextPage = () => {
  return (
    <main>
      <IssueTable />
    </main>
  );
};

export default Home;
