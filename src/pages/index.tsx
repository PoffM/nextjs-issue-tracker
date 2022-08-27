import type { NextPage } from "next";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data: issues } = trpc.useQuery(["issue.list", { take: 25, skip: 0 }]);

  return (
    <main className="flex justify-center items-center">
      <table className="table table-zebra table-compact w-full">
        <thead>
          <tr>
            <th className="text-left">Title</th>
            <th className="text-left">Status</th>
            <th className="text-left">Assignee</th>
            <th className="text-left">Created On</th>
          </tr>
        </thead>
        <tbody>
          {issues?.map((issue) => (
            <tr className="w-full" key={issue.id}>
              <td>{issue.title}</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

export default Home;
