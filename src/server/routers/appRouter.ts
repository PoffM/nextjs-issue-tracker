/**
 * This file contains the root router of your tRPC-backend
 */
import { t } from "../trpc";
import { issueRouter } from "./issueRouter";

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = t.router({
  /**
   * Add a health check endpoint to be called with `/api/trpc/healthz`
   */
  healthz: t.procedure.query(() => "UP"),
  issue: issueRouter,
  /**
   * Returns info about the current user.
   */
  me: t.procedure.query(async ({ ctx }) => {
    const sessionUser = await ctx.getUserOrNull();
    if (!sessionUser) {
      return null;
    }

    const dbUser = await ctx.prisma.user.findUnique({
      select: { id: true, name: true, roles: true },
      where: { id: sessionUser.id },
    });
    return dbUser;
  }),
});

export type AppRouter = typeof appRouter;
