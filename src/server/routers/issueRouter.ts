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
    async resolve({ ctx, input: { issueId, status, comment, description } }) {
      const [issue, event] = await ctx.prisma.$transaction([
        // Update the Issue:
        ctx.prisma.issue.update({
          where: { id: issueId },
          data: { status, description },
        }),
        // Create the IssueEvent:
        ctx.prisma.issueEvent.create({
          data: { comment, status, description, issueId },
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
      const limit = 20;

      const items = await ctx.prisma.issueEvent.findMany({
        where: { issueId },
        take: limit + 1, // Get an extra item at the end which we'll use as next cursor
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        cursor: cursor ? { id: cursor } : undefined,
      });

      const nextItem = items[limit];
      if (nextItem) {
        items.pop();
      }

      return {
        events: items,
        nextCursor: nextItem?.id,
      };
    },
  });
