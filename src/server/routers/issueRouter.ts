import { Issue } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "../createRouter";

export const zIssueListSortOrder = z.object({
  field: z.enum(["createdAt", "updatedAt", "title", "status"]),
  direction: z.enum(["asc", "desc"]),
});

const zIssueStatusEnum = z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]);

const zIssueCreateArgs = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10_000).optional(),
  status: zIssueStatusEnum.optional(),
});

export const issueRouter = createRouter()
  .query("findOne", {
    input: z.object({
      id: z.number().int(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.issue.findUnique({
        where: { id: input.id },
      });
    },
  })
  .query("list", {
    input: z.object({
      take: z.number().min(0).max(50),
      skip: z.number(),
      order: zIssueListSortOrder.default({
        field: "createdAt",
        direction: "desc",
      }),
    }),
    async resolve({ ctx, input: { take, skip, order } }) {
      // Ensure keyof Issue here for better type safety:
      const orderField: keyof Issue = order.field;
      const [count, issues] = await ctx.prisma.$transaction([
        ctx.prisma.issue.count(),
        ctx.prisma.issue.findMany({
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            status: true,
          },
          take,
          skip,
          orderBy: [{ [orderField]: order.direction }, { id: "desc" }],
        }),
      ]);

      return { issues, count };
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
        include: {
          createdBy: { select: { id: true, name: true } },
        },
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
  })
  .mutation("create", {
    input: zIssueCreateArgs,
    async resolve({ ctx, input }) {
      const user = await ctx.requireUser();
      return await ctx.prisma.issue.create({
        data: {
          ...input,
          createdByUserId: user.id,
          events: {
            // Create the INITIAL event for history purposes:
            create: {
              type: "INITIAL",
              createdByUserId: user.id,
              ...input,
            },
          },
        },
      });
    },
  })
  // Adds an event, e.g. adding a comment or updating the status:
  .mutation("addEvent", {
    input: zIssueCreateArgs.partial().extend({
      issueId: z.number().int(),

      comment: z.string().min(1).max(10_000).optional(),
    }),
    async resolve({ ctx, input: { issueId, comment, ...issueChanges } }) {
      const user = await ctx.requireUser();
      const [issue, event] = await ctx.prisma.$transaction([
        // Update the Issue (including the updatedAt timestamp):
        ctx.prisma.issue.update({
          where: { id: issueId },
          data: issueChanges,
        }),
        // Create the IssueEvent:
        ctx.prisma.issueEvent.create({
          data: {
            ...issueChanges,
            comment,
            issueId,
            createdByUserId: user.id,
            type: "UPDATE",
          },
        }),
      ]);

      return { issue, event };
    },
  });
