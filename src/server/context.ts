import { PrismaClient } from "@prisma/client";
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
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
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export function requestContext(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opts: Partial<trpcNext.CreateNextContextOptions>
) {
  return { ...globalContext };
}

export type RequestContext = trpc.inferAsyncReturnType<typeof requestContext>;
