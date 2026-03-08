/*
  Warnings:

  - You are about to drop the column `processed` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `processedBy` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the `ModerationTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED', 'ESCALATED');

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_processedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_taskId_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "processed",
DROP COLUMN "processedAt",
DROP COLUMN "processedBy",
DROP COLUMN "taskId",
ADD COLUMN     "moderatorComment" TEXT,
ADD COLUMN     "moderatorId" INTEGER,
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'OPEN';

-- DropTable
DROP TABLE "public"."ModerationTask";

-- DropEnum
DROP TYPE "public"."TaskStatus";

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
