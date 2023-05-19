import { Issue, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { compact } from "lodash";
import { z } from "zod";
import { t } from "../trpc";

export const zIssueListSortOrder = z.object({
  field: z.enum(["createdAt", "updatedAt", "id"]),
  direction: z.enum(["asc", "desc"]),
});

const zIssueStatusEnum = z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]);

const zIssueCreateArgs = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10_000).optional(),
  status: zIssueStatusEnum.optional(),
});

const userShallowInclude = { select: { id: true, name: true } } as const;

/** Convert a user-supplied string to a Postgres tsquery-safe search string. */
function safeSearchString(rawSearchText: string) {
  return (
    rawSearchText
      // Remove all non-searchable characters e.g. !@#<>?
      .replaceAll(/[^a-zA-Z0-9\s]/g, " ")
      .trim()
      // Replace spaces with "&", e.g. "Example Issue" -> "Example&Issue"
      .replaceAll(/\s+/g, "&")
  );
}

export const issueRouter = t.router({
  findOne: t.procedure
    .input(
      z.object({
        id: z.number().int(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.issue.findUnique({
        include: { createdBy: userShallowInclude },
        where: { id: input.id },
      });
    }),
  list: t.procedure
    .input(
      z.object({
        take: z.number().min(0).max(50),
        skip: z.number(),
        order: zIssueListSortOrder.default({
          field: "id",
          direction: "desc",
        }),
        filter: z
          .object({
            status: z.enum(["OPEN", "CLOSED"]).optional(),
            search: z.string().transform(safeSearchString).optional(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input: { take, skip, order, filter } }) => {
      // Ensure keyof Issue here for better type safety:
      const orderField: keyof Issue = order.field;
      const where: Prisma.IssueWhereInput | undefined = filter && {
        status: {
          in:
            filter.status === "CLOSED"
              ? ["CLOSED", "RESOLVED"]
              : ["NEW", "IN_PROGRESS"],
        },
        ...(filter.search && {
          OR: {
            title: { search: filter.search },
            description: { search: filter.search },
          },
        }),
      };

      const [count, records] = await ctx.prisma.$transaction([
        ctx.prisma.issue.count({ where }),
        ctx.prisma.issue.findMany({
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            status: true,
          },
          where,
          take,
          skip,
          orderBy: [{ [orderField]: order.direction }, { id: "desc" }],
        }),
      ]);

      return { records, count };
    }),
  listEvents: t.procedure
    .input(
      z.object({
        issueId: z.number().int(),
        cursor: z.number().int().optional(),
      })
    )
    .query(async ({ ctx, input: { issueId, cursor } }) => {
      const limit = 20;

      const items = await ctx.prisma.issueEvent.findMany({
        include: {
          createdBy: userShallowInclude,
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
    }),
  create: t.procedure
    .input(zIssueCreateArgs)
    .mutation(async ({ ctx, input }) => {
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
    }),
  delete: t.procedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sessionUser = await ctx.requireUser();
      const dbUser = await ctx.prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { roles: true },
      });

      if (!dbUser?.roles.includes("ADMIN")) {
        throw new TRPCError({
          message: "Must be an Admin to delete an Issue.",
          code: "UNAUTHORIZED",
        });
      }

      const issue = await ctx.prisma.issue.delete({
        where: { id: input.id },
      });

      return issue;
    }),
  addEvent: t.procedure
    .input(
      zIssueCreateArgs.partial().extend({
        issueId: z.number().int(),

        comment: z.string().min(1).max(10_000).optional(),
      })
    )
    .mutation(async ({ ctx, input: { issueId, ...eventAttributes } }) => {
      const user = await ctx.requireUser();

      // Ignore the provided status when it's the same as the current status:
      {
        const currentIssue = await ctx.prisma.issue.findUnique({
          where: { id: issueId },
        });
        if (currentIssue?.status === eventAttributes.status) {
          delete eventAttributes.status;
        }
      }

      if (!compact(Object.values(eventAttributes)).length) {
        throw new Error("Submission can't be empty.");
      }

      const { comment, ...issueChanges } = eventAttributes;

      const [issue, event] = await ctx.prisma.$transaction([
        // Update the Issue (including the updatedAt timestamp):
        ctx.prisma.issue.update({
          where: { id: issueId },
          data: {
            ...issueChanges,
            // For some reason Prisma doesn't set updatedAt automatically. TODO figure out why.
            updatedAt: new Date().toISOString(),
          },
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
    }),
});
