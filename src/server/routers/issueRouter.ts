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
  })
  // Adds an event, e.g. adding a comment or updating the status:
  .mutation("addEvent", {
    input: z.object({
      issueId: z.number().int(),

      comment: z.string().min(1).max(10_000).optional(),
      description: z.string().min(1).max(10_000).optional(),
      status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    }),
    async resolve({ ctx, input: { issueId, status, comment } }) {
      const [issue, event] = await ctx.prisma.$transaction([
        // Update the Issue:
        ctx.prisma.issue.update({
          where: { id: issueId },
          data: { status },
        }),
        // Create the IssueEvent:
        ctx.prisma.issueEvent.create({
          data: { comment, status, issueId },
        }),
      ]);

      return { issue, event };
    },
  })
  .query("listEvents", {
    input: z.object({
      issueId: z.number().int(),
      cursor: z.number().int().optional(),
    }),
    async resolve({ ctx, input: { issueId, cursor } }) {
      return ctx.prisma.issueEvent.findMany({
        where: { issueId },
        take: 20,
        orderBy: { createdAt: "asc" },
        cursor: cursor ? { id: cursor } : undefined,
      });
    },
  });
