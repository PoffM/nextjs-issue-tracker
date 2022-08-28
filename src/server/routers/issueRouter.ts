import { z } from "zod";
import { createRouter } from "../createRouter";

export const issueRouter = createRouter()
  .query("list", {
    input: z.object({
      take: z.number().min(0).max(50),
      skip: z.number(),
    }),
    async resolve({ ctx, input: { take, skip } }) {
      const count = await ctx.prisma.issue.count();
      const issues = await ctx.prisma.issue.findMany({
        select: { id: true, title: true, createdAt: true, status: true },
        take,
        skip,
      });

      return { issues, count };
    },
  })
  .query("get", {
    input: z.object({ id: z.number().int() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.issue.findUnique({
        where: { id: input.id },
      });
    },
  });
