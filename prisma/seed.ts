/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from "@prisma/client";
import { range } from "lodash";

const prisma = new PrismaClient();

async function main() {
  // Insert test posts to an empty database:
  if ((await prisma.issue.count()) === 0) {
    const testIssueNums = range(1, 100 + 1);

    await prisma.$transaction([
      // Dev users: Admin and User
      prisma.user.create({
        data: {
          id: "admin-id",
          name: "Admin",
          email: "admin@example.com",
        },
      }),
      prisma.user.create({
        data: {
          id: "user-id",
          name: "User",
          email: "user@example.com",
        },
      }),
      // Example user for inserting the example data:
      prisma.user.create({
        data: {
          id: "example-user-id",
          name: "Example User",
          email: "example-user@example.com",
          // Insert test issues:
          issues: {
            createMany: {
              data: testIssueNums.map((issueNum) => ({
                title: `Example Issue ${issueNum}`,
              })),
            },
          },
        },
      }),
      // The newest issue should have 100 test comments:
      // Prisma doesn't allow nested linked "createMany"s so do this in a separate insert:
      prisma.issue.create({
        data: {
          title: "Example issue with comments",
          createdByUserId: "example-user-id",
          events: {
            createMany: {
              data: range(1, 100 + 1).map((commentNum) => ({
                comment: `Example Comment ${commentNum}`,
                createdByUserId: "example-user-id",
              })),
            },
          },
        },
      }),
    ]);
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
