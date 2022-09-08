-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" "UserRole"[];
