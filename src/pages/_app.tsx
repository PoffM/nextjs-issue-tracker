import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { ReactElement } from "react";
import "../../styles/globals.css";
import { DefaultLayout } from "../components/DefaultLayout";
import { AppRouter } from "../server/routers/appRouter";
import { ColorModeApplier } from "../components/color-mode/ColorModeApplier";
import superjson from "superjson";

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactElement<unknown> | null;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function IssueTrackerApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <SessionProvider>
      <ColorModeApplier />
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // // reference for render.com
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${
      process.env.PORT ?? ""
    }`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export default withTRPC<AppRouter>({
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    return {
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            opts.direction === "down" && opts.result instanceof Error,
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
  /**
   * Set headers or status code when doing SSR
   */
  // responseMeta(opts) {
  //   const ctx = opts.ctx as SSRContext;

  //   if (ctx.status) {
  //     // If HTTP status set, propagate that
  //     return {
  //       status: ctx.status,
  //     };
  //   }

  //   const error = opts.clientErrors[0];
  //   if (error) {
  //     // Propagate http first error from API calls
  //     return {
  //       status: error.data?.httpStatus ?? 500,
  //     };
  //   }
  //   // For app caching with SSR see https://trpc.io/docs/caching
  //   return {};
  // },
})(IssueTrackerApp);
