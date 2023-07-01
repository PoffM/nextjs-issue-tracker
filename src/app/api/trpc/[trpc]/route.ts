import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../server/routers/appRouter";
import { requestContext } from "../../../../server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,

    /**
     * @link https://trpc.io/docs/context
     */
    createContext: requestContext,

    /**
     * @link https://trpc.io/docs/error-handling
     */
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        // send to bug reporting
        // eslint-disable-next-line no-console
        console.error("Something went wrong", error);
      }
    },

    /**
     * Enable query batching
     */
    batching: {
      enabled: true,
    },

    /**
     * @link https://trpc.io/docs/caching#api-response-caching
     */
    // responseMeta() {
    //   // ...
    // },
  });

export { handler as GET, handler as POST };