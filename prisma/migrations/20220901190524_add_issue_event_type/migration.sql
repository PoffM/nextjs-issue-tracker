/*
  Warnings:

  - Added the required column `type` to the `IssueEvent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IssueEventType" AS ENUM ('INITIAL', 'UPDATE');

-- AlterTable
ALTER TABLE "IssueEvent" ADD COLUMN     "type" "IssueEventType" NOT NULL;
