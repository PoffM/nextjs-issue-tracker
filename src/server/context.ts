import { PrismaClient } from "@prisma/client";
import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { z } from "zod";
import { env } from "./env";

// Prisma needs to be set up in a certain way in Next.js to avoid a common bug:
// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient;
};

const prisma: PrismaClient =
  prismaGlobal.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}

export const globalContext = { prisma };

/**
 * User schema.
 * next-auth doesn't guarantee type safety so use Zod to ensure the user has the required properties.
 */
const zUser = z.object({
  id: z.string(),
  name: z.string().optional(),
});

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function requestContext(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opts?: Partial<trpcNext.CreateNextContextOptions>
) {
  async function getSession() {
    if (!opts?.req || !opts?.res) {
      return null;
    }

    // Async import to avoid circular dependency as nextAuth imports prisma:
    const { nextAuthOptions } = await import("../pages/api/auth/[...nextauth]");

    return await getServerSession(opts?.req, opts?.res, nextAuthOptions);
  }

  /** Returns the user if logged in, otherwise  */
  async function requireUser() {
    const session = await getSession();

    if (!session) {
      throw new TRPCError({
        message: "Must be logged in.",
        code: "UNAUTHORIZED",
      });
    }

    // Ensure there is a valid user (with an ID) in the session:
    const user = zUser.parse(session.user);

    return user;
  }

  return { ...globalContext, getSession, requireUser };
}

export type RequestContext = trpc.inferAsyncReturnType<typeof requestContext>;
