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
      // Insert test issues:
      prisma.issue.createMany({
        data: testIssueNums.map((issueNum) => ({
          title: `Test Issue ${issueNum}`,
        })),
      }),
      // The newest issue should have 100 test comments:
      prisma.issue.create({
        data: {
          title: "Test issue with comments",
          events: {
            createMany: {
              data: range(1, 100 + 1).map((commentNum) => ({
                comment: `Test Comment ${commentNum}`,
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
