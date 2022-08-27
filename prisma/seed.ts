/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from "@prisma/client";
import { range } from "lodash";

const prisma = new PrismaClient();

async function main() {
  // Insert test posts:
  if ((await prisma.issue.count()) === 0) {
    const testIssueNums = range(1, 100 + 1);

    await prisma.$transaction([
      prisma.issue.createMany({
        data: testIssueNums.map((num) => ({
          title: `Test Issue ${num}`,
        })),
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
