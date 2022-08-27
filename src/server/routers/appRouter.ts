/**
 * This file contains the root router of your tRPC-backend
 */
import { ZodError } from "zod";
import { createRouter } from "../createRouter";
import { issueRouter } from "./issueRouter";

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = createRouter()
  /**
   * Add a health check endpoint to be called with `/api/trpc/healthz`
   */
  .query("healthz", {
    resolve: () => "UP",
  })
  .merge("issue.", issueRouter)
  .formatError(({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  });

export type AppRouter = typeof appRouter;
