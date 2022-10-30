import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import TRPC, { AnyRouter } from "@trpc/server";
import { NextPageContext } from "next";
import { PathValue } from "react-hook-form";
import superjson from "superjson";

import type { AppRouter } from "../server/routers/appRouter";
// ℹ️ Type-only import:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export

function getBaseUrl() {
  const PORT = process.env.PORT ?? 3000;
  if (typeof window !== "undefined") {
    return "";
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // // reference for render.com
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${PORT}`;
  }

  // assume localhost
  return `http://localhost:${PORT}`;
}

/**
 * Extend `NextPageContext` with meta data that can be picked up by `responseMeta()` when server-side rendering
 */
export interface SSRContext extends NextPageContext {
  /**
   * Set HTTP Status code
   * @usage
   * const utils = trpc.useContext();
   * if (utils.ssrContext) {
   *   utils.ssrContext.status = 404;
   * }
   */
  status?: number;
}

/**
 * A set of strongly-typed React hooks from your `AppRouter` type signature with `createReactQueryHooks`.
 * @link https://trpc.io/docs/react#3-create-trpc-hooks
 */
export const trpc = createTRPCNext<AppRouter, SSRContext>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    return {
      /**
       * @link https://trpc.io/docs/data-transformers
       */
      transformer: superjson,
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * Set custom request headers on every request from tRPC
           * @link https://trpc.io/docs/ssr
           */
          headers() {
            if (ctx?.req) {
              // To use SSR properly, you need to forward the client's headers to the server
              // This is so you can pass through things like cookies when we're server-side rendering

              // If you're using Node 18, omit the "connection" header
              const {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                connection: _connection,
                ...headers
              } = ctx.req.headers;
              return {
                ...headers,
                // Optional: inform server that it's an SSR request
                "x-ssr": "1",
              };
            }
            return {};
          },
        }),
      ],
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      queryClientConfig: {
        defaultOptions: { queries: { retry: false } },
      },
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

  //   // for app caching with SSR see https://trpc.io/docs/caching

  //   return {};
  // },
});

type inferProcedures<TRouter extends AnyRouter> = TRouter["_def"]["procedures"];

/** Recursively gets all procedure dot-paths from the router. */
type ProcedureNames<TRouter extends AnyRouter> = {
  [P in keyof inferProcedures<TRouter>]: inferProcedures<TRouter>[P] extends {
    _procedure: true;
  }
    ? P
    : inferProcedures<TRouter>[P] extends AnyRouter
    ? `${P & string}.${ProcedureNames<inferProcedures<TRouter>[P]> & string}`
    : never;
}[keyof TRouter["_def"]["procedures"]];

/** Union of all TRPC procedure dot-paths, including queries and mutations */
export type RouteKey = ProcedureNames<AppRouter>;

/**
 * Helper method to infer the input of a query resolver. Supports dot-paths.
 * @example type HelloInput = inferProcedureInput<'hello'>
 * @example type IssueListInput = inferProcedureInput<'issue.list'>
 */
// TODO re-implement using TRPC's built-in inferProcedureInput;
// Currently that causes the output to be "void | {intended type}".
export type inferProcedureInput<TRouteKey extends RouteKey> = PathValue<
  AppRouter["_def"]["procedures"],
  TRouteKey
>["_def"]["_input_in"];

/**
 * Helper method to infer the output of a query resolver. Supports dot-paths.
 * @example type HelloOutput = inferProcedureOutput<'hello'>
 * @example type IssueListOutput = inferProcedureOutput<'issue.list'>
 */
export type inferProcedureOutput<TRouteKey extends RouteKey> =
  TRPC.inferProcedureOutput<
    PathValue<AppRouter["_def"]["procedures"], TRouteKey>
  >;
