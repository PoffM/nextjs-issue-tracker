import type { NextPage } from "next";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["healthz"]);

  return (
    <main className="flex justify-center items-center">
      Health check: {isLoading ? "Loading..." : data};
    </main>
  );
};

export default Home;
